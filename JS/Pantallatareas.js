
    // Estos son solo ejemplos de datos de tareas (esto se obtendría del localStorage o base de datos o donde lo hizo Daniel )
    const tasks = [
      {
        categoria: "Mantenimiento",
        descripcion: "Reparar el grifo que está goteando en la cocina. Necesito que sea rápido.",
        presupuesto: "$50",
        direccion: "Calle Falsa 123, Ciudad",
        estado: "Pendiente"
      },
      {
        categoria: "Belleza",
        descripcion: "Maquillaje para una boda, debe ser profesional y durar todo el día.",
        presupuesto: "$100",
        direccion: "Av. Siempre Viva 456, Ciudad",
        estado: "Aceptada"
      },
      {
        categoria: "Doméstico",
        descripcion: "Limpieza profunda del departamento. Incluye cocina, baño y sala.",
        presupuesto: "$80",
        direccion: "Calle Luna 789, Ciudad",
        estado: "Completada"
      }
    ];

    const taskContainer = document.getElementById("taskContainer");

    // Generar las tareas en la pantalla
    function renderTasks() {
      taskContainer.innerHTML = ""; // Limpiar contenido previo

      tasks.forEach((task, index) => {
        const statusClass =
          task.estado === "Pendiente"
            ? "status-pending"
            : task.estado === "Aceptada"
            ? "status-accepted"
            : task.estado === "Completada"
            ? "status-completed"
            : "";

        const taskCard = `
          <div class="task-card">
            <span class="status ${statusClass}">${task.estado}</span>
            <h2>${task.categoria}</h2>
            <p>${task.descripcion.slice(0, 60)}...</p>
            <button class="btn btn-danger btn-sm" onclick="showModal(${index})" data-bs-toggle="modal" data-bs-target="#taskModal">Leer más</button>
          </div>
        `;

        taskContainer.innerHTML += taskCard;
      });
    }

    // Mostrar modal con detalles de la tarea
    function showModal(index) {
      const task = tasks[index];
      document.getElementById("modalCategory").textContent = task.categoria;
      document.getElementById("modalDescription").textContent = task.descripcion;
      document.getElementById("modalBudget").textContent = task.presupuesto;
      document.getElementById("modalAddress").textContent = task.direccion;
      document.getElementById("modalStatus").textContent = task.estado;
    }

    // Renderizar las tareas al cargar la página
    renderTasks();
