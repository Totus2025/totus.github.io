document.addEventListener('DOMContentLoaded', async () => {
  const LOCAL_STORAGE_SESSION_KEY = 'totusCurrentUser';
  const LOCAL_STORAGE_PROFILE_PIC_KEY = 'totusProfilePicture';
  const userData = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

  // Mostrar la foto de perfil guardada (estática, independiente de sesión)
  const profilePictureElement = document.getElementById('profilePicture');
  const staticProfilePicture = localStorage.getItem(LOCAL_STORAGE_PROFILE_PIC_KEY);
  if (staticProfilePicture && profilePictureElement) {
    profilePictureElement.src = staticProfilePicture;
  }

  // Verificar si hay sesión activa
  if (!userData) {
    window.location.href = "login.html"; // Redirigir al login si no hay sesión
    return;
  }

  const session = JSON.parse(userData);

  // Mostrar el correo del usuario
  const userEmailElement = document.getElementById('userEmail');
  userEmailElement.textContent = session.email;

  // Manejar la subida de nueva foto de perfil
  document.getElementById('uploadImage').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePictureElement.src = e.target.result;

        // Guardar la nueva foto en localStorage (ambas claves)
        session.profilePicture = e.target.result;
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(LOCAL_STORAGE_PROFILE_PIC_KEY, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Funcionalidad del modal y cerrar sesión
  const logoutLink = document.getElementById('logoutLink');
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');

  // Mostrar el modal al hacer clic en "Cerrar sesión"
  logoutLink.addEventListener('click', function (event) {
    event.preventDefault();
    confirmationModal.style.display = 'block';
  });

  // Confirmar cierre de sesión
  confirmLogout.addEventListener('click', function () {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    // ¡No se elimina la foto de perfil estática!
    window.location.href = "login.html";
  });

  // Cancelar cierre de sesión
  cancelLogout.addEventListener('click', function () {
    confirmationModal.style.display = 'none';
  });
});