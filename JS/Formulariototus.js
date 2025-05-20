// Configura tu ID y API Key de JSONBin aquí (cambia por los tuyos)
const JSONBIN_BIN_ID = '682a68838960c979a59c6d65'; 
const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';

// Funciones para cambiar de paso
function nextStep() {
  const step1Inputs = document.querySelectorAll('#step1 input');
  let valid = true;
  step1Inputs.forEach(input => {
    if (!input.checkValidity()) valid = false;
  });

  if (valid) {
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    window.scrollTo(0, 0);
  } else {
    document.getElementById('formTotu').reportValidity();
  }
}

function prevStep() {
  document.getElementById('step2').classList.remove('active');
  document.getElementById('step1').classList.add('active');
  window.scrollTo(0, 0);
}

function backFromStep1() {
  window.location = "Hometotus.html";
}

// Alerta para mostrar cuando el formulario se envía correctamente
function showFormAlert(message) {
  const container = document.getElementById('formAlertContainer');
  container.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="box-shadow:0 4px 12px rgba(0,0,0,0.13);">
      <strong>${message}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
  container.style.display = "block";
  setTimeout(() => { container.style.display = "none"; }, 3500);
}

// Manejo de checkboxes para trabajos extra (máximo 2 seleccionados)
const checkboxes = document.querySelectorAll('#trabajosExtraContainer input[type="checkbox"]');
let seleccionadas = [];
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      seleccionadas.push(checkbox);
      if (seleccionadas.length > 2) {
        const eliminada = seleccionadas.shift();
        eliminada.checked = false;
      }
    } else {
      seleccionadas = seleccionadas.filter(c => c !== checkbox);
    }
  });
});

// Listener para el submit del formulario con guardado en JSONBin
document.getElementById('formTotu').addEventListener('submit', async function(e) {
  e.preventDefault();

  if (this.checkValidity()) {
    const nombre = this.nombre.value.trim();
    const apellido = this.apellido.value.trim();
    const nacimiento = this.nacimiento.value;
    const dui = this.dui.value.trim();
    const cuenta = this.cuenta.value.trim();
    const correo = this.correo.value.trim();
    const telefono = this.telefono.value.trim();
    const categoriaPrincipal = this.categoriaPrincipal.value;

    const trabajosExtra = [];
    document.querySelectorAll('#trabajosExtraContainer input[type="checkbox"]:checked').forEach(cb => {
      trabajosExtra.push(cb.value);
    });

    const experiencia = this.experiencia.value.trim();
    const direccion = this.direccion.value.trim();
    const horario = this.horario.value.trim();

    const nuevoTrabajador = {
      nombre,
      apellido,
      nacimiento,
      dui,
      cuenta,
      correo,
      telefono,
      categoriaPrincipal,
      trabajosExtra,
      experiencia,
      direccion,
      horario
    };

    try {
      // Obtener datos actuales del bin
      const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });

      if (!getResponse.ok) throw new Error('No se pudo obtener los datos actuales');

      const getData = await getResponse.json();
      const currentRecords = Array.isArray(getData.record) ? getData.record : [];

      // Añadir nuevo trabajador
      currentRecords.push(nuevoTrabajador);

      // Guardar datos actualizados en JSONBin
      const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(currentRecords)
      });

      if (!putResponse.ok) throw new Error('Error guardando datos en JSONBin');

      const putResult = await putResponse.json();
      console.log('Datos guardados:', putResult);

      showFormAlert('¡Formulario realizado con éxito!');
      this.reset();
      document.getElementById('step2').classList.remove('active');
      document.getElementById('step1').classList.add('active');
      window.scrollTo(0, 0);

      setTimeout(() => {
        window.location = "Hometotus.html";
      }, 1700);

    } catch (error) {
      console.error('Error guardando en JSONBin:', error);
      alert('Error al guardar los datos, revisa la consola.');
    }
  } else {
    this.reportValidity();
  }
});
