 let total = 0;

    function actualizarTotal() {
      total = 0;
      const precios = document.querySelectorAll('.precio-servicio');
      precios.forEach(input => {
        const valor = parseFloat(input.value);
        if (!isNaN(valor)) total += valor;
      });
      document.getElementById('total').textContent = `Total: $${total.toFixed(2)}`;
    }

    function agregarServicio() {
      const div = document.createElement('div');
      div.classList.add('servicio');
      div.innerHTML = `
        <label>Servicio:
          <input type="text" class="nombre-servicio" placeholder="Ej: Envío de comida" />
        </label>
        <label>Precio:
          <input type="number" class="precio-servicio" placeholder="Ej: 5.99" step="0.01" min="0" />
        </label>
      `;
      document.getElementById('servicios').appendChild(div);
      div.querySelector('.precio-servicio').addEventListener('input', actualizarTotal);
    }

    document.querySelectorAll('.precio-servicio').forEach(input => {
      input.addEventListener('input', actualizarTotal);
    });

    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: total.toFixed(2)
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert('Pago completado por ' + details.payer.name.given_name);
        });
      }
    }).render('#paypal-button-container');