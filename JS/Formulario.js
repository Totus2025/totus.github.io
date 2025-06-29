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
  const telefono = document.getElementById("telefono").value;

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
    estado: "Pendiente"
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
      document.getElementById("telefono").value = "";
      document.getElementById("ubicacion-actual").textContent = "";
      document.getElementById("mapa").innerHTML = "";
      document.getElementById("mapa").style.display = "none";

      // Limpiar descuento info
      actualizarDescuentoYTotal();

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

// --- CUPONES Y DESCUENTO DINÁMICO ---

function obtenerPresupuestoNumerico() {
  let valor = document.getElementById('presupuesto').value || "0";
  valor = valor.replace(/[^0-9.,]/g, '').replace(',', '.').trim();
  return parseFloat(valor) || 0;
}

function obtenerPorcentajeCupon() {
  const cupon = document.querySelector('input[name="cupon"]:checked');
  if (!cupon) return 0;
  if (cupon.value.includes("15%")) return 15;
  if (cupon.value.includes("10%")) return 10;
  if (cupon.value.includes("5%")) return 5;
  return 0;
}

function actualizarDescuentoYTotal() {
  const presupuesto = obtenerPresupuestoNumerico();
  const porcentaje = obtenerPorcentajeCupon();
  const descuento = presupuesto * (porcentaje / 100);
  const total = presupuesto - descuento;

  const descuentoDiv = document.getElementById('descuento-aplicado');
  const totalDiv = document.getElementById('total-pagar');

  if (descuentoDiv && totalDiv) {
    if (porcentaje > 0 && presupuesto > 0) {
      descuentoDiv.style.display = '';
      descuentoDiv.textContent = `Descuento aplicado: -$${descuento.toFixed(2)} (${porcentaje}%)`;
    } else {
      descuentoDiv.style.display = 'none';
      descuentoDiv.textContent = '';
    }
    totalDiv.textContent = `Total a pagar: $${total.toFixed(2)}`;
  }

  // Si el método de pago es tarjeta, actualiza el monto de PayPal
  const metodoPago = document.getElementById('metodo-pago');
  if (metodoPago && metodoPago.value === 'tarjeta') {
    mostrarPago();
  }

  // Actualiza el resumen sobre el botón de pagar
  actualizarVisualPagoBoton();
  
  mostrarOcultarCuponesYMensaje();
}

// Solo permite un cupón seleccionado a la vez y actualiza el descuento
function seleccionarSoloUno(checkbox) {
  document.querySelectorAll('input[type="checkbox"][name="cupon"]').forEach(function (el) {
    if (el !== checkbox) el.checked = false;
  });
  actualizarDescuentoYTotal();
}

//  muestra precio original tachado y total con descuento 
function actualizarVisualPagoBoton() {
  const presupuesto = obtenerPresupuestoNumerico();
  const porcentaje = obtenerPorcentajeCupon();
  const descuento = presupuesto * (porcentaje / 100);
  const total = presupuesto - descuento;

  const resumenDiv = document.getElementById('resumen-pago');
  const metodoPago = document.getElementById('metodo-pago')?.value || "";

  if (!resumenDiv) return;

  // Mostrar mensaje si es efectivo ---
  if (metodoPago === "efectivo") {
    resumenDiv.innerHTML = `<span style="color:#b40000;font-weight:bold;">No se puede usar un descuento si paga en efectivo.</span>`;
    return;
  }

  if (porcentaje > 0 && presupuesto > 0) {
    resumenDiv.innerHTML = `
      <div style="color: #008000; font-weight: bold; font-size: 16px;">
        -$${descuento.toFixed(2)} (${porcentaje}% de descuento)
      </div>
      <div>
        <span style="text-decoration: line-through; color: #b40000; font-size: 16px; margin-right: 8px;">
          $${presupuesto.toFixed(2)}
        </span>
        <span style="color: #c40000; font-weight: bold; font-size: 20px;">
          $${total.toFixed(2)}
        </span>
      </div>
    `;
  } else if (presupuesto > 0) {
    resumenDiv.innerHTML = `
      <span style="color: #c40000; font-weight: bold; font-size: 20px;">
        $${presupuesto.toFixed(2)}
      </span>
    `;
  } else {
    resumenDiv.innerHTML = '';
  }
}

//OCULTAR CUPONES SI ES EFECTIVO Y MOSTRARLOS SI ES TARJETA 
function mostrarOcultarCuponesYMensaje() {
  const metodoPago = document.getElementById('metodo-pago')?.value || "";
  const labelCupon = Array.from(document.querySelectorAll('label')).find(l => l.textContent.trim().toLowerCase().includes('cupón'));
  const bloqueCupones = labelCupon ? labelCupon.nextElementSibling : null;

  // Oculta o muestra los cupones según el método de pago
  if (bloqueCupones) {
    if (metodoPago === "efectivo") {
      bloqueCupones.style.display = "none";
      if (labelCupon) labelCupon.style.display = "none";
    } else {
      bloqueCupones.style.display = "";
      if (labelCupon) labelCupon.style.display = "";
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const presupuestoInput = document.getElementById('presupuesto');
  if (presupuestoInput) {
    presupuestoInput.addEventListener('input', actualizarDescuentoYTotal);
  }

  document.querySelectorAll('input[name="cupon"]').forEach(function (el) {
    el.addEventListener('change', actualizarDescuentoYTotal);
  });

  const metodoPagoInput = document.getElementById('metodo-pago');
  if (metodoPagoInput) {
    metodoPagoInput.addEventListener('change', actualizarDescuentoYTotal);
  }

  actualizarDescuentoYTotal();

  if (metodoPagoInput) {
    mostrarPago();
  }
});

// --- PAYPAL ---
function mostrarPago() {
  const metodo = document.getElementById('metodo-pago').value;
  const paypalContainer = document.getElementById('paypal-container');
  const paypalButton = document.getElementById('paypal-button-container');
  if (metodo === 'tarjeta') {
    paypalContainer.style.display = 'block';
    paypalButton.innerHTML = '';

    let presupuesto = obtenerPresupuestoNumerico();
    const porcentaje = obtenerPorcentajeCupon();
    presupuesto = presupuesto - (presupuesto * (porcentaje / 100));
    if (isNaN(presupuesto) || presupuesto <= 0) presupuesto = 1.00;

    if (window.paypal) {
      paypal.Buttons({
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [{
              amount: { value: presupuesto.toFixed(2) }
            }]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
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

document.addEventListener('DOMContentLoaded', function () {
  const presupuestoInput = document.getElementById('presupuesto');
  const metodoPagoInput = document.getElementById('metodo-pago');
  if (presupuestoInput && metodoPagoInput) {
    presupuestoInput.addEventListener('input', function () {
      if (metodoPagoInput.value === 'tarjeta') {
        mostrarPago();
      }
    });
    metodoPagoInput.addEventListener('change', function () {
      if (metodoPagoInput.value === 'tarjeta') {
        mostrarPago();
      }
    });
  }
});

