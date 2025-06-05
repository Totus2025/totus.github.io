const JSONBIN_BIN_SERVICIOS = '682c98548a456b7966a1f271';
const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';
const JSONBIN_URL_SERVICIOS = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_SERVICIOS}/latest`;
const JSONBIN_HEADERS = { 'X-Master-Key': JSONBIN_API_KEY };

// Función para quitar tildes
function quitarTildes(str) {
  return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function cargarServiciosDelUsuario() {
  try {
    const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
    const categoriaPrincipal = quitarTildes((usuarioActual?.categoriaPrincipal || '').trim().toLowerCase());
    let trabajosExtra = usuarioActual?.trabajosExtra || [];
    if (typeof trabajosExtra === 'string') {
      trabajosExtra = trabajosExtra.split(',').map(e => quitarTildes(e.trim().toLowerCase()));
    } else if (Array.isArray(trabajosExtra)) {
      trabajosExtra = trabajosExtra.map(e => quitarTildes((e || '').trim().toLowerCase()));
    }

    const response = await fetch(JSONBIN_URL_SERVICIOS, { method: 'GET', headers: JSONBIN_HEADERS });
    const data = await response.json();
    const todasLasTareas = data.record?.servicios || [];

    // Filtrar tareas aceptadas
    const tareasAceptadas = usuarioActual?.tareasAceptadas || [];
    const uidsAceptadas = new Set(tareasAceptadas.map(t => t.uid));

    // Filtrar tareas por coincidencia de categoría y que no estén aceptadas
    const tareasCoincidentes = todasLasTareas.filter(task => {
      const categoriaTarea = quitarTildes((task.categoria || '').trim().toLowerCase());
      const uid = (
        (task.categoria || '') +
        (task.descripcion || '') +
        (task.direccion || '') +
        (task.presupuesto || '')
      ).replace(/\s+/g, '');
      return (
        (categoriaTarea === categoriaPrincipal || trabajosExtra.includes(categoriaTarea)) &&
        !uidsAceptadas.has(uid)
      );
    });

    // Renderizar
    const homeContainer = document.getElementById("homeTareasContainer");
    if (homeContainer) {
      homeContainer.innerHTML = tareasCoincidentes.length === 0
        ? "<p>No hay tareas que coincidan con tu perfil.</p>"
        : tareasCoincidentes.map((task, idx) => {
    const uid = (
      (task.categoria || '') +
      (task.descripcion || '') +
      (task.direccion || '') +
      (task.presupuesto || '')
    ).replace(/\s+/g, '');
    return `
      <div class="task-card">
        <span class="status" data-status="${task.estado || 'Pendiente'}">${task.estado || 'Pendiente'}</span>
        <h2>${task.categoria}</h2>
        <p><strong>Descripción:</strong> ${task.descripcion}</p>
        <p><strong>Dirección:</strong> ${task.direccion || 'No especificada'}</p>
        <p><strong>Presupuesto:</strong> $${task.presupuesto || '0'}</p>
        <p><strong>Teléfono:</strong> ${task.telefono ? task.telefono : '<span style="color:#888;">No registrado</span>'}</p>
        ${task.telefono ? `
          <div style="margin-bottom: 10px;">
            <a class="btn btn-success btn-sm"
               href="https://wa.me/${task.telefono}"
               target="_blank"
               style="width:100%;">
              <i class="bi bi-whatsapp"></i> WhatsApp
            </a>
          </div>
        ` : ''}
        ${
          (task.latitud && task.longitud) ? `
            <div style="margin-bottom: 10px;">
              <iframe
                width="100%"
                height="150"
                frameborder="0"
                style="border:0;border-radius:8px;"
                src="https://www.google.com/maps?q=${task.latitud},${task.longitud}&hl=es&z=16&output=embed"
                allowfullscreen>
              </iframe>
            </div>
          ` : ''
        }
        <button class="status-btn-aceptar" data-uid="${uid}" style="width:100%;margin-top:8px;">Aceptar Tarea</button>
      </div>
    `;
}).join('');
    }
  } catch (error) {
    console.error("Error al cargar los servicios del usuario:", error);
  }
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('status-btn-aceptar')) {
    const uid = e.target.getAttribute('data-uid');
    const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
    const tareasAceptadas = usuarioActual.tareasAceptadas || [];

    // Vuelve a obtener todasLasTareas del storage o de la última petición
    fetch(JSONBIN_URL_SERVICIOS, { method: 'GET', headers: JSONBIN_HEADERS })
      .then(res => res.json())
      .then(data => {
        const todasLasTareas = data.record?.servicios || [];
        // Busca la tarea por uid
        const tarea = todasLasTareas.find(task => (
          ((task.categoria || '') +
            (task.descripcion || '') +
            (task.direccion || '') +
            (task.presupuesto || '')
          ).replace(/\s+/g, '') === uid
        ));
        if (tarea) {
          const nuevaTarea = {
            categoria: tarea.categoria,
            descripcion: tarea.descripcion,
            direccion: tarea.direccion,
            presupuesto: tarea.presupuesto,
            estado: "Aceptada", // <-- Consistente con el JSON Bin
            uid: uid,
            telefono: tarea.telefono || '',
            latitud: tarea.latitud || '',
            longitud: tarea.longitud || ''
          };
          tareasAceptadas.push(nuevaTarea);
          usuarioActual.tareasAceptadas = tareasAceptadas;
          localStorage.setItem('totusCurrentUser', JSON.stringify(usuarioActual));
          // Cambia el estado en el array de todasLasTareas
          tarea.estado = "Aceptada"; // <-- Aquí también

          // Usa la URL sin /latest para PUT
          const JSONBIN_URL_SERVICIOS_PUT = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_SERVICIOS}`;

          fetch(JSONBIN_URL_SERVICIOS_PUT, {
            method: 'PUT',
            headers: {
              ...JSONBIN_HEADERS,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ servicios: todasLasTareas })
          }).then(() => {
            window.location.href = "historialTotus.html";
          });
        }
      });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
  const tareas = usuarioActual?.tareasAceptadas || [];
  const contenedor = document.getElementById('homeTareasContainer');
  if (tareas.length === 0) {
    contenedor.innerHTML = "<p>No tienes tareas aceptadas aún.</p>";
    return;
  }
  contenedor.innerHTML = tareas.map((tarea, idx) => `
    <div class="task-card">
      <span class="status">${tarea.estado || 'Aceptado'}</span>
      <h4>${tarea.categoria}</h4>
      <p><strong>Descripción:</strong> ${tarea.descripcion}</p>
      <p><strong>Dirección:</strong> ${tarea.direccion}</p>
      <p><strong>Presupuesto:</strong> $${tarea.presupuesto}</p>
      <p><strong>Teléfono:</strong> ${tarea.telefono ? tarea.telefono : '<span style="color:#888;">No registrado</span>'}</p>
      ${tarea.telefono ? `
        <div style="margin-bottom: 10px;">
          <a class="btn btn-success btn-sm"
             href="https://wa.me/${tarea.telefono}"
             target="_blank"
             style="width:100%;">
            <i class="bi bi-whatsapp"></i> WhatsApp
          </a>
        </div>
      ` : ''}
      <button class="btn btn-danger btn-sm" style="width:100%;" onclick="showHomeModal(${idx})" data-bs-toggle="modal" data-bs-target="#homeTaskModal">Ver más</button>
    </div>
  `).join('');
  window.homeTareas = tareas;
});

function showHomeModal(idx) {
  const tarea = window.homeTareas[idx];
  document.getElementById('homeModalCategory').textContent = tarea.categoria || '';
  document.getElementById('homeModalDescription').textContent = tarea.descripcion || '';
  document.getElementById('homeModalAddress').textContent = tarea.direccion || '';
  document.getElementById('homeModalBudget').textContent = tarea.presupuesto || '';
  document.getElementById('homeModalPhone').textContent = tarea.telefono ? tarea.telefono : 'No registrado';
  document.getElementById('homeModalWhatsapp').innerHTML = tarea.telefono
    ? `<a class="btn btn-success btn-sm" href="https://wa.me/${tarea.telefono}" target="_blank">
          <i class="bi bi-whatsapp"></i> WhatsApp
       </a>`
    : '';
  if (tarea.latitud && tarea.longitud) {
    document.getElementById('homeModalUbicacion').innerHTML = `
      <a href="https://www.google.com/maps/search/?api=1&query=${tarea.latitud},${tarea.longitud}" target="_blank">
        Ver ubicación en Google Maps
      </a>
    `;
  } else {
    document.getElementById('homeModalUbicacion').innerHTML = '';
  }
}

function showInfoModal(idx) {
  const tarea = window.tareasCoincidentes[idx];
  document.getElementById('homeModalCategory').textContent = tarea.categoria || '';
  document.getElementById('homeModalDescription').textContent = tarea.descripcion || '';
  document.getElementById('homeModalAddress').textContent = tarea.direccion || '';
  document.getElementById('homeModalBudget').textContent = tarea.presupuesto || '';
  document.getElementById('homeModalPhone').textContent = tarea.telefono ? tarea.telefono : 'No registrado';
  document.getElementById('homeModalWhatsapp').innerHTML = tarea.telefono
    ? `<a class="btn btn-success btn-sm" href="https://wa.me/${tarea.telefono}" target="_blank">
          <i class="bi bi-whatsapp"></i> WhatsApp
       </a>`
    : '';
  if (tarea.latitud && tarea.longitud) {
    document.getElementById('homeModalUbicacion').innerHTML = `
      <a href="https://www.google.com/maps/search/?api=1&query=${tarea.latitud},${tarea.longitud}" target="_blank">
        Ver ubicación en Google Maps
      </a>
    `;
  } else {
    document.getElementById('homeModalUbicacion').innerHTML = '';
  }
}

cargarServiciosDelUsuario();