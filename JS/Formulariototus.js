// ID y API Key de JSONBin 
const JSONBIN_BIN_ID = '682a68838960c979a59c6d65'; 
const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';

function showFormAlert(message) {
  const container = document.getElementById('formAlertContainer');
  container.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert" style="box-shadow:0 4px 12px rgba(0,0,0,0.13);font-size:1.1em;">
      <div style="display:flex;align-items:center;">
        <span style="font-size:1.5em;margin-right:10px;">🎉</span>
        <span>
        <strong>¡Listo!</strong><br>
        ${message}
        </span>
      </div>
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

  // Botón de enviar y loader
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...`;

  if (this.checkValidity()) {
    const categoriaPrincipal = this.categoriaPrincipal.value;
    const trabajosExtra = [];
    document.querySelectorAll('#trabajosExtraContainer input[type="checkbox"]:checked').forEach(cb => {
      trabajosExtra.push(cb.value);
    });
    const experiencia = this.experiencia.value.trim();
    const direccion = this.direccion.value.trim();
    const horario = this.horario.value.trim();

    const nuevoTrabajador = {
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

      showFormAlert('¡Formulario realizado con éxito!');
      this.reset();

      // actualiza al usuario como trabajador
      try {
        let usuarioActual = localStorage.getItem('totusCurrentUser');
        if (usuarioActual) {
          usuarioActual = JSON.parse(usuarioActual);
          const usuarioActualizado = {
            ...usuarioActual,
            categoriaPrincipal,
            trabajosExtra
          };
          localStorage.setItem('totusCurrentUser', JSON.stringify(usuarioActualizado));
          localStorage.setItem('tipoUsuario', 'trabajador');
        }
      } catch (error) {
        // Si hay problema con el localStorage, no bloquea el flujo
        console.error('Error actualizando usuario logueado:', error);
      }
      

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
        window.location = "Hometotus.html";
      }, 1800);

    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
      console.error('Error guardando en JSONBin:', error);
      alert('Error al guardar los datos, revisa la consola.');
    }
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
    this.reportValidity();
  }
});