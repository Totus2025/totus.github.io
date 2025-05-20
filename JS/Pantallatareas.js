const JSONBIN_BIN_SERVICIOS = '6816d5668a456b79669734d8'; // <-- el mismo bin donde guardas tareas
const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';

const JSONBIN_URL_SERVICIOS = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_SERVICIOS}/latest`;
const JSONBIN_HEADERS = {
  'X-Master-Key': JSONBIN_API_KEY
};

const taskContainer = document.getElementById("taskContainer");

async function cargarTareasDelCliente() {
  try {
    // Obtener usuario actual
    const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser')) || JSON.parse(localStorage.getItem('nombre_de_tu_sesion'));
    const clienteId = usuarioActual?.id;

    if (!clienteId) {
      alert("No se encontró información del usuario.");
      return;
    }

    // Obtener tareas desde JSONBin
    const response = await fetch(JSONBIN_URL_SERVICIOS, {
      method: 'GET',
      headers: JSONBIN_HEADERS
    });
    const data = await response.json();
    const todasLasTareas = data.record?.servicios || [];

    // Filtrar solo las del cliente actual
    const tareasDelCliente = todasLasTareas.filter(t => t.cliente_id === clienteId);

    renderTasks(tareasDelCliente);
  } catch (error) {
    console.error("Error al cargar las tareas:", error);
    taskContainer.innerHTML = "<p>Ocurrió un error al cargar tus tareas.</p>";
  }
}

function renderTasks(tasks) {
  taskContainer.innerHTML = "";

  if (tasks.length === 0) {
    taskContainer.innerHTML = "<p>No tienes tareas registradas todavía.</p>";
    return;
  }

  tasks.forEach((task, index) => {
    const statusClass =
      task.estado === "Pendiente"
        ? "status-pending"
        : task.estado === "Aceptada"
        ? "status-accepted"
        : task.estado === "Completada"
        ? "status-completed"
        : "";

    const taskCard = `
      <div class="task-card">
        <span class="status ${statusClass}">${task.estado || 'Pendiente'}</span>
        <h2>${task.categoria}</h2>
        <p>${task.descripcion.slice(0, 60)}...</p>
        <button class="btn btn-danger btn-sm" onclick="showModal(${index})" data-bs-toggle="modal" data-bs-target="#taskModal">Leer más</button>
      </div>
    `;

    taskContainer.innerHTML += taskCard;
  });

  // Guarda las tareas globalmente para el modal
  window.tasksFiltradas = tasks;
}

function showModal(index) {
  const task = window.tasksFiltradas[index];
  document.getElementById("modalCategory").textContent = task.categoria;
  document.getElementById("modalDescription").textContent = task.descripcion;
  document.getElementById("modalBudget").textContent = task.presupuesto;
  document.getElementById("modalAddress").textContent = task.direccion;
  document.getElementById("modalStatus").textContent = task.estado || 'Pendiente';
}

// Llama esta función al cargar la página
cargarTareasDelCliente();
