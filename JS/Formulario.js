// --- CONSTANTES BIN ---
const JSONBIN_BIN_SERVICIOS = '682c98548a456b7966a1f271'; // SERVICIOS
const JSONBIN_BIN_TRABAJADORES = '682208248960c979a597f8fb'; // Trabajadores y servicios
const JSONBIN_BIN_NOTIFICACIONES = '682bc22b8960c979a59d37f4'; // Notificaciones

const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';

const JSONBIN_URL_SERVICIOS = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_SERVICIOS}`;
const JSONBIN_URL_TRABAJADORES = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_TRABAJADORES}`;
const JSONBIN_URL_NOTIFICACIONES = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_NOTIFICACIONES}`;

const JSONBIN_HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY
};

// Función para generar IDs únicas
function generarId(prefix = '') {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

// Ubicación
let lat = null;
let lon = null;

function obtenerUbicacion() {
  const ubicacionDiv = document.getElementById("ubicacion-actual");
  const mapa = document.getElementById("mapa");

  if (!ubicacionDiv || !mapa) {
    console.error("No se encontró el elemento 'ubicacion-actual' o 'mapa' en el HTML.");
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        // Mostrar texto con coordenadas
        ubicacionDiv.textContent = `Ubicación actual: Latitud ${lat}, Longitud ${lon}`;

        // Mostrar mapa con ubicación
        mapa.style.display = "block";
        mapa.innerHTML = `<iframe width="100%" height="200" frameborder="0" style="border:0; border-radius:12px"
          src="https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed" allowfullscreen></iframe>`;
      },
      function (error) {
        console.error("Error obteniendo ubicación:", error);
        ubicacionDiv.textContent = "No se pudo obtener la ubicación: " + error.message;
        mapa.style.display = "none";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    ubicacionDiv.textContent = "Geolocalización no soportada por este navegador.";
    mapa.style.display = "none";
  }
}

// Publicar servicio
async function publicarServicio() {
  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value;
  const presupuesto = document.getElementById("presupuesto").value;
  const direccion = document.getElementById("direccion").value;


  if (!categoria || !descripcion || !presupuesto || !direccion || lat === null || lon === null) {
    alert("Por favor, completa todos los campos y obtén la ubicación.");
    return;
  }

  // Obtener ID del cliente 
  const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
  const clienteID = usuarioActual?.userId; // <-- usa userId, no id ni generarId

  // Crear objeto servicio con ID único
  const servicio = {
    id: generarId('sv_'),
    categoria: categoria,
    descripcion: descripcion,
    presupuesto: presupuesto,
    direccion: direccion,
    latitud: lat,
    longitud: lon,
    fecha: new Date().toISOString(),
    cliente_id: clienteID, // <-- aquí va el userId del usuario logueado
    trabajador_id: null  // aún no asignado
  };

  try {
    // 1. Obtener servicios existentes
    const responseGet = await fetch(JSONBIN_URL_SERVICIOS + '/latest', {
      method: 'GET',
      headers: JSONBIN_HEADERS
    });
    const data = await responseGet.json();
    const serviciosExistentes = data.record?.servicios || [];

    // 2. Agregar el nuevo servicio
    serviciosExistentes.push(servicio);

    // 3. Actualizar el bin completo
    const responsePut = await fetch(JSONBIN_URL_SERVICIOS, {
      method: 'PUT',
      headers: JSONBIN_HEADERS,
      body: JSON.stringify({ servicios: serviciosExistentes })
    });

    if (responsePut.ok) {
      console.log("Servicio guardado correctamente:", servicio);

      // 4. Notificar a trabajadores
      await notificarTrabajadores(servicio);

      // Limpiar campos
      document.getElementById("categoria").value = "";
      document.getElementById("descripcion").value = "";
      document.getElementById("presupuesto").value = "";
      document.getElementById("direccion").value = "";
      document.getElementById("ubicacion-actual").textContent = "";
      document.getElementById("mapa").innerHTML = "";
      document.getElementById("mapa").style.display = "none";
      lat = null;
      lon = null;

      // Redirigir al historial o pantalla deseada
      window.location.href = "PantallaTareas.html";
    } else {
      throw new Error('Error al guardar en JSONBin');
    }
  } catch (error) {
    console.error("Error al guardar el servicio:", error);
    alert("Ocurrió un error al guardar el servicio. Por favor intenta nuevamente.");
  }
}

// Función para notificar a trabajadores de la categoría correspondiente
async function notificarTrabajadores(servicio) {
  try {
    // Obtener todos los trabajadores
    const resTrabajadores = await fetch(JSONBIN_URL_TRABAJADORES + '/latest', {
      method: 'GET',
      headers: JSONBIN_HEADERS
    });
    const dataTrabajadores = await resTrabajadores.json();
    const trabajadores = dataTrabajadores.record?.trabajadores || [];

    // Filtrar trabajadores que coincidan con la categoría
    const trabajadoresFiltrados = trabajadores.filter(t => t.categoria === servicio.categoria);

    // Obtener notificaciones actuales
    const resNotificaciones = await fetch(JSONBIN_URL_NOTIFICACIONES + '/latest', {
      method: 'GET',
      headers: JSONBIN_HEADERS
    });
    const dataNotificaciones = await resNotificaciones.json();
    const notificacionesActuales = dataNotificaciones.record || [];

    // Crear nuevas notificaciones para cada trabajador filtrado
    trabajadoresFiltrados.forEach(w => {
      notificacionesActuales.push({
        id: generarId('ntf_'),
        trabajador_id: w.id,
        tarea_id: servicio.id,
        leida: false
      });
    });

    // Guardar notificaciones actualizadas
    const resPutNotificaciones = await fetch(JSONBIN_URL_NOTIFICACIONES, {
      method: 'PUT',
      headers: JSONBIN_HEADERS,
      body: JSON.stringify(notificacionesActuales)
    });

    if (resPutNotificaciones.ok) {
      console.log('Notificaciones enviadas correctamente.');
    } else {
      throw new Error('Error al guardar notificaciones');
    }
  } catch (error) {
    console.error("Error al enviar notificaciones:", error);
  }
}

// Funciones para navegación y diálogo (las que ya tienes)
function confirmBack() {
  document.getElementById("overlay").classList.add("active");
}

function closeDialog() {
  document.getElementById("overlay").classList.remove("active");
}

function goToHome() {
  window.location.href = "home.html";
}