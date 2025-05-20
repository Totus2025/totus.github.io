
     const JSONBIN_BIN_ID = '6816d5668a456b79669734d8'; // ID donde se guarddan lo datos de inicio de sesion 
     const JSONBIN_BIN_servicios='682208248960c979a597f8fb';//ID para que los servicios se guarden en la base de datos
    const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';
    const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_servicios}`;
    const JSONBIN_HEADERS = {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    };

    // Configuración para almacenamiento local
    const LOCAL_STORAGE_SESSION_KEY = 'totusCurrentUser';
    
    let lat = null;
    let lon = null;

    function obtenerUbicacion() {
      const ubicacionDiv = document.getElementById("ubicacion-actual");
      const mapa = document.getElementById("mapa");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            lat = position.coords.latitude.toFixed(4);
            lon = position.coords.longitude.toFixed(4);
            ubicacionDiv.textContent = `Ubicación actual: Latitud ${lat}, Longitud ${lon}`;
            mapa.style.display = "block";
            mapa.innerHTML = `<iframe width="100%" height="200" frameborder="0" style="border:0; border-radius:12px"
              src="https://www.google.com/maps?q=${lat},${lon}&hl=es&z=16&output=embed" allowfullscreen></iframe>`;
          },
          function () {
            ubicacionDiv.textContent = "No se pudo obtener la ubicación.";
          }
        );
      } else {
        ubicacionDiv.textContent = "Geolocalización no soportada.";
      }
    }

    async function publicarServicio() {
      const categoria = document.getElementById("categoria").value;
      const descripcion = document.getElementById("descripcion").value;
      const presupuesto = document.getElementById("presupuesto").value;
      const direccion = document.getElementById("direccion").value;
      const clienteId = document.getElementById("id_cliente").value;
const trabajadorId = document.getElementById("id_trabajador").value; // Estará vacío al principio

      if (!categoria || !descripcion || !presupuesto || !direccion || !lat || !lon) {
        alert("Por favor, completa todos los campos y obtén la ubicación.");
        return;
      }

      // Objeto corregido - usando las variables locales
     const servicio = {
  id: "sv" + Date.now(), // Genera un ID único para la tarea
  categoria: categoria,
  descripcion: descripcion,
  presupuesto: presupuesto,
  direccion: direccion,
  latitud: lat,
  longitud: lon,
  fecha: new Date().toISOString(),
  cliente_id: clienteId,
  trabajador_id: trabajadorId || null // aún no hay trabajador asignado
};
      try {
        // 1. Primero obtenemos los datos existentes
        const responseGet = await fetch(JSONBIN_URL + '/latest', {
          method: 'GET',
          headers: JSONBIN_HEADERS
        });
        
        const data = await responseGet.json();
        const serviciosExistentes = data.record?.servicios || [];
        
        // 2. Agregamos el nuevo servicio
        serviciosExistentes.push(servicio);
        
        // 3. Actualizamos el bin completo
        const responsePut = await fetch(JSONBIN_URL, {
          method: 'PUT',
          headers: JSONBIN_HEADERS,
          body: JSON.stringify({ servicios: serviciosExistentes })
        });
        
        if (responsePut.ok) {
          console.log("Servicio guardado correctamente:", servicio);
          
          // Limpiar campos
          document.getElementById("categoria").value = "";
          document.getElementById("descripcion").value = "";
          document.getElementById("presupuesto").value = "";
          document.getElementById("direccion").value = "";
          document.getElementById("ubicacion-actual").textContent = "";
          document.getElementById("mapa").innerHTML = "";
          document.getElementById("mapa").style.display = "none";

          // Redirige al historial
          window.location.href = "PantallaTareas.html";
        } else {
          throw new Error('Error al guardar en JSONBin');
        }
      } catch (error) {
        console.error("Error al guardar el servicio:", error);
        alert("Ocurrió un error al guardar el servicio. Por favor intenta nuevamente.");
      }
    }

    function confirmBack() {
      document.getElementById("overlay").classList.add("active");
    }

    function closeDialog() {
      document.getElementById("overlay").classList.remove("active");
    }

    function goToHome() {
      window.location.href = "home.html";
    }
