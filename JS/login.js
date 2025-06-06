// SPLASH DE BIENVENIDA
    const splash = document.getElementById('splash');
    const mainContainer = document.getElementById('mainContainer');
    // Al cargar la página, mostrar splash y luego el login
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        splash.classList.add('hide');
        mainContainer.style.display = 'block';
        setTimeout(() => { splash.style.display = 'none'; }, 900);
      }, 2300); // Tiempo de bienvenida (ms)
    });

    // ==== LÓGICA LOGIN Y REGISTRO ====
    const JSONBIN_BIN_ID = '6816d5668a456b79669734d8';
    const JSONBIN_API_KEY = '$2a$10$CT888X18GRmHBcV11efmxe.3Q1SsEppgTzBpNcboYWuNuKZGQR/P6';
    const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
    const JSONBIN_HEADERS = {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    };
    const LOCAL_STORAGE_SESSION_KEY = 'totusCurrentUser';
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginText = document.getElementById('loginText');
    const registerText = document.getElementById('registerText');
    const loginSpinner = document.getElementById('loginSpinner');
    const registerSpinner = document.getElementById('registerSpinner');
    const loginAlert = document.getElementById('loginAlert');
    const registerAlert = document.getElementById('registerAlert');

    function generateUserId() {
      return 'cliente_' + Math.random().toString(36).substr(2, 9);
    }

    showRegister.addEventListener('click', () => {
      loginSection.classList.add('hidden');
      registerSection.classList.remove('hidden');
      hideAlert(registerAlert);
    });
    showLogin.addEventListener('click', () => {
      registerSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
      hideAlert(loginAlert);
    });

    function showAlert(element, message, isSuccess) {
      element.textContent = message;
      element.className = `alert alert-${isSuccess ? 'success' : 'error'}`;
      element.style.display = 'block';
      setTimeout(() => { hideAlert(element); }, 5000);
    }
    function hideAlert(element) { element.style.display = 'none'; }
    function showLoading(button, textElement, spinner) {
      button.disabled = true;
      textElement.style.display = 'none';
      spinner.classList.remove('hidden');
    }
    function hideLoading(button, textElement, spinner) {
      button.disabled = false;
      textElement.style.display = 'inline';
      spinner.classList.add('hidden');
    }
    async function getUsers() {
      try {
        const response = await fetch(JSONBIN_URL, { method: 'GET', headers: JSONBIN_HEADERS });
        if (!response.ok) throw new Error('Error al obtener usuarios');
        const data = await response.json();
        return data.record.users || [];
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
      }
    }
    async function saveUsers(users) {
      try {
        const response = await fetch(JSONBIN_URL, {
          method: 'PUT',
          headers: JSONBIN_HEADERS,
          body: JSON.stringify({ users })
        });
        if (!response.ok) throw new Error('Error al guardar usuarios');
        return true;
      } catch (error) {
        console.error('Error al guardar usuarios:', error);
        return false;
      }
    }
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      if (password.length < 6) {
        showAlert(registerAlert, 'La contraseña debe tener al menos 6 caracteres', false);
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        showAlert(registerAlert, 'Por favor ingresa un correo electrónico válido', false);
        return;
      }
      showLoading(registerBtn, registerText, registerSpinner);
      try {
        const users = await getUsers();
        const userExists = users.some(user => user.email === email);
        if (userExists) {
          showAlert(registerAlert, 'Este correo ya está registrado', false);
          hideLoading(registerBtn, registerText, registerSpinner);
          return;
        }
        const newUser = {
          id: generateUserId(),
          email,
          password,
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...users, newUser];
        const saveResult = await saveUsers(updatedUsers);
        if (!saveResult) throw new Error('No se pudo guardar el usuario');
        showAlert(registerAlert, '¡Registro exitoso! Ahora puedes iniciar sesión', true);
        registerForm.reset();
        setTimeout(() => {
          registerSection.classList.add('hidden');
          loginSection.classList.remove('hidden');
          hideAlert(registerAlert);
        }, 2000);
      } catch (error) {
        console.error('Error en registro:', error);
        showAlert(registerAlert, 'Error al registrar: ' + error.message, false);
      } finally {
        hideLoading(registerBtn, registerText, registerSpinner);
      }
    });
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      showLoading(loginBtn, loginText, loginSpinner);
      try {
        const users = await getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          showAlert(loginAlert, '¡Inicio de sesión exitoso! Redirigiendo...', true);
          const sessionData = {
            userId: user.id,
            email: user.email,
            loggedIn: true,
            lastActivity: new Date().getTime(),
            expiresAt: new Date().getTime() + (60 * 60 * 1000)
          };
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(sessionData));
          
          // Una línea nueva de código
          localStorage.setItem('tipoUsuario', 'cliente');

          setTimeout(() => { window.location.href = "index.html"; }, 1500);
        } else {
          showAlert(loginAlert, 'Correo o contraseña incorrectos', false);
        }
      } catch (error) {
        console.error('Error en login:', error);
        showAlert(loginAlert, 'Error al iniciar sesión: ' + error.message, false);
      } finally {
        hideLoading(loginBtn, loginText, loginSpinner);
      }
    });
    // Sesión activa al cargar
    document.addEventListener('DOMContentLoaded', async () => {
      const userData = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (userData) {
        const session = JSON.parse(userData);
        const now = new Date().getTime();
        if (now < session.expiresAt) {
          window.location.href = "home.html";
        } else {
          localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        }
      }
      try {
        await getUsers();
      } catch (error) {
        showAlert(loginAlert, 'Error al conectar con la base de datos. Intente nuevamente más tarde.', false);
      }
    });