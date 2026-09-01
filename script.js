// Reemplaza esto con tu URL de la aplicación web de Apps Script (la que termina en /exec)
const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycbxt-8XSZlitSE5LsIoXXdc6J8eL3KFIkL-cpkaKrtsjinDIcgBclhI5vWuIl7_KYAsl6A/exec?key=x{;naW$*t5h]z_1vv/R[1!-vS!pj7H?';

function obtenerDatos() {
    fetch(URL_GOOGLE_SHEETS)
        .then(response => response.json())
        .then(resultado => {
            if (resultado.ok) {
                console.log("Datos obtenidos:", resultado.datos);
                
                // Mostrar el último registro en la página web
                const ultimos = resultado.datos;
                if (ultimos.length > 0) {
                    const ultimo = ultimos[ultimos.length - 1];
                    document.getElementById('lecturas').innerHTML = `
                        <p>Temperatura: ${ultimo.temperatura} °C</p>
                        <p>Humedad: ${ultimo.humedad} %</p>
                        <p>Presión: ${ultimo.presion} hPa</p>
                        <p>Batería: ${ultimo.bateria}</p>
                    `;
                }
            } else {
                console.error("Error:", resultado.error);
            }
        })
        .catch(error => console.error("Error de conexión:", error));
}

// Ejecutar al cargar la página
obtenerDatos();