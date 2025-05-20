  const JSONBIN_BIN_ID = '682a68838960c979a59c6d65'; // ID 
    const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';
    const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_servicios}`;
    const JSONBIN_HEADERS = {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    };
    function nextStep() {
      const step1Inputs = document.querySelectorAll('#step1 input');
      let valid = true;
      step1Inputs.forEach(input => {
        if (!input.checkValidity()) {
          valid = false;
        }
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

    // Acción para la flecha en la pantalla 1
    function backFromStep1() {
      window.location = "Hometotus.html";
    }

    // Función para mostrar alerta 
    function showFormAlert(message) {
      const container = document.getElementById('formAlertContainer');
      container.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert" style="box-shadow:0 4px 12px rgba(0,0,0,0.13);">
          <strong>¡Formulario realizado con éxito!</strong>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
      `;
      container.style.display = "block";
      setTimeout(() => { container.style.display = "none"; }, 3500);
    }

    document.getElementById('formTotu').addEventListener('submit', function(e) {
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

    guardarTrabajador(nuevoTrabajador);

    localStorage.setItem('showWelcome', 'true');
    showFormAlert('Te has convertido en Totus exitosamente.');
    this.reset();
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    window.scrollTo(0, 0);

    setTimeout(() => {
      window.location = "Hometotus.html";
    }, 1700);
  } else {
    this.reportValidity();
  }
});

