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
    : tasks.map((task, index) => {
      // Clase según estado
      let statusClass = "status-pendiente";
      if (task.estado === "Aceptada") statusClass = "status-aceptada";
      else if (task.estado === "Finalizada") statusClass = "status-finalizada";
      // Puedes agregar más estados si los tienes

      return `
      <div class="task-card">
        <span class="status ${statusClass}">${task.estado || 'Pendiente'}</span>
        <h2>${task.categoria}</h2>
        <p>${task.descripcion.slice(0, 60)}...</p>
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
        <button class="btn btn-danger btn-sm" style="width:100%;" onclick="showModal(${index})" data-bs-toggle="modal" data-bs-target="#taskModal">Leer más</button>
      </div>
      `;
    }).join('');
  window.tasksFiltradas = tasks;
}

function showModal(index) {
  const task = window.tasksFiltradas[index];
  document.getElementById('modalCategory').textContent = task.categoria || '';
  document.getElementById('modalDescription').textContent = task.descripcion || '';
  document.getElementById('modalBudget').textContent = task.presupuesto || '';
  document.getElementById('modalAddress').textContent = task.direccion || '';
  document.getElementById('modalPhone').textContent = task.telefono ? task.telefono : 'No registrado';
  document.getElementById('modalStatus').textContent = task.estado || '';

  // Si tienes un contenedor para el botón de WhatsApp en el modal:
  if (document.getElementById('modalWhatsapp')) {
    document.getElementById('modalWhatsapp').innerHTML = task.telefono
      ? `<a class="btn btn-success btn-sm" href="https://wa.me/${task.telefono}" target="_blank">
            <i class="bi bi-whatsapp"></i> WhatsApp
         </a>`
      : '';
  }
}

cargarTareasDelCliente();
