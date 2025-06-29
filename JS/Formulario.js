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

// Publicar servicio (sin método de pago ni tarjeta)
async function publicarServicio(event) {
  if (event) event.preventDefault();

  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value;
  const presupuesto = document.getElementById("presupuesto").value;
  const direccion = document.getElementById("direccion").value;
  const telefono = document.getElementById("telefono").value; // <-- Agregado

  // Obtén el usuario actual y su ID
  const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
  const clienteId = usuarioActual?.userId || '';

  if (!categoria || !descripcion || !presupuesto || !direccion || !lat || !lon) {
    alert("Por favor, completa todos los campos y obtén la ubicación.");
    return;
  }

  const servicio = {
    categoria: categoria,
    descripcion: descripcion,
    presupuesto: presupuesto,
    direccion: direccion,
    telefono: telefono,
    latitud: lat,
    longitud: lon,
    fecha: new Date().toISOString(),
    cliente_id: clienteId,
    estado: "Pendiente" // <-- Agregado: estado por defecto
  };

  try {
    const responseGet = await fetch(JSONBIN_URL_SERVICIOS + '/latest', {
      method: 'GET',
      headers: JSONBIN_HEADERS
    });

    const data = await responseGet.json();
    const serviciosExistentes = data.record?.servicios || [];

    serviciosExistentes.push(servicio);

    const responsePut = await fetch(JSONBIN_URL_SERVICIOS, {
      method: 'PUT',
      headers: JSONBIN_HEADERS,
      body: JSON.stringify({ servicios: serviciosExistentes })
    });

    if (responsePut.ok) {
      // Limpiar campos
      document.getElementById("categoria").value = "";
      document.getElementById("descripcion").value = "";
      document.getElementById("presupuesto").value = "";
      document.getElementById("direccion").value = "";
      document.getElementById("telefono").value = ""; // <-- Limpiar campo teléfono
      document.getElementById("ubicacion-actual").textContent = "";
      document.getElementById("mapa").innerHTML = "";
      document.getElementById("mapa").style.display = "none";

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

// Funciones para navegación y diálogo
function confirmBack() {
  document.getElementById("overlay").classList.add("active");
}

function closeDialog() {
  document.getElementById("overlay").classList.remove("active");
}

function goToHome() {
  window.location.href = "index.html";
}

function mostrarPago() {
  const metodo = document.getElementById('metodo-pago').value;
  const paypalContainer = document.getElementById('paypal-container');
  const paypalButton = document.getElementById('paypal-button-container');
  if (metodo === 'tarjeta') {
    paypalContainer.style.display = 'block';
    // Limpia el contenedor antes de renderizar para evitar errores de PayPal
    paypalButton.innerHTML = '';
    if (window.paypal) {
      paypal.Buttons({
        createOrder: function(data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: { value: '1.00' } // Monto de prueba
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            alert('Pago completado por ' + details.payer.name.given_name);
          });
        }
      }).render('#paypal-button-container');
    }
  } else {
    paypalContainer.style.display = 'none';
    paypalButton.innerHTML = '';
  }
}

function seleccionarSoloUno(checkbox) {
  document.querySelectorAll('input[type="checkbox"][name="cupon"]').forEach(function (el) {
    if (el !== checkbox) el.checked = false;
  });
}

// Inicializa el estado correcto al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('metodo-pago')) {
    mostrarPago();
    document.getElementById('metodo-pago').addEventListener('change', mostrarPago);
  }
});
