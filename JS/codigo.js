const apiBase = "https://movetrack.develotion.com";
const imageBase = "https://movetrack.develotion.com/imgs/";
const ruteo = document.querySelector("#ruteo");
let jwt;
let userId;

function ocultarSecciones() {
  let secciones = document.querySelectorAll(".ion-page");
  secciones.forEach((seccion) => {
    seccion.style.display = "none"; // Escondemos todas las secciones
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

// function ocultarBotones() {
//   document.querySelector("#btnInicio").style.display = "none";
//   document.querySelector("#btnCerrarSesion").style.display = "none";
// }

const getCountries = async () => {
  try {
    const response = await fetch(apiBase + "/paises.php");
    const json = await response.json();
    console.log(json);
    printCountries(json);
  } catch (error) {
    console.log(error.message);
  }
};
const printCountries = (countries) => {
  const select = document.querySelector("#txtPais");

  countries.paises.forEach((country) => {
    const option = document.createElement("ion-select-option");
    option.text = country.name;
    option.value = country.id;
    select.appendChild(option);
  });
};

inicio();
function inicio() {
  ocultarSecciones();
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("token") != undefined
  ) {
    mostrarMenu("logueado");
  } else {
    mostrarMenu("deslogueado");
  }

  botones();

  getCountries();
}

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

function mostrarMenu(clase) {
  let opcionesMenu = document.querySelectorAll("ion-menu ion-item");
  opcionesMenu.forEach((opcion) => {
    opcion.style.display = "none";
    if (opcion.classList.contains(clase)) {
      opcion.style.display = "inline";
    }
  });
}

const register = async () => {
  try {
    let username = document.querySelector("#txtUsuario").value;
    let password = document.querySelector("#txtPassword").value;
    let country = document.querySelector("#txtPais").value;

    validarRegistro(username, password, country);

    let user = {
      username: username,
      password: password,
      country: country,
    };

    const response = await fetch(apiBase + "/usuarios.php", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
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

function mostrarPagina(event) {
  ocultarSecciones();

  let paginaDestino = event.detail.to;

  switch (paginaDestino) {
    case "/Registro":
      getCountries();
      document.querySelector("#Registro").style.display = "block";
      break;
    case "/Ingreso":
      document.querySelector("#InicioSesion").style.display = "block";
      break;
    case "/AgregarSesion":
      document.querySelector("#AgregarSesion").style.display = "block";
    default:
      localStorage.clear();
      document.querySelector("#btnRegistroMenu").style.display = "inline";
      document.querySelector("#btnIngreso").style.display = "inline";
      ruteo.push("/Ingreso");
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

const login = async () => {
  try {
    let username = document.querySelector("#tNombre").value;
    let password = document.querySelector("#tPassword").value;

    validarlogin(username, password);

    let user = {
      username: username,
      password: password,
    };

    const response = await fetch(apiBase + "/usuarios.php", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const json = await response.json();

    if (!json.error) {
      vermensaje("Inicio de sesión exitoso");
      jwt = json.apiKey;
      userId = json.id;
      localStorage.setItem("token", datos.data.token);
      limpiarcamposlogin();
      document.querySelector("#btnCerrarSesion").style.display = "inline-block";
      ocultarSecciones();
      document.querySelector("#registroActividades").style.display = "block";
      document.querySelector("#menuInicio2").style.display = "block";
      mostrarActividades();
    } else {
      vermensaje(json.mensaje);
    }
  } catch (error) {
    vermensaje(error.message);
  }
};

function validarlogin(username, password) {
  if (username.trim().length == 0) {
    throw new Error("Ingresar un nombre de usuario");
  }
  if (password.trim().length == 0) {
    throw new Error("Ingresar contraseña");
  }
}

function validarRegistro(user, password, country) {
  if (user.trim().length == 0) {
    throw new Error("Ingresar nombre de usuario");
  }
  if (password.trim().length == 0) {
    throw new Error("Ingresar contraseña");
  }
  if (country.trim() == "") {
    throw new Error("Seleccionar un pais");
  }
}

document.querySelector("#btnRegistrarse").addEventListener("click", register);
document.querySelector("#btnIngresar").addEventListener("click", login);

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

const actividades = async () => {
  try {
    const response = await fetch(apiBase + "/actividades.php");
    const json = await response.json();
    mostrarActividades(json);
  } catch (error) {
    console.log(error.message);
  }
};

const mostrarActividades = (actividades) => {
  const select = document.querySelector("#actividad");

  select.innerHTML = "";

  actividades.forEach((actividad) => {
    const option = document.createElement("option");
    option.text = actividad.name;
    option.value = actividad.id;
    select.appendChild(option);
  });
};

function cerrarMenu() {
  document.querySelector("#menu").close();
}

// function listarActividades() {
//   if(localStorage.getItem("token")!=null){
//     try{
//       fetch(apiBase+"/actividades")
//     }
//   }
// }
