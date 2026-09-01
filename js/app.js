// Reemplaza con tu URL de Apps Script que termina en /exec
const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycbxt-8XSZlitSE5LsIoXXdc6J8eL3KFIkL-cpkaKrtsjinDIcgBclhI5vWuIl7_KYAsl6A/exec?key=x{;naW$*t5h]z_1vv/R[1!-vS!pj7H?';

function cargarDatosESP32() {
    fetch(URL_GOOGLE_SHEETS)
        .then(response => response.json())
        .then(resultado => {
            if (resultado.ok && resultado.datos.length > 0) {
                // Obtenemos el último registro del array
                const lista = resultado.datos;
                const ultimo = lista[lista.length - 1];

                // Formatear timestamp si viene en formato epoch o texto
                let fechaFormateada = ultimo.timestamp;
                if (!isNaN(fechaFormateada)) {
                    const date = new Date(parseInt(fechaFormateada) * 1000);
                    fechaFormateada = date.toLocaleString();
                }

                // Inyectar los valores en el HTML
                document.getElementById('val-timestamp').innerText = fechaFormateada;
                document.getElementById('val-temp').innerText = Number(ultimo.temperatura).toFixed(2);
                document.getElementById('val-hum').innerText = Number(ultimo.humedad).toFixed(1);
                document.getElementById('val-pres').innerText = Number(ultimo.presion).toFixed(1);
                
                // Calcular batería si existe
                if (ultimo.bateria !== undefined) {
                    document.getElementById('val-bat').innerText = Math.round(Number(ultimo.bateria));
                }
            }
        })
        .catch(error => console.error("Error al conectar con Google Sheets:", error));
}

// Cargar al abrir la página
cargarDatosESP32();

// Actualizar cada 60 segundos automáticamente
setInterval(cargarDatosESP32, 60000);