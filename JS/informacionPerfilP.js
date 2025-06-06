 // Mostrar solo el resumen si los datos existen
    window.onload = function() {
      const datos = JSON.parse(localStorage.getItem('datosPersonales'));
      if (datos && datos.nombre && datos.apellido && datos.tarjeta && datos.fecha) {
        document.getElementById("formulario").style.display = "none";
        mostrarResumen(datos);
      }
    };
    function goBack() {
        window.history.back();
    }
    function maskInput(event) {
        let input = event.target;
        let rawValue = input.dataset.raw || "";
        let newChar = event.data || "";
        if (/^\d$/.test(newChar) && rawValue.length < 16) {
            rawValue += newChar;
        } else if (event.inputType === "deleteContentBackward") {
            rawValue = rawValue.slice(0, -1);
        }
        input.dataset.raw = rawValue;
        input.value = rawValue.length >= 16 ? "************" + rawValue.slice(-4) : rawValue;
    }
    function formatDate(event) {
        let input = event.target;
        let value = input.value.replace(/\D/g, "").slice(0, 8);
        if (value.length >= 4) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
        } else if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }
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
    function enviar() {
      let nombre = document.getElementById("nombre").value.trim();
      let apellido = document.getElementById("apellido").value.trim();
      let tarjeta = document.getElementById("tarjeta").dataset.raw || "";
      let fecha = document.getElementById("fecha").value.trim();
      if (!nombre || !apellido) {
        customAlert({
          title: "Campos obligatorios",
          message: "Por favor completa tu nombre y apellido.",
          type: "error"
        });
        return;
      }
      if (tarjeta.length !== 16 || !/^\d+$/.test(tarjeta)) {
        customAlert({
          title: "Tarjeta inválida",
          message: "La tarjeta debe tener exactamente 16 dígitos numéricos.",
          type: "error"
        });
        return;
      }
      if (!fecha.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        customAlert({
          title: "Fecha inválida",
          message: "Formato de fecha incorrecto. Usa DD/MM/AAAA.",
          type: "error"
        });
        return;
      }
      // Guardar en localStorage
      localStorage.setItem('datosPersonales', JSON.stringify({
        nombre,
        apellido,
        tarjeta,
        fecha
      }));
      // Mostrar información y ocultar formulario
      document.getElementById("formulario").style.display = "none";
      mostrarResumen({ nombre, apellido, tarjeta, fecha });
    }
    function mostrarResumen(datos) {
      document.getElementById("resNombre").innerText = datos.nombre;
      document.getElementById("resApellido").innerText = datos.apellido;
      document.getElementById("resTarjeta").innerText = "************" + datos.tarjeta.slice(-4);
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

  