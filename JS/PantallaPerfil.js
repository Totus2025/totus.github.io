const input = document.getElementById('profileInput');
const img = document.getElementById('profilePic');

// Al cargar la página, si hay una imagen guardada, mostrarla
window.addEventListener('DOMContentLoaded', () => {
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    img.src = savedImage;
  }
});

// Al seleccionar una nueva imagen, mostrarla y guardarla
input.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;
      img.src = imageData;
      localStorage.setItem('profileImage', imageData);
    };
    reader.readAsDataURL(file);
  }
});

// Cuando el usuario acepta una tarea
function aceptarTarea(tarea) {
  let tareasAceptadas = JSON.parse(localStorage.getItem('tareasAceptadas')) || [];
  tareasAceptadas.push(tarea);
  localStorage.setItem('tareasAceptadas', JSON.stringify(tareasAceptadas));
}

