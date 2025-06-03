// Subir imagen a imgbb y guardar la URL en JSONBin
async function subirImagen(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://api.imgbb.com/1/upload?key=7d3d0e78587384eedbb0103e1ea9c9e2", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("Error subiendo la imagen");
    }
    const data = await response.json();
    return data.data.url; // Devuelve la URL de la imagen
}

async function guardarEnJSONBin(imageUrl) {
    const jsonData = { imagen_url: imageUrl };

    const response = await fetch("https://api.jsonbin.io/v3/b", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": "$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6"
        },
        body: JSON.stringify(jsonData)
    });
    if (!response.ok) {
        throw new Error("Error guardando la URL en JSONBin");
    }
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const LOCAL_STORAGE_SESSION_KEY = 'totusCurrentUser';
    const LOCAL_STORAGE_PROFILE_PIC_KEY = 'totusProfilePicture';
    const userData = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

    // Mostrar la imagen de perfil esté o no logueado el usuario
    const profilePictureElement = document.getElementById('profilePicture');
    const staticProfilePicture = localStorage.getItem(LOCAL_STORAGE_PROFILE_PIC_KEY);
    if (staticProfilePicture && profilePictureElement) {
        profilePictureElement.src = staticProfilePicture;
    }

    if (!userData) {
        // Si no hay usuario, sólo mostramos la foto estática y no seguimos
        return;
    }

    const session = JSON.parse(userData);
    document.getElementById('userEmail').textContent = session.email || "";

    // Manejar la subida de nueva foto de perfil
    document.getElementById('uploadImage').addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Subir la imagen y obtener la URL
            const imageUrl = await subirImagen(file);
            // Guardar la URL en JSONBin (opcional)
            await guardarEnJSONBin(imageUrl);

            // Actualizar la imagen de perfil en la interfaz
            profilePictureElement.src = imageUrl;

            // Guardar la imagen en el objeto de sesión actual y en la clave global
            session.profilePicture = imageUrl;
            localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
            localStorage.setItem(LOCAL_STORAGE_PROFILE_PIC_KEY, imageUrl);

            alert("Imagen subida y almacenada correctamente.");
        } catch (error) {
            alert(error.message);
        }
    });

    // Modal de cerrar sesión
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
        // NO quitamos la foto de perfil estática
        window.location.href = "login.html";
    });

    cancelLogout.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });
});