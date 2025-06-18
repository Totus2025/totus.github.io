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
  window.homeTareas =