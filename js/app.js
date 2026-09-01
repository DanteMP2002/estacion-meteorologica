// =====================================================
// ESTACIÓN METEOROLÓGICA - SCRIPT PRINCIPAL UNIFICADO
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. RELOJ Y FECHA EN TIEMPO REAL
    ===================================================== */
    function actualizarReloj() {
        const ahora = new Date();

        const horas = String(ahora.getHours()).padStart(2, "0");
        const minutos = String(ahora.getMinutes()).padStart(2, "0");
        const segundos = String(ahora.getSeconds()).padStart(2, "0");

        const clock = document.getElementById("digital-clock");
        if (clock) {
            clock.textContent = `${horas}:${minutos}:${segundos}`;
        }

        const dias = [
            "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
        ];

        const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        const fecha = document.getElementById("digital-date");
        if (fecha) {
            fecha.textContent = `${dias[ahora.getDay()]} ${ahora.getDate()} de ${meses[ahora.getMonth()]} ${ahora.getFullYear()}`;
        }
    }

    actualizarReloj();
    setInterval(actualizarReloj, 1000);


    /* =====================================================
       2. LECTURA DE DATOS DEL ESP32 (GOOGLE SHEETS)
    ===================================================== */
    // Reemplaza esta URL con tu enlace de Google Apps Script (que termina en /exec)
    const URL_GOOGLE_SHEETS = 'https://script.google.com/macros/s/AKfycbxt-8XSZlitSE5LsIoXXdc6J8eL3KFIkL-cpkaKrtsjinDIcgBclhI5vWuIl7_KYAsl6A/exec?key=x{;naW$*t5h]z_1vv/R[1!-vS!pj7H?';

    function cargarDatosESP32() {
        fetch(URL_GOOGLE_SHEETS)
            .then(response => response.json())
            .then(resultado => {
                if (resultado.ok && resultado.datos.length > 0) {
                    const lista = resultado.datos;
                    const ultimo = lista[lista.length - 1]; // Última medición

                    let fechaFormateada = ultimo.timestamp;
                    if (!isNaN(fechaFormateada)) {
                        const date = new Date(parseInt(fechaFormateada) * 1000);
                        fechaFormateada = date.toLocaleString();
                    }

                    // Inyectar en el HTML
                    const valTimestamp = document.getElementById('val-timestamp');
                    const valTemp = document.getElementById('val-temp');
                    const valHum = document.getElementById('val-hum');
                    const valPres = document.getElementById('val-pres');
                    const valBat = document.getElementById('val-bat');

                    if (valTimestamp) valTimestamp.innerText = fechaFormateada;
                    if (valTemp) valTemp.innerText = Number(ultimo.temperatura).toFixed(2);
                    if (valHum) valHum.innerText = Number(ultimo.humedad).toFixed(1);
                    if (valPres) valPres.innerText = Number(ultimo.presion).toFixed(1);
                    if (valBat && ultimo.bateria !== undefined) {
                        valBat.innerText = Math.round(Number(ultimo.bateria));
                    }
                }
            })
            .catch(error => console.error("Error al conectar con Google Sheets:", error));
    }

    // Cargar al iniciar y refrescar cada 60 segundos
    cargarDatosESP32();
    setInterval(cargarDatosESP32, 60000);


    /* =====================================================
       3. REPRODUCTOR DE MÚSICA
    ===================================================== */
    const musicPlayer = document.getElementById("music-player");
    const musicToggle = document.getElementById("music-toggle");
    const musicClose = document.getElementById("music-close");
    const musicPlay = document.getElementById("music-play");
    const musicVolume = document.getElementById("music-volume");
    const musicRepeat = document.getElementById("music-repeat");
    const musicStatus = document.getElementById("music-status");
    const music = document.getElementById("background-music");
    const vinyl = document.getElementById("vinyl");

    // Verificar si existen los elementos del reproductor antes de aplicarles lógica
    if (musicPlayer && musicToggle && musicClose && musicPlay && musicVolume && musicRepeat && musicStatus && music && vinyl) {

        const savedVolume = localStorage.getItem("musicVolume");
        const savedRepeat = localStorage.getItem("musicRepeat");
        const savedTime = localStorage.getItem("musicCurrentTime");
        const savedState = localStorage.getItem("musicIsPlaying");

        // Restaurar Volumen
        if (savedVolume !== null) {
            musicVolume.value = savedVolume;
            music.volume = parseFloat(savedVolume);
        } else {
            music.volume = 0.5;
        }

        // Restaurar Bucle
        if (savedRepeat === "true") {
            musicRepeat.checked = true;
        }
        music.loop = musicRepeat.checked;

        // Restaurar Posición Exacta
        if (savedTime !== null) {
            music.currentTime = parseFloat(savedTime);
        }

        // Restaurar Reproducción Automática
        if (savedState === "true") {
            music.play()
                .then(() => actualizarEstadoMusica())
                .catch(() => {
                    localStorage.setItem("musicIsPlaying", "false");
                    actualizarEstadoMusica();
                });
        }

        music.addEventListener("timeupdate", function () {
            localStorage.setItem("musicCurrentTime", music.currentTime);
        });

        musicToggle.addEventListener("click", function () {
            musicPlayer.classList.toggle("open");
        });

        musicClose.addEventListener("click", function () {
            musicPlayer.classList.remove("open");
        });

        musicPlay.addEventListener("click", function () {
            if (music.paused) {
                music.play()
                    .then(function () {
                        localStorage.setItem("musicIsPlaying", "true");
                        actualizarEstadoMusica();
                    })
                    .catch(function () {
                        musicStatus.textContent = "No se pudo reproducir";
                    });
            } else {
                music.pause();
                localStorage.setItem("musicIsPlaying", "false");
                actualizarEstadoMusica();
            }
        });

        musicVolume.addEventListener("input", function () {
            const volumen = parseFloat(musicVolume.value);
            music.volume = volumen;
            localStorage.setItem("musicVolume", volumen);
        });

        musicRepeat.addEventListener("change", function () {
            music.loop = musicRepeat.checked;
            localStorage.setItem("musicRepeat", musicRepeat.checked);
        });

        music.addEventListener("play", function () {
            localStorage.setItem("musicIsPlaying", "true");
            actualizarEstadoMusica();
        });

        music.addEventListener("pause", function () {
            localStorage.setItem("musicIsPlaying", "false");
            actualizarEstadoMusica();
        });

        music.addEventListener("ended", function () {
            if (!music.loop) {
                localStorage.setItem("musicIsPlaying", "false");
                localStorage.setItem("musicCurrentTime", "0");
            }
            actualizarEstadoMusica();
        });

        function actualizarEstadoMusica() {
            if (!music.paused) {
                musicPlay.textContent = "⏸";
                musicStatus.textContent = "Reproduciendo";
                vinyl.classList.add("playing");
            } else {
                musicPlay.textContent = "▶";
                musicStatus.textContent = "Música detenida";
                vinyl.classList.remove("playing");
            }
        }

        actualizarEstadoMusica();
    }

});
// =====================================================
// FUNCIONES DE BATERÍA (Equivalente a bateria.php)
// =====================================================

function bateriaAPorcentaje(valorCrudo) {
    if (valorCrudo === null || valorCrudo === "" || valorCrudo === undefined) {
        return null;
    }

    // Si viene como texto con coma, la cambiamos por punto
    if (typeof valorCrudo === 'string') {
        valorCrudo = valorCrudo.replace(',', '.').trim();
    }

    let numero = parseFloat(valorCrudo);
    if (isNaN(numero)) return null;

    let porcentaje = Math.round(numero);
    return Math.max(0, Math.min(100, porcentaje));
}

function bateriaClaseNivel(porcentaje) {
    if (porcentaje === null) return "battery-desconocida";
    if (porcentaje <= 20) return "battery-baja";
    if (porcentaje <= 60) return "battery-media";
    return "battery-alta";
}

// Dentro de tu función cargarDatosESP32(), justo donde procesas los datos:
if (ultimo.bateria !== undefined) {
    const valorBateria = bateriaAPorcentaje(ultimo.bateria);
    const claseBateria = bateriaClaseNivel(valorBateria);

    const valBat = document.getElementById('val-bat');
    if (valBat) valBat.innerText = valorBateria !== null ? valorBateria : '--';

    // Si tienes un contenedor específico para el Badge de batería en el header:
    const headerBatteryContainer = document.getElementById('header-battery-badge');
    if (headerBatteryContainer && valorBateria !== null) {
        headerBatteryContainer.className = `battery-badge ${claseBateria}`;
        headerBatteryContainer.innerHTML = `<span class="battery-icon">🔋</span><span class="battery-value">${valorBateria}%</span>`;
        headerBatteryContainer.style.display = 'flex';
    } else if (headerBatteryContainer) {
        headerBatteryContainer.style.display = 'none';
    }
}
let miGrafica = null;

function renderizarGrafica(etiquetas, datosTemperatura, datosHumedad) {
    const ctx = document.getElementById('graficaSensores').getContext('2d');
    
    if (miGrafica) {
        miGrafica.destroy(); // Destruye la gráfica anterior para evitar solapamientos al actualizar
    }

    miGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas, // Ejemplo: ['12:00', '12:05', '12:10']
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: datosTemperatura,
                    borderColor: '#ff6384',
                    tension: 0.2
                },
                {
                    label: 'Humedad (%)',
                    data: datosHumedad,
                    borderColor: '#36a2eb',
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
// Ejemplo de llamada tras recibir los datos de Google Sheets
function actualizarDashboard(registros) {
    // Suponiendo que 'registros' es un array de objetos con la data
    const etiquetas = registros.map(r => r.hora);
    const temperaturas = registros.map(r => parseFloat(r.temperatura));
    const humedades = registros.map(r => parseFloat(r.humedad));

    renderizarGrafica(etiquetas, temperaturas, humedades);
}