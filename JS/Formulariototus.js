const JSONBIN_BIN_ID = '682a68838960c979a79c6d65'; // ID 
  
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
        // MARCA QUE SE DEBE MOSTRAR EL MODAL DE BIENVENIDA EN EL HOME
        localStorage.setItem('showWelcome', 'true');
        showFormAlert('Te has convertido en Totus exitosamente.');
        this.reset();
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        window.scrollTo(0, 0);
        // Redirige automáticamente al Home después de mostrar la alerta
        setTimeout(function() {
          window.location = "Hometotus.html";
        }, 1700); // Espera un poco antes de redirigir
      } else {
        this.reportValidity();
      }
    });
