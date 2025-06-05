
    document.addEventListener('DOMContentLoaded', () => {
      const LOCAL_STORAGE_SESSION_KEY = 'totusCurrentUser';
      const userData = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

      if (!userData) {
        window.location.href = "login.html"; // Redirigir al login si no hay sesión
        return;
      }

      const session = JSON.parse(userData);

      // Mostrar el correo del usuario
      const userEmailElement = document.getElementById('userEmail');
      userEmailElement.textContent = session.email;

      // Mostrar la fecha de registro
      const registrationDateElement = document.getElementById('registrationDate');
      const registrationDate = session.registrationDate || "2025-05-04"; 
      registrationDateElement.textContent = new Date(registrationDate).toLocaleDateString();

      // Mostrar la foto de perfil
      const profilePictureElement = document.getElementById('profilePicture');
      if (session.profilePicture) {
        profilePictureElement.src = session.profilePicture;
      }

      // Cambiar la foto de perfil
      const uploadImageInput = document.getElementById('uploadImage');
      uploadImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            profilePictureElement.src = e.target.result;

            // Guardar la nueva foto en localStorage
            session.profilePicture = e.target.result;
            localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
          };
          reader.readAsDataURL(file);
        }
      });
    });
 