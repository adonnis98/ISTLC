console.log("Hola Mundo");
//=>
mostrarActoresTabla();

function mostrarActoresTabla() {
  fetch("http://cine.runasp.net/api/Actores")
    .then((respuesta) => respuesta.json())
    .then((informacion) => {
      console.log(informacion);
      const body = document.getElementById("bodyTabla");

      informacion.forEach((Element) => {
        body.innerHTML += `<tr>
    <th>${Element.idActor}</th>
    <th>${Element.nombre}</th>
    <th>${Element.imagen}</th>
    <th>${Element.fechaNacimiento}</th>
    <th>${Element.nacionalidad}</th>
</tr>`;
      });
      console.log(body);
    })
    .catch((error) => console.log(error));
}

// tener todos los actores
function obtenerActoresPorId() {
  fetch("http://cine.runasp.net/api/Actores")
    .then((respuesta) => respuesta.json())
    .then((information) => console.log(information))
    .catch((error) => console.log(error));
}

//buscar un actor por id
function obtenerActorPorId(id) {
  fetch("http://cine.runasp.net/api/Actores/28")
    .then((respuesta) => respuesta.json())
    .then((information) => console.log(information))
    .catch((error) => console.log(error));
}

function limpiarFormulario() {
    document.getElementById("txtnombre").value = "";
    document.getElementById("txtimagen").value = "";
    document.getElementById("txtfechaNacimiento").value = "";
    document.getElementById("txtnacionalidad").value = "";
}

//crear un nuevo actor
function guardarActor() {
    const nombreActor = document.getElementById("txtnombre").value;
    const imagenActor = document.getElementById("txtimagen").value;
    const fechaNacimientoActor = document.getElementById("txtfechaNacimiento").value;
    const nacionalidadActor = document.getElementById("txtnacionalidad").value;

const actor = {
  nombre: nombreActor,
  imagen: imagenActor,
  fechaNacimiento: fechaNacimientoActor,
  nacionalidad: nacionalidadActor,
};
fetch("http://cine.runasp.net/api/Actores", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(actor),
})
  .then((respuesta) => respuesta.json())
  .then((informacion) => {
    limpiarFormulario()
    alert(informacion.mensaje);
    mostrarActoresTabla();
    console.log(informacion.mensaje);
  })
  .catch((error) => console.log(error));}

//{}

//actualizar un actor
function actualizarActor(id) {
  const actorActualizar = {
    nombre: "Adonnis P",
    imagen: "WuW",
    fechaNacimiento: "2026-06-06T00:00:00",
    nacionalidad: "Noxiano",
  };
  fetch(`http://cine.runasp.net/api/Actores/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(actorActualizar),
  })
    .then((respuesta) => respuesta.json())
    .then((informacion) => console.log(informacion))
    .catch((error) => console.log(error));
}

//eliminar un actor
function eliminarActor(id) {
  //27
  fetch(`http://cine.runasp.net/api/Actores/`, {
    method: "DELETE",
  })
    .then((respuesta) => respuesta.json())
    .then((informacion) => console.log(informacion))
    .catch((error) => console.log(error));
}
