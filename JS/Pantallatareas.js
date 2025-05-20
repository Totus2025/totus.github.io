const JSONBIN_BIN_ID = 'TU_BIN_ID'; // Reemplaza con el tuyo
const JSONBIN_API_KEY = 'TU_API_KEY'; // Reemplaza con el tuyo

const cliente = JSON.parse(localStorage.getItem('clienteActivo'));
if (!cliente || !cliente.correo) {
  alert('No hay un cliente activo. Inicia sesión primero.');
  // window.location.href = 'login.html'; // opcional
}

const taskContainer = document.getElementById("taskContainer");

async function cargarTareasDelCliente() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    });

    if (!res.ok) throw new Error("No se pudieron cargar las tareas");

    const data = await res.json();
    const todasLasTareas = Array.isArray(data.record) ? data.record : [];

    // Filtrar solo tareas del cliente actual
    const tareasDelCliente = todasLasTareas.filter(t => t.clienteCorreo === cliente.correo);

    renderTasks(tareasDelCliente);

  } catch (error) {
    console.error('Error al cargar las tareas:', error);
    taskContainer.innerHTML = `<p>Error al cargar tus tareas.</p>`;
  }
}

function renderTasks(tareas) {
  taskContainer.innerHTML = "";

  if (tareas.length === 0) {
    taskContainer.innerHTML = `<p>No tienes tareas registradas.</p>`;
    return;
  }

  tareas.forEach((task, index) => {
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
        <span class="status ${statusClass}">${task.estado}</span>
        <h2>${task.categoria}</h2>
        <p>${task.descripcion.slice(0, 60)}...</p>
        <button class="btn btn-danger btn-sm" onclick="showModal(${index})" data-bs-toggle="modal" data-bs-target="#taskModal">Leer más</button>
      </div>
    `;

    taskContainer.innerHTML += taskCard;
  });
}

// Opcional: mostrar modal con detalles
function showModal(index) {
  // Usar `tareasDelCliente[index]` en este caso, puedes almacenarlo en una variable global si necesitas
}

// Ejecutar al cargar
cargarTareasDelCliente();
