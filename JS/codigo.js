const apiBase = "https://movetrack.develotion.com";
const imageBase = "https://movetrack.develotion.com/imgs/";
const ruteo = document.querySelector("ion-router");
let jwt;
let userId;

function inicio() {
  ocultarSecciones();
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != undefined
  ) {
    mostrarMenu("logueado");
    ruteo.push("/actividad");
  } else {
    mostrarMenu("deslogueado");
    ruteo.push("/ingresar");
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

const getCountries = async () => {
  try {
    const response = await fetch(apiBase + "/paises.php");
    const json = await response.json();
    printCountries(json);
  } catch (error) {
    console.log(error.message);
  }
};

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
      actividades();
      document.querySelector("#registroactividades").style.display = "block";
      break;
    default:
      localStorage.clear();
      mostrarMenu("deslogueado");
      ruteo.push("/ingresar");
  }
}

// Registrar usuario
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
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(user),
    });

    const json = await response.json();

    if (json.codigo == 200) {
      alert("Registro exitoso");
      jwt = json.apiKey;
      userId = json.id;
      localStorage.setItem("token", json.apiKey);
      limpiarcamposRegistro();

      setTimeout(() => {
        mostrarMenu("logueado");
        document.querySelector("#registroactividades").style.display = "block";
        ruteo.push("/actividad");
      }, 1000);
    } else {
      vermensaje(json.mensaje);
    }
  } catch (error) {
    vermensaje(error.message);
  }
}

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
      limpiarcamposlogin();

      setTimeout(() => {
        alert("Inicio de sesión exitoso");
        mostrarMenu("logueado");
        document.querySelector("#registroactividades").style.display = "block";
        ruteo.push("/actividad");
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
  let parrafo = document.querySelector("#messages");
  if (!parrafo) {
    parrafo = document.createElement("p");
    parrafo.setAttribute("id", "messages");
    parrafo.setAttribute("class", "mt-2");
    let btnRegistrarse = document.querySelector("#btnRegistrarse");
    btnRegistrarse.parentNode.appendChild(parrafo);
  }
  parrafo.innerHTML = mensaje;
  setTimeout(() => {
    parrafo.remove();
  }, tiempo);
}

document.querySelector("#btnRegistrarse").addEventListener("click", register);
document.querySelector("#btnIngresar").addEventListener("click", login);
document
  .querySelector("#btnRegistrarActividad")
  .addEventListener("click", registrarActividad);

function cerrarMenu() {
  const menu = document.querySelector("ion-menu");
  menu.close(); // Cierra el menú
}

function cerrarSesion() {
  jwt = null;
  userId = null;
}

async function actividades() {
  try {
    const response = await fetch(apiBase + "/actividades.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: "a5d01b65e62758ea898c55338ee50f6e",
        iduser: 3500,
      },
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }
    const json = await response.json();
    mostrarActividades(json);
  } catch (error) {
    console.log(error.message);
  }
}

const mostrarActividades = (actividades) => {
  const select = document.querySelector("#actividad");

  select.innerHTML = "";

  actividades.forEach((actividad) => {
    const option = document.createElement("ion-select-option");
    option.text = actividad.name;
    option.value = actividad.id;
    select.appendChild(option);
  });
};

const sesiones = [];

async function registrarActividad() {
  let idActividad = document.querySelector("#actividad").value;
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

  const nuevaActividad = {
    idActividad: sesiones.length + 1,
    idUsuario: userId,
    tiempo: parseInt(tiempo),
    fecha: fecha,
  };

  try {
    const response = await fetch(
      "https://movetrack.develotion.com/registro.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: "2dd3d4c779d95ed85a9db8c24db952da",
          "User-ID": userId,
        },
        body: JSON.stringify(nuevaActividad),
      }
    );

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const result = await response.json();
    vermensaje("Actividad registrada");
    sesiones.push(nuevaActividad);
    limpiarCamposRegistroActividades();
  } catch (error) {
    vermensaje(error.message);
  }
}

function limpiarCamposRegistroActividades() {
  document.querySelector("#actividad").value = "";
  document.querySelector("#fecha").value = "";
  document.querySelector("#tiempo").value = "";
}
