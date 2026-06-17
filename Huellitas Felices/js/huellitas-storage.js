const API_URL = "https://6a307514a7f8866418d60ad9.mockapi.io/api";

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    configurarFormularios();
    configurarBotonesAdopcion();
    configurarCarrito();
    configurarBusqueda();
    actualizarContadorCarrito();
    configurarFiltrosAdopcion();
});

// SESIÓN DE USUARIO
function verificarSesion() {
    const usuarioLogueado = getUsuarioLogueado();
    const btnNavAuth = document.getElementById("btnNavAuth")
    const alertasBloqueo = document.querySelectorAll(".alert-warning");

    if (usuarioLogueado) {
        if (btnNavAuth) {
            btnNavAuth.removeAttribute("data-bs-toggle");
            btnNavAuth.removeAttribute("data-bs-target");
            btnNavAuth.innerHTML = `<i class="bi bi-box-arrow-right text-danger" title="Cerrar Sesión (${usuarioLogueado.nombre})"></i>`;
            btnNavAuth.onclick = (e) => {
               // e.preventDefault();
                cerrarSesion();
            };
        }
        alertasBloqueo.forEach(a => {
            a.classList.remove("d-flex");
            a.classList.add("d-none");
        });
    } else {
        if (btnNavAuth) {
            btnNavAuth.setAttribute("data-bs-toggle", "modal");
            btnNavAuth.setAttribute("data-bs-target", "#modalAuth");
            btnNavAuth.innerHTML = `<i class="bi bi-person-circle"></i>`;
        }
    }
}

function getUsuarioLogueado() {
    try {
        return JSON.parse(sessionStorage.getItem("usuarioHuellitas"));
    } catch {
        return null;
    }
}

function cerrarSesion() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Tendrás que ingresar de nuevo para enviar solicitudes.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem("usuarioHuellitas");
            Swal.fire({
                title: "Sesión cerrada",
                text: "¡Vuelve pronto!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.reload();
            });
        }
    });
}

// BASE DE DATOS LOCAL (localStorage)
function getDB() {
    try {
        return JSON.parse(localStorage.getItem("huellitasDB")) || { usuarios: [], adopciones: [], carrito: [] };
    } catch {
        return { usuarios: [], adopciones: [], carrito: [] };
    }
}

function saveDB(db) {
    localStorage.setItem("huellitasDB", JSON.stringify(db));
}

// CONFIGURACIÓN DE FORMULARIOS
function configurarFormularios() {
    const formRegistro = document.getElementById("registroUsuario");
    const formLogin = document.getElementById("loginUsuario");
    const formAdopcion = document.getElementById("formAdopcion");

    // REGISTRO
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("registroNombre")?.value.trim();
            const email = document.getElementById("registroEmail")?.value.trim().toLowerCase();
            const password = document.getElementById("registroPassword")?.value;

            if (!nombre || !email || !password) {
                Swal.fire("Error", "Todos los campos son obligatorios.", "error");
                return;
            }
            if (password.length < 6) {
                Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
                return;
            }

            // Intentar con MockAPI primero
            try {
                Swal.showLoading();
                const resCheck = await fetch(`${API_URL}/usuarios`);
                if (resCheck.ok) {
                    const usuarios = await resCheck.json();
                    if (usuarios.find(u => u.email === email)) {
                        Swal.fire("Error", "Este correo ya está registrado.", "error");
                        return;
                    }
                    const nuevoUsuario = { nombre, email, password };
                    const response = await fetch(`${API_URL}/usuarios`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(nuevoUsuario)
                    });
                    if (response.ok) {
                        Swal.fire({
                            title: "¡Registro Exitoso!",
                            text: "Ya puedes iniciar sesión.",
                            icon: "success",
                            confirmButtonColor: "#198754"
                        }).then(() => {
                            formRegistro.reset();
                            const tabLogin = document.getElementById("tab-login");
                            if (tabLogin) tabLogin.click();
                        });
                        return;
                    }
                }
            } catch {
            }

            // Fallback LOCAL
            const db = getDB();
            if (db.usuarios.find(u => u.email === email)) {
                Swal.fire("Error", "Este correo ya está registrado.", "error");
                return;
            }
            const nuevoId = Date.now().toString();
            db.usuarios.push({ id: nuevoId, nombre, email, password });
            saveDB(db);

            Swal.fire({
                title: "¡Registro Exitoso!",
                text: "Ya puedes iniciar sesión.",
                icon: "success",
                confirmButtonColor: "#198754"
            }).then(() => {
                formRegistro.reset();
                const tabLogin = document.getElementById("tab-login");
                if (tabLogin) tabLogin.click();
            });
        });
    }

    // 2. LOGIN
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
            const password = document.getElementById("loginPassword")?.value;

            if (!email || !password) {
                Swal.fire("Error", "Ingresa correo y contraseña.", "error");
                return;
            }

            let usuarioValido = null;

            // Intentar MockAPI
            try {
                Swal.showLoading();
                const response = await fetch(`${API_URL}/usuarios`);
                if (response.ok) {
                    const usuarios = await response.json();
                    usuarioValido = usuarios.find(u => u.email === email && u.password === password);
                }
            } catch {
            }

            // Fallback LOCAL
            if (!usuarioValido) {
                const db = getDB();
                usuarioValido = db.usuarios.find(u => u.email === email && u.password === password);
            }

            if (usuarioValido) {
                sessionStorage.setItem("usuarioHuellitas", JSON.stringify({
                    id: usuarioValido.id || usuarioValido._id,
                    nombre: usuarioValido.nombre,
                    email: usuarioValido.email
                }));

                const modalEl = document.getElementById("modalAuth");
                if (modalEl) {
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();
                }

                Swal.fire({
                    title: `¡Bienvenido, ${usuarioValido.nombre}!`,
                    text: "Has ingresado correctamente.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire("Error", "Correo o contraseña incorrectos.", "error");
            }
        });
    }

    // 3. ADOPCIÓN
    if (formAdopcion) {
        formAdopcion.addEventListener("submit", async (e) => {
            e.preventDefault();

            const usuarioLogueado = getUsuarioLogueado();
            if (!usuarioLogueado) {
                const modalAdopcion = document.getElementById("modalAdopcion");
                if (modalAdopcion) {
                    bootstrap.Modal.getInstance(modalAdopcion)?.hide();
                }
                const modalAuth = new bootstrap.Modal(document.getElementById("modalAuth"));
                modalAuth.show();
                Swal.fire("Acceso Restringido", "Debes iniciar sesión para procesar una adopción.", "warning");
                return;
            }

            const adopcionData = {
                usuarioId: usuarioLogueado.id,
                usuarioNombre: usuarioLogueado.nombre,
                usuarioEmail: usuarioLogueado.email,
                mascota: document.getElementById("inputNombreMascota")?.value || "",
                experiencia: document.getElementById("selectExperiencia")?.value || "",
                vivienda: document.getElementById("selectVivienda")?.value || "",
                motivo: document.getElementById("txtMotivo")?.value.trim() || "",
                fechaSolicitud: new Date().toLocaleDateString()
            };

            if (!adopcionData.mascota || !adopcionData.motivo) {
                Swal.fire("Error", "Completa todos los campos.", "error");
                return;
            }

            let exito = false;

            // Intentar MockAPI
            try {
                Swal.showLoading();
                const response = await fetch(`${API_URL}/adopciones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(adopcionData)
                });
                if (response.ok) exito = true;
            } catch {
                // Fallback
            }

            // Fallback LOCAL
            if (!exito) {
                const db = getDB();
                db.adopciones.push({ ...adopcionData, id: Date.now().toString() });
                saveDB(db);
                exito = true;
            }

            if (exito) {
                const modalAdopcion = document.getElementById("modalAdopcion");
                if (modalAdopcion) bootstrap.Modal.getInstance(modalAdopcion)?.hide();

                Swal.fire({
                    title: "¡Postulación Enviada!",
                    text: `Tu solicitud para adoptar a ${adopcionData.mascota} ha sido registrada. Nuestro equipo te contactará.`,
                    icon: "success",
                    confirmButtonColor: "#198754"
                }).then(() => {
                    formAdopcion.reset();
                });
            } else {
                Swal.fire("Error", "Hubo un problema al enviar tu solicitud.", "error");
            }
        });
    }
}

// BOTONES DE ADOPCIÓN
function configurarBotonesAdopcion() {
    const botones = document.querySelectorAll(".btn-abrir-adopcion");
    const inputNombre = document.getElementById("inputNombreMascota");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const nombreMascota = boton.getAttribute("data-mascota");
            if (inputNombre) {
                inputNombre.value = nombreMascota;
            }
            const modalAdopcion = new bootstrap.Modal(document.getElementById("modalAdopcion"));
            modalAdopcion.show();
        });
    });
}

// CARRITO DE COMPRAS
function configurarCarrito() {
    document.querySelectorAll(".btn-agregar-carrito, .card-producto .btn-success, .tarjeta-producto .btn-success").forEach(btn => {
        btn.addEventListener("click", function (e) {
            let nombre = this.getAttribute("data-nombre");
            if (!nombre) {
                const card = this.closest(".card, .tarjeta-producto");
                if (card) {
                    const titulo = card.querySelector("h6, .card-title, h5");
                    if (titulo) nombre = titulo.textContent.trim();
                }
            }
            if (!nombre) nombre = "Producto";
            let precio = 0;
            const card = this.closest(".card, .tarjeta-producto");
            if (card) {
                const precioEl = card.querySelector(".text-success.fw-bold, .fw-bold.mb-3");
                if (precioEl) {
                    const match = precioEl.textContent.match(/[\d.]+/);
                    if (match) precio = parseFloat(match[0]);
                }
            }

            agregarAlCarrito(nombre, precio);
        });
    });
}

function agregarAlCarrito(nombre, precio = 0) {
    const db = getDB();
    if (!db.carrito) db.carrito = [];

    const existente = db.carrito.find(item => item.nombre === nombre);
    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        db.carrito.push({ nombre, precio, cantidad: 1 });
    }
    saveDB(db);
    actualizarContadorCarrito();

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
    Toast.fire({
        icon: 'success',
        title: `¡${nombre} añadido al carrito!`
    });
}

function actualizarContadorCarrito() {
    const db = getDB();
    const total = (db.carrito || []).reduce((sum, item) => sum + (item.cantidad || 0), 0);
    document.querySelectorAll(".badge.rounded-pill.bg-danger").forEach(badge => {
        badge.textContent = total;
    });
}

// FILTROS DE ADOPCIÓN
function configurarFiltrosAdopcion() {
    const btns = document.querySelectorAll(".btn-filtro-activo, .d-flex.justify-content-center.gap-2 .btn");
    if (!btns.length) return;
    const cards = document.querySelectorAll(".card-mascota");
    btns.forEach(btn => {
        btn.addEventListener("click", function () {
            btns.forEach(b => {
                b.classList.remove("btn-success", "btn-filtro-activo");
                b.classList.add("btn-light", "text-muted");
            });
            this.classList.add("btn-success");
            this.classList.remove("btn-light", "text-muted");
            const filtro = this.textContent.trim().toLowerCase();
            cards.forEach(card => {
                const col = card.closest(".col-12");
                if (!col) return;
                const texto = card.textContent.toLowerCase();
                if (filtro === "todos" || texto.includes(filtro)) {
                    col.style.display = "";
                } else {
                    col.style.display = "none";
                }
            });
        });
    });
}

// BÚSQUEDA
function configurarBusqueda() {
    const btnBuscar = document.getElementById("btn-buscar-navbar");
    if (btnBuscar) {
        btnBuscar.addEventListener("click", function (e) {
            e.preventDefault();
            Swal.fire({
                title: '¿Qué estás buscando?',
                input: 'text',
                inputPlaceholder: 'Ej. Alimento, Perros, Citas...',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Buscar',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'btn btn-success px-4 mx-2',
                    cancelButton: 'btn btn-secondary px-4 mx-2'
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    const query = result.value.toLowerCase();
                    // Redirigir según la búsqueda
                    if (query.includes("alimento") || query.includes("comida") || query.includes("producto")) {
                        window.location.href = "petshop.html";
                    } else if (query.includes("perro") || query.includes("gato") || query.includes("adopt")) {
                        window.location.href = "adopcion.html";
                    } else if (query.includes("cita") || query.includes("consulta") || query.includes("servicio") || query.includes("medico")) {
                        window.location.href = "servicios.html";
                    } else if (query.includes("nosotros") || query.includes("fundacion") || query.includes("contacto")) {
                        window.location.href = "nosotros.html";
                    } else {
                        Swal.fire({
                            title: 'Resultados',
                            text: `Buscando: "${result.value}". Redirigiendo a la página principal...`,
                            icon: 'info',
                            confirmButtonColor: '#198754'
                        }).then(() => {
                            window.location.href = "index.html";
                        });
                    }
                }
            });
        });
    }
}
