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
 //aca se publica el servicio y todo el metodo
 async function publicarServicio() {
  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value;
  const presupuesto = document.getElementById("presupuesto").value;
  const direccion = document.getElementById("direccion").value;
  const metodoPago = document.getElementById("metodo-pago").value;

  if (!categoria || !descripcion || !presupuesto || !direccion || !lat || !lon) {
    alert("Por favor, completa todos los campos y obtén la ubicación.");
    return;
  }

  if (metodoPago === "tarjeta" && !pagoRealizado) {
    alert("Por favor, completa el pago con tarjeta antes de continuar.");
    return;
  }

  const servicio = {
    categoria: categoria,
    descripcion: descripcion,
    presupuesto: presupuesto,
    direccion: direccion,
    metodoPago: metodoPago,
    latitud: lat,
    longitud: lon,
    fecha: new Date().toISOString()
  };

  try {
    const responseGet = await fetch(JSONBIN_URL + '/latest', {
      method: 'GET',
      headers: JSONBIN_HEADERS
    });

    const data = await responseGet.json();
    const serviciosExistentes = data.record?.servicios || [];

    serviciosExistentes.push(servicio);

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

      pagoRealizado = false;

      // Redirigir al historial
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
paypal.Buttons({
  createOrder: function(data, actions) {
    const presupuesto = parseFloat(document.getElementById("presupuesto").value);
    if (isNaN(presupuesto) || presupuesto <= 0) {
      alert("Por favor ingresa un presupuesto válido antes de pagar.");
      return;
    }
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: presupuesto.toFixed(2)
        }
      }]
    });
  },
 onApprove: function(data, actions) {
  return actions.order.capture().then(function(details) {
    pagoRealizado = true;

    // Mensaje visual
    document.getElementById("pago-exitoso").style.display = "block";

    // Oculta el botón PayPal
    document.getElementById("paypal-button-container").style.display = "none";

    // Desactiva el selector de método de pago para que no cambie
    document.getElementById("metodo-pago").disabled = true;

    // También podrías desactivar el input de presupuesto si quieres
    document.getElementById("presupuesto").readOnly = true;

    // Opcional: esperar 2 segundos y publicar automáticamente
    setTimeout(() => {
      publicarServicio();
    }, 2000);
  });
}

}).render('#paypal-button-container');
