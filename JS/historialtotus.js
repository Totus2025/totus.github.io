document.addEventListener('DOMContentLoaded', function() {
  const usuarioActual = JSON.parse(localStorage.getItem('totusCurrentUser'));
  const tareas = usuarioActual?.tareasAceptadas || [];
  const contenedor = document.getElementById('historialTareas');
  if (tareas.length === 0) {
    contenedor.innerHTML = "<p>No tienes tareas aceptadas aún.</p>";
    return;
  }
  contenedor.innerHTML = tareas.map(tarea => `
    <div class="task-card">
      <span class="status">${tarea.estado || 'Aceptado'}</span>
      <h4>${tarea.categoria}</h4>
      <p><strong>Descripción:</strong> ${tarea.descripcion}</p>
      <p><strong>Dirección:</strong> ${tarea.direccion}</p>
      <p><strong>Presupuesto:</strong> $${tarea.presupuesto}</p>
    </div>
  `).join('');
});