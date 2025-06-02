const JSONBIN_BIN_SERVICIOS = '682c98548a456b7966a1f271';
const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';
const JSONBIN_URL_SERVICIOS = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_SERVICIOS}/latest`;
const JSONBIN_HEADERS = { 'X-Master-Key': JSONBIN_API_KEY };

const taskContainer = document.getElementById("taskContainer");

async function cargarTareasDelCliente() {
  try {
    const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
    const clienteId = usuarioActual?.userId;
    const response = await fetch(JSONBIN_URL_SERVICIOS, { method: 'GET', headers: JSONBIN_HEADERS });
    const data = await response.json();
    const todasLasTareas = data.record?.servicios || [];
    const tareasDelCliente = todasLasTareas.filter(
      t => (t.cliente_id || '').trim().toLowerCase() === (clienteId || '').trim().toLowerCase()
    );
    renderTasks(tareasDelCliente);
  } catch (error) {
    taskContainer.innerHTML = "<p>Ocurrió un error al cargar tus tareas.</p>";
  }
}

function renderTasks(tasks) {
  taskContainer.innerHTML = tasks.length === 0
    ? "<p>No tienes tareas registradas todavía.</p>"
    : tasks.map((task, index) => `
      <div class="task-card">
        <span class="status">${task.estado || 'Pendiente'}</span>
        <h2>${task.categoria}</h2>
        <p>${task.descripcion.slice(0, 60)}...</p>
        <button class="btn btn-danger btn-sm" onclick="showModal(${index})" data-bs-toggle="modal" data-bs-target="#taskModal">Leer más</button>
      </div>
    `).join('');
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

cargarTareasDelCliente();
