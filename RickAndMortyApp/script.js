  const grid = document.getElementById('characters-grid');

// La API devuelve los datos en ingles pero con estas constantes la traduce al español

const traducirEstado = {
  'Alive'   : 'Vivo',
  'Dead'    : 'Muerto',
  'unknown' : 'Desconocido'
};
const traducirEspecie = {
  'Human'                : 'Humano',
  'Alien'                : 'Alien',
  'Humanoid'             : 'Humanoide',
  'Robot'                : 'Robot',
  'Animal'               : 'Animal',
  'Disease'              : 'Enfermedad',
  'Cronenberg'           : 'Cronenberg',
  'Mythological Creature': 'Criatura Mitológica',
  'unknown'              : 'Desconocido'
};
const traducirGenero = {
  'Male'       : 'Masculino',
  'Female'     : 'Femenino',
  'Genderless' : 'Sin género',
  'unknown'    : 'Desconocido'
};

// Función del estado del personaje
function obtenerClaseBadge(status) {
  if (status === 'Alive') return 'status-vivo';
  if (status === 'Dead')  return 'status-muerto';
  return 'status-desconocido';
}

function crearTarjeta(personaje) {

  const estadoES  = traducirEstado[personaje.status]   || personaje.status;
  const especieES = traducirEspecie[personaje.species] || personaje.species;
  const generoES  = traducirGenero[personaje.gender]   || personaje.gender;

  const columna = document.createElement('div');
  columna.className = 'col';

  //HTML interno de la tarjeta.
  //Las imagenes, nombres estan llamandose directamente desde la Api 
  columna.innerHTML = `
    <div class="card h-100">
    
      <img src="${personaje.image}" class="card-img-top" alt="Foto de ${personaje.name}">

      <div class="card-body">

        <!-- Nombre del personaje -->
        <h5 class="card-title" title="${personaje.name}">${personaje.name}</h5>

        <!-- Badge de estado con punto de color -->
        <span class="status-badge ${obtenerClaseBadge(personaje.status)}">
          <span class="dot"></span>
          ${estadoES}
        </span>

        <!-- Especie y género ya traducidos al español -->
        <p class="card-text"><span class="label">Especie:</span> ${especieES}</p>
        <p class="card-text"><span class="label">Género:</span>  ${generoES}</p>

      </div>
    </div>
  `;

  return columna;
}

//Consumo de la API con fetch() y método GET

fetch('https://rickandmortyapi.com/api/character')

  .then(function(respuesta) {
    return respuesta.json();
  })
  .then(function(datos) {
    datos.results.forEach(function(personaje) {
      const tarjeta = crearTarjeta(personaje);
      grid.appendChild(tarjeta); 
    });
  })

  .catch(function(error) {
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <p> Ojito  No se pudieron cargar los personajes. Error: ${error.message}</p>
      </div>
    `;
  });
