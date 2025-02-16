const apiBase = "https://movetrack.develotion.com";
const imageBase = "https://movetrack.develotion.com/imgs/";
const ruteo = document.querySelector("ion-router");
let jwt;
let userId;

function inicio() {
  ocultarSecciones();
  if (localStorage.getItem("token")) {
      mostrarMenu("logeado");
  } else {
      mostrarMenu("deslogeado");
  }

  ruteo.addEventListener("ionRouteDidChange", mostrarPagina);
  getCountries();
  botones();
}

document.addEventListener("DOMContentLoaded", inicio);

function botones() {
  ruteo.addEventListener("ionRouteWillChange", mostrarPagina);
  document
    .querySelector("#btnRegistroMenu")
    .addEventListener("click", mostrarPagina);
  document
    .querySelector("#btnIngreso")
    .addEventListener("click", mostrarPagina);
  // document.querySelector("#btnInicio").addEventListener("click", mostrarPagina);
}

// Ocultar todas las páginas
function ocultarSecciones() {
  document.querySelectorAll("ion-page").forEach(seccion => {
      seccion.style.display = "none"; 
  });
}

// Mostrar menú según login
function mostrarMenu(clase) {
  document.querySelectorAll("ion-menu ion-item").forEach(opcion => {
      opcion.style.display = "none";
      if (opcion.classList.contains(clase)) {
          opcion.style.display = "inline";
      }
  });
}

// Obtener países
const getCountries = async () => {
  try {
      const response = await fetch(apiBase + "/paises.php");
      const json = await response.json();
      printCountries(json);
  } catch (error) {
      console.log(error.message);
  }
};

// Mostrar países en <ion-select>
const printCountries = (countries) => {
  const select = document.querySelector("#txtPais");
  select.innerHTML = "";  // Limpiar opciones previas
  countries.paises.forEach(country => {
      const option = document.createElement("ion-select-option");
      option.textContent = country.name;
      option.value = country.id;
      select.appendChild(option);
  });
};

// Manejo de rutas
function mostrarPagina(event) {
  ocultarSecciones();
  let paginaDestino = event.detail.to;  // Ruta a la que se navega

  switch (paginaDestino) {
      case "/registro":
          getCountries();
          document.querySelector("#registro").style.display = "block";
          break;
      case "/ingresar":
          document.querySelector("#ingresar").style.display = "block";
          break;
      case "/agregar-sesion":
          document.querySelector("#registroactividades").style.display = "block";
          break;
      default:
          ruteo.push("/ingresar"); // Si la ruta no existe, redirigir a login
  }
}

// Registrar usuario
const register = async () => {
  try {
      let username = document.querySelector("#txtUsuario").value.trim();
      let password = document.querySelector("#txtPassword").value.trim();
      let country = document.querySelector("#txtPais").value.trim();

      if (!username || !password || !country) throw new Error("Todos los campos son obligatorios");

      let user = { username, password, country };
      const response = await fetch(apiBase + "/usuarios.php", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(user),
      });

      const json = await response.json();

      if (!json.error) {
          vermensaje("Registro exitoso");
          jwt = json.apiKey;
          userId = json.id;
          limpiarcamposRegistro();
      } else {
          vermensaje(json.mensaje);
      }
  } catch (error) {
      vermensaje(error.message);
  }
};

// Login usuario
const login = async () => {
  try {
      let username = document.querySelector("#tNombre").value.trim();
      let password = document.querySelector("#tPassword").value.trim();

      if (!username || !password) throw new Error("Todos los campos son obligatorios");

      let user = { username, password };

      const response = await fetch(apiBase + "/usuarios.php", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(user),
      });

      const json = await response.json();

      if (!json.error) {
          vermensaje("Inicio de sesión exitoso");
          jwt = json.apiKey;
          userId = json.id;
          localStorage.setItem("token", json.apiKey);
          limpiarcamposlogin();
          document.querySelector("#registroactividades").style.display = "block";
      } else {
          vermensaje(json.mensaje);
      }
  } catch (error) {
      vermensaje(error.message);
  }
};

// Limpia campos después de registro
function limpiarcamposRegistro() {
  document.querySelector("#txtUsuario").value = "";
  document.querySelector("#txtPassword").value = "";
}

// Limpia campos después de login
function limpiarcamposlogin() {
  document.querySelector("#tNombre").value = "";
  document.querySelector("#tPassword").value = "";
}

// Muestra mensaje en pantalla
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

// Evento botones
document.querySelector("#btnRegistrarse").addEventListener("click", register);
document.querySelector("#btnIngresar").addEventListener("click", login);