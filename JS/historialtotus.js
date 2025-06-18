document.addEventListener('DOMContentLoaded', function() {
  const tareas = JSON.parse(localStorage.getItem('tareasAceptadas')) || [];
  const contenedor = document.getElementById('historialTareas');
  console.log(localStorage.getItem('tareasAceptadas'));
  if (tareas.length === 0) {
    contenedor.innerHTML = "<p>No tienes tareas aceptadas aún.</p>";
    return;
  }
  contenedor.innerHTML = tareas.map(tarea => {
    return `
      <div class="task-card">
        <span class="status">${tarea.estado || 'Aceptada'}</span>
        <h4>${tarea.categoria}</h4>
        <p><strong>Descripción:</strong> ${tarea.descripcion}</p>
        <p><strong>Dirección:</strong> ${tarea.direccion || 'No especificada'}</p>
        <p><strong>Presupuesto:</strong> $${tarea.presupuesto || '0'}</p>
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
        ${
          (tarea.latitud && tarea.longitud) ? `
            <div style="margin-bottom: 10px;">
              <iframe
                width="100%"
                height="150"
                frameborder="0"
                style="border:0;border-radius:8px;"
                src="https://www.google.com/maps?q=${tarea.latitud},${tarea.longitud}&hl=es&z=16&output=embed"
                allowfullscreen>
              </iframe>
            </div>
          ` : ''
        }
      </div>
    `;
  }).join('');
});