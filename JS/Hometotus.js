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

    // Filtrar tareas por coincidencia de categoría (sin tildes)
    const tareasCoincidentes = todasLasTareas.filter(task => {
      const categoriaTarea = quitarTildes((task.categoria || '').trim().toLowerCase());
      return categoriaTarea === categoriaPrincipal || trabajosExtra.includes(categoriaTarea);
    });

    // Renderizar
    const homeContainer = document.getElementById("homeTareasContainer");
    if (homeContainer) {
      homeContainer.innerHTML = tareasCoincidentes.length === 0
        ? "<p>No hay tareas que coincidan con tu perfil.</p>"
        : tareasCoincidentes.map((task) => `
    <div class="task-card">
      <span class="status" data-status="${task.estado || 'Pendiente'}">${task.estado || 'Pendiente'}</span>
      <h2>${task.categoria}</h2>
      <p><strong>Descripción:</strong> ${task.descripcion}</p>
      <p><strong>Dirección:</strong> ${task.direccion || 'No especificada'}</p>
      <p><strong>Presupuesto:</strong> $${task.presupuesto || '0'}</p>
    </div>
  `).join('');
    }
  } catch (error) {
    console.error("Error al cargar los servicios del usuario:", error);
  }
}

cargarServiciosDelUsuario();