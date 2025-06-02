document.addEventListener('DOMContentLoaded', () => {
  const LOCAL_STORAGE_SESSION_KEY = 'totusCurrentUser';
  const userData = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

  if (!userData) {
    window.location.href = "login.html";
    return;
  }

  const session = JSON.parse(userData);
  document.getElementById('userEmail').textContent = session.email || "";

  const profilePictureElement = document.getElementById('profilePicture');

  // Cargar foto de perfil guardada en localStorage (si existe)
  if (session.profilePicture) {
    profilePictureElement.src = session.profilePicture;
  }

  // Manejar la subida de nueva foto de perfil (como base64)
  document.getElementById('uploadImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const imageUrl = e.target.result;
      profilePictureElement.src = imageUrl;
      session.profilePicture = imageUrl;
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
    };
    reader.readAsDataURL(file);
  });

  // Modal de cerrar sesión igual que ya tienes
  const logoutLink = document.getElementById('logoutLink');
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');

  logoutLink.addEventListener('click', function(event) {
    event.preventDefault();
    confirmationModal.style.display = 'block';
  });

  confirmLogout.addEventListener('click', function() {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    window.location.href = "login.html";
  });

  cancelLogout.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
  });
});