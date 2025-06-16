window.onload = function() {
  const session = JSON.parse(localStorage.getItem('totusCurrentUser') || '{}');
  const userId = session.userId || session.email;
  if (!userId) return;

  const datos = JSON.parse(localStorage.getItem(`datosPersonales_${userId}`));
  if (datos && datos.nombre && datos.apellido && datos.cuenta && datos.dui && datos.fecha) {
    document.getElementById("formulario").style.display = "none";
    mostrarResumen(datos);
  }
};

function goBack() {
  window.history.back();
}

// Censura la cuenta bancaria en el input mientras la escriben
function maskCuenta(event) {
  let input = event.target;
  let rawValue = input.dataset.raw || "";
  let newChar = event.data || "";

  // Permite solo dígitos, máximo 22
  if (/^\d$/.test(newChar) && rawValue.length < 22) {
    rawValue += newChar;
  } else if (event.inputType === "deleteContentBackward") {
    rawValue = rawValue.slice(0, -1);
  }
  input.dataset.raw = rawValue;

  // Mostrar censurado menos últimos 4 dígitos
  if (rawValue.length > 4) {
    input.value = "*".repeat(rawValue.length - 4) + rawValue.slice(-4);
  } else {
    input.value = rawValue;
  }
}

function formatDUI(event) {
  let input = event.target;
  let value = input.value.replace(/\D/g, '').slice(0, 9);
  if (value.length > 8) value = value.slice(0, 8) + '-' + value.slice(8);
  input.value = value;
}

function customAlert({title, message, type = 'error', buttonText = 'Aceptar', onClose}) {
  const overlay = document.getElementById('customAlert');
  overlay.innerHTML = `
    <div class="custom-alert-overlay">
      <div class="custom-alert-box custom-alert-${type}">
        <span class="custom-alert-icon">
          ${type === 'success' ? '✔️' : '⚠️'}
        </span>
        <div class="custom-alert-title">${title}</div>
        <div class="custom-alert-message">${message}</div>
        <button class="custom-alert-btn" id="alertBtn">${buttonText}</button>
      </div>
    </div>
  `;
  overlay.style.display = "flex";
  document.getElementById('alertBtn').onclick = function() {
    overlay.style.display = "none";
    if (typeof onClose === "function") onClose();
  }
}

function fechaToMostrar(fechaIso) {
  if (!fechaIso) return "";
  const [year, month, day] = fechaIso.split("-");
  return `${day}/${month}/${year}`;
}
function fechaToInput(fecha) {
  if (!fecha) return "";
  const [dd, mm, yyyy] = fecha.split("/");
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function enviar() {
  let nombre = document.getElementById("nombre").value.trim();
  let apellido = document.getElementById("apellido").value.trim();
  let cuenta = document.getElementById("cuenta").dataset.raw || "";
  let dui = document.getElementById("dui").value.trim();
  let fecha = document.getElementById("fecha").value;

  const session = JSON.parse(localStorage.getItem('totusCurrentUser') || '{}');
  const userId = session.userId || session.email;

  let camposFaltantes = [];
  if (!nombre) camposFaltantes.push("nombre");
  if (!apellido) camposFaltantes.push("apellido");
  if (!cuenta) camposFaltantes.push("cuenta bancaria");
  if (!dui) camposFaltantes.push("DUI");
  if (!fecha) camposFaltantes.push("fecha de nacimiento");

  if (!userId) {
    customAlert({
      title: "Sesión inválida",
      message: "No se pudo identificar el usuario. Por favor inicia sesión de nuevo.",
      type: "error"
    });
    return;
  }

  if (camposFaltantes.length > 0) {
    customAlert({
      title: "Campos obligatorios",
      message: "Por favor completa los siguientes campos: " + camposFaltantes.join(", ") + ".",
      type: "error"
    });
    return;
  }
  if (cuenta.length < 8 || !/^\d+$/.test(cuenta)) {
    customAlert({
      title: "Cuenta bancaria inválida",
      message: "La cuenta bancaria debe tener al menos 8 dígitos numéricos.",
      type: "error"
    });
    return;
  }
  if (!/^\d{8}-\d$/.test(dui)) {
    customAlert({
      title: "DUI inválido",
      message: "Formato de DUI incorrecto. Usa ########-#.",
      type: "error"
    });
    return;
  }

  // Guardar fecha en formato DD/MM/AAAA
  let fechaFormateada = "";
  if (fecha) {
    const [yyyy, mm, dd] = fecha.split("-");
    fechaFormateada = `${dd}/${mm}/${yyyy}`;
  }

  localStorage.setItem(`datosPersonales_${userId}`, JSON.stringify({
    nombre,
    apellido,
    cuenta,
    dui,
    fecha: fechaFormateada
  }));
  document.getElementById("formulario").style.display = "none";
  mostrarResumen({ nombre, apellido, cuenta, dui, fecha: fechaFormateada });
}

function mostrarResumen(datos) {
  document.getElementById("resNombre").innerText = datos.nombre;
  document.getElementById("resApellido").innerText = datos.apellido;
  // Censura todo menos los últimos 4 dígitos
  const cuenta = datos.cuenta || "";
  let cuentaCensurada = cuenta.length > 4
    ? "*".repeat(cuenta.length - 4) + cuenta.slice(-4)
    : cuenta;
  document.getElementById("resCuenta").innerText = cuentaCensurada;
  document.getElementById("resDUI").innerText = datos.dui;
  document.getElementById("resFecha").innerText = datos.fecha;
  document.getElementById("resumen").style.display = "block";
}

function regresarPerfil() {
  const tipoUsuario = localStorage.getItem('tipoUsuario');
  if (tipoUsuario === 'trabajador') {
    location.href = 'pantallaPerfil.html';
  } else {
    location.href = 'perfil.html';
  }
}

function editarInformacion() {
  const session = JSON.parse(localStorage.getItem('totusCurrentUser') || '{}');
  const userId = session.userId || session.email;
  if (!userId) return;
  const datos = JSON.parse(localStorage.getItem(`datosPersonales_${userId}`));
  if (!datos) return;
  document.getElementById("nombre").value = datos.nombre || "";
  document.getElementById("apellido").value = datos.apellido || "";
  // Cargar la cuenta censurada y el valor real en data-raw
  const cuentaInput = document.getElementById("cuenta");
  cuentaInput.dataset.raw = datos.cuenta || "";
  if ((datos.cuenta || "").length > 4) {
    cuentaInput.value = "*".repeat(datos.cuenta.length - 4) + datos.cuenta.slice(-4);
  } else {
    cuentaInput.value = datos.cuenta || "";
  }
  document.getElementById("dui").value = datos.dui || "";
  document.getElementById("fecha").value = fechaToInput(datos.fecha || "");
  document.getElementById("formulario").style.display = "block";
  document.getElementById("resumen").style.display = "none";
}