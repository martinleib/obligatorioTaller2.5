// Cami, no borres los console logs, los uso para debuggear.
const apiBase = "https://movetrack.develotion.com";
const imageBase = "https://movetrack.develotion.com/imgs/";
const ruteo = document.querySelector("ion-router");
// sesiones = actividades hechas por el usuario
const sesiones = [];
let isListPrinted = false;
let jwt;
let userId;
let map;

function inicio() {
  ocultarSecciones();
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != undefined
  ) {
    mostrarMenu("logueado");
    ruteo.setAttribute("url", "/actividad");
  } else {
    mostrarMenu("deslogueado");
    ruteo.setAttribute("url", "/ingresar");
  }

  document.querySelector("#ingresar").style.display = "block";
  ruteo.addEventListener("ionRouteDidChange", mostrarPagina);
  getCountries();
}

document.addEventListener("DOMContentLoaded", inicio);

function ocultarSecciones() {
  document.querySelectorAll("ion-page").forEach((seccion) => {
    seccion.style.display = "none";
  });
}

function mostrarMenu(clase) {
  let opcionesMenu = document.querySelectorAll("ion-menu ion-item");
  opcionesMenu.forEach((opcion) => {
    opcion.style.display = "none";
    if (opcion.classList.contains(clase)) {
      opcion.style.display = "inline";
    }
  });
}

//OBTENER PAISES
const getCountries = async () => {
  try {
    const response = await fetch(apiBase + "/paises.php");
    const json = await response.json();
    printCountries(json);
    return json;
  } catch (error) {
    console.log(error.message);
  }
};

const getCountriesWithUsers = async () => {
  try {
    const response = await fetch(apiBase + "/usuariosPorPais.php", {
      headers: {
        "Content-Type": "application/json",
        apikey: localStorage.getItem("token"),
        iduser: localStorage.getItem("userId"),
      },
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
};

const getAndPrintMap = async () => {
  try {
    const [signupCountriesData, userCountriesData] = await Promise.all([
      getCountries(),
      getCountriesWithUsers(),
    ]);

    const signupCountries = signupCountriesData.paises;
    const userCountries = userCountriesData.paises;

    const mergedCountries = [];

    for (let i = 0; i < signupCountries.length; i++) {
      const country = signupCountries[i];
      let userCount = 0;

      for (let j = 0; j < userCountries.length; j++) {
        if (userCountries[j].id === country.id) {
          userCount = userCountries[j].cantidadDeUsuarios;
          break;
        }
      }

      mergedCountries.push({
        ...country,
        cantidadDeUsuarios: userCount,
      });
    }

    printMap(mergedCountries);
  } catch (error) {
    console.error("Error fetching or processing countries:", error);
  }
};

function printMap(countries) {
  if (map != null) {
    map.remove();
  }
  map = L.map("map").fitWorld();

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  const markers = [];
  countries.forEach((country) => {
    const marker = L.marker([country.latitude, country.longitude]).addTo(map);
    marker.bindPopup(
      `<b>${country.name}</b><br>Moneda: ${country.currency}<br>Usuarios: ${country.cantidadDeUsuarios}`
    );
    markers.push([country.latitude, country.longitude]);
  });

  const bounds = L.latLngBounds(markers);
  map.fitBounds(bounds);
}

const printCountries = (countries) => {
  const select = document.querySelector("#txtPais");
  select.innerHTML = ""; // Limpiar opciones previas
  countries.paises.forEach((country) => {
    const option = document.createElement("ion-select-option");
    option.textContent = country.name;
    option.value = country.id;
    select.appendChild(option);
  });
};

// Manejo de rutas
function mostrarPagina(event) {
  ocultarSecciones();
  let paginaDestino = event.detail.to; // Ruta a la que se navega

  switch (paginaDestino) {
    case "/ingresar":
      document.querySelector("#ingresar").style.display = "block";
      break;
    case "/registro":
      getCountries();
      document.querySelector("#registro").style.display = "block";
      break;
    case "/agregar-sesion":
      getActividades();
      document.querySelector("#registroactividades").style.display = "block";
      break;
    case "/actividades-realizadas":
      document.querySelector("#verRegistros").style.display = "block";
      // ruteo.push("/actividades-realizadas");
      break;
    case "/estadisticas":
      mostrarInforme();
      document.querySelector("#informe").style.display = "block";
      break;
    case "/mapa":
      getAndPrintMap();
      document.querySelector("#mapa").style.display = "block";
      break;
    default:
      localStorage.clear();
      mostrarMenu("deslogueado");
      ruteo.push("/ingresar");
  }
}

// REGISTRO
async function register() {
  try {
    let usuario = document.querySelector("#txtUsuario").value.trim();
    let password = document.querySelector("#txtPassword").value.trim();
    let idPais = document.querySelector("#txtPais").value;

    if (!usuario || !password || !idPais)
      throw new Error("Todos los campos son obligatorios");

    let user = { usuario, password, idPais };
    const response = await fetch(apiBase + "/usuarios.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const json = await response.json();

    if (json.codigo == 200) {
      vermensaje("Registro exitoso", 2000);
      jwt = json.apiKey;
      userId = json.id;
      localStorage.setItem("token", json.apiKey);
      limpiarcamposRegistro();

      setTimeout(() => {
        mostrarMenu("logueado");
        document.querySelector("#registroactividades").style.display = "block";
        ruteo.push("/actividad");
        getActividades();
      }, 1000);
    } else {
      vermensaje(json.mensaje);
    }
  } catch (error) {
    vermensaje(error.message);
  }
}

//LOGIN
async function login() {
  try {
    let usuario = document.querySelector("#tNombre").value.trim();
    let password = document.querySelector("#tPassword").value.trim();

    if (!usuario || !password)
      throw new Error("Todos los campos son obligatorios");

    let user = { usuario, password };

    const response = await fetch(apiBase + "/login.php", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(user),
    });

    const json = await response.json();

    if (json.codigo == 200) {
      jwt = json.apiKey;
      userId = json.id;
      localStorage.setItem("token", json.apiKey);
      localStorage.setItem("userId", json.id);

      limpiarcamposlogin();

      vermensaje("Inicio de sesion exitoso");

      setTimeout(() => {
        mostrarMenu("logueado");
        document.querySelector("#registroactividades").style.display = "block";
        ruteo.push("/actividad");
        document.querySelector("#messages").innerHTML = "";
        console.log("Calling getActividades() after login");
        getActividades();
      }, 1000);
    } else {
      vermensaje(json.mensaje);
    }
  } catch (error) {
    vermensaje(error.message);
  }
}

function limpiarcamposRegistro() {
  document.querySelector("#txtUsuario").value = "";
  document.querySelector("#txtPassword").value = "";
}

function limpiarcamposlogin() {
  document.querySelector("#tNombre").value = "";
  document.querySelector("#tPassword").value = "";
}

function vermensaje(mensaje, tiempo = 1500) {
  let toast = document.createElement("ion-toast");
  toast.message = mensaje;
  toast.duration = tiempo;
  toast.position = "bottom";
  document.body.appendChild(toast);
  toast.present();
}

//BOTONES
document.querySelector("#btnRegistrarse").addEventListener("click", register);
document.querySelector("#btnIngresar").addEventListener("click", async () => {
  await login();
  activitiesLoaded = false;
});
document
  .querySelector("#btnRegistrarActividad")
  .addEventListener("click", async () => {
    await registrarActividad();
    activitiesLoaded = false;
  });
document.querySelector("#verRegistros").addEventListener("click", async () => {
  await printRegisteredActivities();
});
document
  .querySelector("#btnLastWeek")
  .addEventListener("click", filterLastWeek);
document
  .querySelector("#btnLastMonth")
  .addEventListener("click", filterLastMonth);
document.querySelector("#btnAll").addEventListener("click", async () => {
  activitiesLoaded = false;
  await printRegisteredActivities();
});

function cerrarMenu() {
  const menu = document.querySelector("ion-menu");
  menu.close();
}

//OBTENER ACTIVIDADES
let savedActivities = null;
async function getActividades() {
  console.log("getActividades() called");
  if (savedActivities) {
    console.log("retornando actividades guardadas");
    return savedActivities;
  }

  try {
    const response = await fetch(apiBase + "/actividades.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: localStorage.getItem("token"),
        iduser: localStorage.getItem("userId"),
      },
    });
    const actividades = await response.json();
    console.log(actividades);
    showActivitiesSelect(actividades.actividades);
    savedActivities = actividades.actividades;
    return savedActivities;
  } catch (error) {
    console.log(error.message);
    return [];
  }
}


const showActivitiesSelect = (actividades) => {
  const select = document.querySelector("#selectActividades");

  select.innerHTML = "";

  actividades.forEach((actividad) => {
    const option = document.createElement("ion-select-option");
    option.textContent = actividad.nombre;
    option.value = actividad.id;
    select.appendChild(option);
  });
};

async function getSesiones() {
  try {
    const response = await fetch(
      apiBase + "/registros.php?idUsuario=" + localStorage.getItem("userId"),
      {
        headers: {
          "Content-Type": "application/json",
          apikey: localStorage.getItem("token"),
          iduser: localStorage.getItem("userId"),
        },
      }
    );
    const registros = await response.json();
    console.log("Cargando sesiones registradas por el usuario dinámicamente");
    console.log(registros);

    sesiones.length = 0;
    sesiones.push(...registros.registros);

    console.log("Sesiones registradas por el usuario: " + sesiones);
  } catch (error) {
    console.log(error);
  }
}

//REGISTRAR NUEVA ACTIVIDAD
async function registrarActividad() {
  try {
    let idActividad = document.querySelector("#selectActividades").value;
    let fecha = document.querySelector("#fecha").value;
    let tiempo = document.querySelector("#tiempo").value;

    if (!idActividad) {
      throw new Error("Seleccionar una actividad");
    }
    if (!fecha) {
      throw new Error("Ingresar una fecha");
    }
    if (!tiempo) {
      throw new Error("Ingresar una duracion");
    }
    if (isNaN(tiempo) || tiempo <= 0) {
      throw new Error("La duracion debe ser un numero mayor que 0");
    }

    // Podríamos separar la lógica del parseo de fechas en otra función
    console.log(`Fecha pre-parseo: ${fecha}`);
    const fechaSelec = new Date(fecha);
    const fechaHoy = new Date();
    // No se envía la hora y a la hora de comparar las fechas no importa la hora tampoco
    // Seteo la hora a cero de ambos porque sino el if que viene ahí abajo te va a dar false siempre
    fechaSelec.setHours(0, 0, 0, 0);
    fechaHoy.setHours(0, 0, 0, 0);

    console.log(`Fecha seleccionada: ${fechaSelec}`);
    console.log(`Fecha de hoy: ${fechaHoy}`);

    if (fechaSelec.getTime() > fechaHoy.getTime()) {
      throw new Error("La fecha no puede ser posterior al dia de hoy");
    }

    const nuevaActividad = {
      idActividad: idActividad,
      idUsuario: localStorage.getItem("userId"),
      tiempo: parseInt(tiempo),
      fecha: fecha,
    };

    try {
      const response = await fetch(apiBase + "/registros.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: localStorage.getItem("token"),
          iduser: localStorage.getItem("userId"),
        },
        body: JSON.stringify(nuevaActividad),
      });

      const actividadPusheada = await response.json();
      console.log(actividadPusheada);
      vermensaje("Actividad registrada");
      await getSesiones();
      printRegisteredActivities();
      limpiarCamposRegistroActividades();
    } catch (error) {
      vermensaje(error.message, 1500);
    }
  } catch (error) {
    vermensaje(error.message, 1500);
  }
}

let activitiesLoaded = false;
async function printRegisteredActivities(filteredSesiones = null) {
  if (activitiesLoaded && !filteredSesiones) return;

  console.log("Obteniendo las sesiones del usuario...");
  if (!filteredSesiones) {
    await getSesiones();
    console.log("Sesiones obtenidas:", sesiones);
  }

  const listContainer = document.querySelector("#list-actividades");
  listContainer.innerHTML = "";
  isListPrinted = true;

  const sesionesToPrint = filteredSesiones || sesiones;

  for (let i = 0; i < sesionesToPrint.length; i++) {
    const sesion = sesionesToPrint[i];
    console.log(`Buscando nombre de actividad con ID: ${sesion.idActividad}`);
    let actividadName = await getActividadName(sesion.idActividad);
    console.log(`Actividad encontrada: ${actividadName}`);
    console.log(`Buscando imagen de actividad con ID: ${sesion.idActividad}`);
    let actividadImage = await getActividadImage(sesion.idActividad);
    console.log(`Imagen encontrada: ${actividadImage}`);

    const listItem = document.createElement("ion-item");
    listItem.classList.add("activity-item");

    listItem.innerHTML = `
      <ion-thumbnail slot="start">
        <img src="${actividadImage}" alt="Imagen de ${actividadName}">
      </ion-thumbnail>
      <ion-label>
        <h2><strong>${actividadName}</strong></h2>
        <p>Tiempo: ${sesion.tiempo}</p>
        <p>Fecha: ${sesion.fecha}</p>
      </ion-label>
      <ion-button color="danger" fill="outline" slot="end" class="eliminar-btn" onclick="eliminarRegistro(${sesion.id})">
        <ion-icon name="trash-outline"></ion-icon> 
        <br>Eliminar<br>registro
      </ion-button>
    `;
    listItem.setAttribute("data-id", sesion.id);
    listContainer.appendChild(listItem);
  }

  activitiesLoaded = true;
}

async function getActividadName(id) {
  console.log(`Obteniendo actividad con ID: ${id}`);
  const actividades = await getActividades();
  const actividad = actividades.find((act) => act.id === id);
  return actividad ? actividad.nombre : "Actividad no encontrada";
}

async function eliminarRegistro(id) {
  if (confirm("¿Seguro que quieres eliminar este registro?")) {
    try {
      console.log(`Eliminando registro con ID: ${id}`);

      const response = await fetch(
        `${apiBase}/registros.php?idRegistro=${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            apikey: localStorage.getItem("token"),
            iduser: localStorage.getItem("userId"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el registro");
      }

      await getSesiones();
      activitiesLoaded = false;
      await printRegisteredActivities();
      mostrarInforme();
      console.log(`Registro con ID ${id} eliminado correctamente`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}
async function getActividadImage(id) {
  console.log(`Obteniendo actividad con ID: ${id}`);
  const actividades = await getActividades();
  const actividad = actividades.find((act) => act.id === id);

  return actividad
    ? `${imageBase}${actividad.imagen}.png`
    : "Imagen no encontrada";
}

function limpiarCamposRegistroActividades() {
  document.querySelector("#selectActividades").value = "";
  document.querySelector("#fecha").value = "";
  document.querySelector("#tiempo").value = "";
}

function calcularTiempoTotal() {
  let tiempoTotal = 0;
  for (let sesion of sesiones) {
    tiempoTotal += sesion.tiempo;
  }
  return tiempoTotal;
}

function calcularTiempoDiario() {
  const fechaHoy = new Date();
  const fechaActual = fechaHoy.toISOString().split("T")[0];
  const sesionesHoy = sesiones.filter((sesion) => sesion.fecha === fechaHoy);
  let tiempoDiario = 0;

  for (let i = 0; i < sesionesHoy.length; i++) {
    tiempoDiario += sesionesHoy[i].tiempo;
  }
  console.log(tiempoDiario);
  return tiempoDiario;
}

function mostrarInforme() {
  const tiempoTotal = calcularTiempoTotal();
  const tiempoDiario = calcularTiempoDiario();

  document.querySelector(
    "#tiempo-total"
  ).textContent = `Tiempo total entrenado: ${tiempoTotal} minutos`;
  document.querySelector(
    "#tiempo-diario"
  ).textContent = `Tiempo total entrenado hoy: ${tiempoDiario} minutos`;
}

async function filterLastWeek() {
  const fechaHoy = new Date();
  const fecha1semana = new Date(fechaHoy);
  fecha1semana.setDate(fechaHoy.getDate() - 7);

  const filteredSesiones = sesiones.filter((sesion) => {
    const sesionFecha = new Date(sesion.fecha);
    return sesionFecha >= fecha1semana && sesionFecha <= fechaHoy;
  });

  await printRegisteredActivities(filteredSesiones);
}

async function filterLastMonth() {
  const fechaHoy = new Date();
  const fecha1mes = new Date(fechaHoy);
  fecha1mes.setMonth(fechaHoy.getMonth() - 1);

  const filteredSesiones = sesiones.filter((sesion) => {
    const sesionFecha = new Date(sesion.fecha);
    return sesionFecha >= fecha1mes && sesionFecha <= fechaHoy;
  });

  await printRegisteredActivities(filteredSesiones);
}
