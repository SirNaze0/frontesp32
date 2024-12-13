// URLs de la API
const urlback = 'https://backesp32-jr64.onrender.com';
const ENDPOINTS = {
    uploadEstudiantes: '/upload_estudiantes',
    getEstudiantes: '/get_estudiantes',
    getAsistencia: '/get_estudiantes_con_asistencia'
};

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const uploadStatus = document.getElementById('uploadStatus');
const studentsList = document.getElementById('studentsList');
const attendanceList = document.getElementById('attendanceList');
const tabButtons = document.querySelectorAll('.tab-btn');
const tableContainers = document.querySelectorAll('.table-container');
// Elementos del DOM adicionales
const addStudentButton = document.getElementById('addStudentButton');
const studentCodeInput = document.getElementById('studentCodeInput');
const studentNameInput = document.getElementById('studentNameInput');

// Manejador de eventos para el botón "Añadir Estudiante"
addStudentButton.addEventListener('click', async () => {
    const codigoEstudiante = studentCodeInput.value.trim();
    const nombre = studentNameInput.value.trim();

    if (!codigoEstudiante || !nombre) {
        showStatus('Por favor, completa ambos campos.', 'error');
        return;
    }

    const nuevoEstudiante = {
        codigo_estudiante: codigoEstudiante,
        nombre: nombre
    };

    try {
        const response = await fetch(`${urlback}/add_estudiante`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoEstudiante)
        });

        const data = await response.json();

        if (data.success) {
            showStatus('Estudiante añadido correctamente.', 'success');
            loadStudentsData(); // Recargar la lista de estudiantes
            studentCodeInput.value = '';
            studentNameInput.value = '';
        } else {
            showStatus(`Error al añadir estudiante: ${data.message}`, 'error');
        }
    } catch (error) {
        showStatus('Error al enviar datos al servidor.', 'error');
        console.error('Error:', error);
    }
});
document.getElementById('deleteStudentButton').addEventListener('click', () => {
    const studentCodeInput = document.getElementById('studentDeleteInput');
    const studentCode = studentCodeInput.value;
    const statusMessage = document.getElementById('deleteStudentStatus');

    // Verificar que el código no esté vacío
    if (!studentCode) {
        statusMessage.textContent = 'Por favor, ingrese un código válido.';
        statusMessage.style.color = 'red';
        return;
    }

    // Configurar la solicitud
    fetch(`${urlback}/delete_estudiante`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo_estudiante: studentCode }),
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(`Error en la solicitud: ${response.status}`);
    })
    .then((data) => {
        if (data.success) {
            statusMessage.textContent = data.message;
            statusMessage.style.color = 'green';
            // Limpiar el campo después de una operación exitosa
            studentCodeInput.value = '';
            loadStudentsData(); // Llama a la función para actualizar datos
        } else {
            statusMessage.textContent = data.message || 'Ocurrió un error.';
            statusMessage.style.color = 'red';
        }
    })
    .catch((error) => {
        console.error(error);
        statusMessage.textContent = 'Error al conectar con el servidor.';
        statusMessage.style.color = 'red';
    });
});

// Manejadores de eventos
uploadButton.addEventListener('click', handleFileUpload);
tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
});

// Cargar datos iniciales
loadStudentsData();
loadAttendanceData();

// Función para manejar la carga de archivos
async function handleFileUpload() {
    const file = fileInput.files[0];
    if (!file) {
        showStatus('Por favor seleccione un archivo', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${urlback}${ENDPOINTS.uploadEstudiantes}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showStatus('Archivo cargado exitosamente', 'success');
            loadStudentsData(); // Recargar la lista de estudiantes
        } else {
            showStatus(`Error: ${data.message}`, 'error');
        }
    } catch (error) {
        showStatus('Error al cargar el archivo', 'error');
        console.error('Error:', error);
    }
}

// Función para mostrar mensajes de estado
function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = 'status-message';
    uploadStatus.classList.add(type);

    setTimeout(() => {
        uploadStatus.textContent = '';
        uploadStatus.className = 'status-message';
    }, 5000);
}
// Función para cargar la lista de estudiantes
async function loadStudentsData() {
    try {
        const response = await fetch(`${urlback}${ENDPOINTS.getEstudiantes}`);
        const data = await response.json();

        if (data.success && data.data) {
            displayStudents(data.data);
        } else {
            console.error('Error al cargar estudiantes:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
    }
}

// Función para cargar los datos de asistencia
async function loadAttendanceData() {
    try {
        const response = await fetch(`${urlback}${ENDPOINTS.getAsistencia}`);
        const data = await response.json();

        if (data.success && data.data) {
            displayAttendance(data.data);
        } else {
            console.error('Error al cargar asistencia:', data.message);
        }
    } catch (error) {
        console.error('Error al cargar asistencia:', error);
    }
}


// Función para mostrar la lista de estudiantes
function displayStudents(students) {
    studentsList.innerHTML = '';
    
    Object.entries(students).forEach(([codigo, student]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${codigo}</td>
            <td>${student.Nombre}</td>
            <td>${student.Android_id || 'No registrado'}</td>
        `;
        studentsList.appendChild(row);
    });
    console.log(students);
    createStudentsVsAttendanceChart(students);
}

// Función para mostrar la lista de asistencia
function displayAttendance(attendance) {
    attendanceList.innerHTML = '';  // Limpiar la tabla antes de llenarla
    
    Object.entries(attendance).forEach(([codigo, data]) => {
        // Verifica que el campo 'asistio' esté presente en los datos del estudiante
        if (data.hasOwnProperty('asistio')) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.Codigo_estudiante || 'No registrado'}</td>  <!-- Usando 'Codigo_estudiante' -->
                <td>${codigo}</td>
                <td>${data.asistio ? 'Presente' : 'Ausente'}</td>
            `;
            attendanceList.appendChild(row);  // Añadir la fila a la tabla
        }
    });

    // Crear el gráfico de asistencia diaria después de cargar los datos
    createDailyAttendanceChart(attendance);
}


// Función para cambiar entre pestañas
function switchTab(tabName) {
    // Actualizar botones
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });

    // Actualizar contenedores
    tableContainers.forEach(container => {
        container.classList.toggle('active', 
            (tabName === 'students' && container.id === 'studentsTable') ||
            (tabName === 'attendance' && container.id === 'attendanceTable') ||
            (tabName === 'dailyAttendance' && container.id === 'dailyAttendanceTable') ||
            (tabName === 'studentsVsAttendance' && container.id === 'studentsVsAttendanceTable')
        );
    });
}



// Función auxiliar para formatear fechas
function formatDate(dateString) {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function createStudentsVsAttendanceChart(studentsData) {
    // Arreglos para los datos del gráfico
    const studentLabels = []; // Nombres de los estudiantes
    const attendanceCounts = []; // Número de fechas (asistencias) por estudiante

    // Preparar los datos
    for (const studentId in studentsData) {
        const student = studentsData[studentId];
        studentLabels.push(student.Nombre); // Agregar el nombre del estudiante
        attendanceCounts.push(student.fechas.length); // Contar las fechas (asistencias) y agregar
    }

    // Datos para el gráfico
    const data = {
        labels: studentLabels, // Nombres de los estudiantes
        datasets: [{
            label: 'Asistencias',
            data: attendanceCounts, // Número de fechas por estudiante
            backgroundColor: '#4caf50', // Color de las barras
            borderColor: '#388e3c', // Color del borde de las barras
            borderWidth: 1
        }]
    };

    // Opciones del gráfico
    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true, // Comienza desde 0 en el eje Y
                title: {
                    display: true,
                    text: 'Cantidad de Fechas'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Estudiantes'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top', // Posición de la leyenda
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let percentage = ((context.raw / attendanceCounts.reduce((a, b) => a + b, 0)) * 100).toFixed(2);
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Crear el gráfico de barras
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // Tipo de gráfico
        data: data, // Los datos
        options: options // Las opciones de configuración
    });
}


function createDailyAttendanceChart(attendance) {
    const presentCount = Object.values(attendance).filter(student => student.asistio === true).length;
    const absentCount = Object.values(attendance).filter(student => student.asistio === false).length;

    const totalCount = presentCount + absentCount;

    // Datos para el gráfico
    const data = {
        labels: ['Presentes', 'Ausentes'],
        datasets: [{
            data: [presentCount, absentCount],
            backgroundColor: ['#4caf50', '#f44336'],
            hoverBackgroundColor: ['#45a049', '#e53935']
        }]
    };

    // Opciones del gráfico
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let percentage = ((context.raw / totalCount) * 100).toFixed(2);
                        return `${context.label}: ${context.raw} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Crear el gráfico de pastel
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}
