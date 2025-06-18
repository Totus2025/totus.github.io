document.addEventListener('DOMContentLoaded', function() {
  const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
  const tareas = usuarioActual?.tareasAceptadas || [];
  const contenedor = document.getElementById('historialTareas'); // Esto era

  if (tareas.length === 0) {
    contenedor.innerHTML = "<p class='no-tasks'>No tienes tareas aceptadas aún.</p>";
    return;
  }

  contenedor.innerHTML = tareas.map(function(tarea, idx) {
    return (
      `<div class="task-card">
        <span class="status">${tarea.estado || 'Aceptada'}</span>
        <h4>${tarea.categoria}</h4>
        <p><strong>Descripción:</strong> ${tarea.descripcion}</p>
        <p><strong>Dirección:</strong> ${tarea.direccion}</p>
        <p><strong>Presupuesto:</strong> $${tarea.presupuesto}</p>
        <p><strong>Teléfono:</strong> ${tarea.telefono ? tarea.telefono : '<span style="color:#888;">No registrado</span>'}</p>
        ${tarea.telefono ? `
          <div style="margin-bottom: 10px;">
            <a class="btn btn-success btn-sm" href="https://wa.me/${tarea.telefono}" target="_blank" style="width:100%;">
              <i class="bi bi-whatsapp"></i> WhatsApp
            </a>
          </div>
        ` : ''}
      </div>`
    );
  }).join('');
});