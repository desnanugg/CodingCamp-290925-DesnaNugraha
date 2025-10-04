// Ambil elemen DOM yang dibutuhkan
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const addButton = document.getElementById('add-button');
const taskListBody = document.getElementById('task-list-body');
const deleteAllButton = document.getElementById('delete-all-button');
const filterButton = document.getElementById('filter-button');

// Variabel untuk melacak status filter. Filter awal: tampilkan SEMUA.
let currentFilter = 'ALL'; 

// --- FUNGSI UTILITY (Local Storage) ---

/** Mengambil daftar tugas dari Local Storage. */
function getTasks() {
    const tasks = localStorage.getItem('tasks');
    // Pastikan ID adalah angka (menggunakan parseInt)
    return tasks ? JSON.parse(tasks).map(task => ({
        ...task,
        id: parseInt(task.id)
    })) : [];
}

/** Menyimpan daftar tugas ke Local Storage. */
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- FUNGSI RENDER (Menampilkan ke HTML) ---

/**
 * Merender daftar tugas ke tabel HTML berdasarkan filter saat ini.
 */
function renderTasks() {
    const allTasks = getTasks();
    let tasksToDisplay = allTasks;

    // Terapkan filter
    if (currentFilter === 'PENDING') {
        tasksToDisplay = allTasks.filter(task => !task.completed);
        filterButton.textContent = 'SHOW ALL';
    } else {
        filterButton.textContent = 'FILTER (Pending)';
    }

    taskListBody.innerHTML = ''; 

    if (tasksToDisplay.length === 0) {
        const noTaskRow = `
            <tr>
                <td colspan="4" class="no-task-message">
                    ${currentFilter === 'PENDING' ? 'No pending task found' : 'No task found'}
                </td>
            </tr>
        `;
        taskListBody.innerHTML = noTaskRow;
        return;
    }

    tasksToDisplay.forEach(task => {
        const taskClass = task.completed ? 'task-completed' : '';
        const statusText = task.completed ? 'Completed' : 'Pending';
        const statusClass = task.completed ? 'status-completed' : 'status-pending';
        const toggleText = task.completed ? 'Unmark' : 'Done';
        const toggleClass = task.completed ? 'toggle-status-btn' : 'toggle-status-btn';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="task-name ${taskClass}">${task.name}</td>
            <td>${task.date}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <button 
                    class="action-btn ${toggleClass}" 
                    data-action="toggle" 
                    data-id="${task.id}"
                >
                    ${toggleText}
                </button>
                <button 
                    class="action-btn delete-task-btn-single" 
                    data-action="delete" 
                    data-id="${task.id}"
                >
                    Delete
                </button>
            </td>
        `;
        taskListBody.appendChild(row);
    });
}

// --- FUNGSI UTAMA (CRUD) ---

/**
 * Menambahkan tugas baru.
 */
function addTask() {
    const name = todoInput.value.trim();
    const date = dateInput.value;

    // **Validasi Input Form**
    if (name === '' || date === '') {
        alert('Task name and Due Date must be filled.');
        return;
    }

    const tasks = getTasks();
    const newTask = {
        id: Date.now(), // ID unik
        name: name,
        date: date,
        completed: false
    };

    tasks.push(newTask);
    saveTasks(tasks);

    // Reset form dan render ulang
    todoInput.value = '';
    dateInput.value = '';
    renderTasks();
}

/**
 * Menghapus tugas berdasarkan ID.
 */
function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);
    saveTasks(tasks);
    renderTasks();
}

/**
 * Mengubah status tugas (selesai/belum selesai).
 */
function toggleTaskStatus(id) {
    let tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks(tasks);
        renderTasks();
    }
}

/**
 * Menghapus semua tugas.
 */
function deleteAllTasks() {
    if (getTasks().length === 0) {
        alert('There are no tasks to delete.');
        return;
    }
    if (confirm('Are you sure you want to delete ALL tasks?')) {
        localStorage.removeItem('tasks');
        currentFilter = 'ALL'; // Reset filter
        renderTasks();
    }
}

/**
 * Mengubah mode filter (ALL <-> PENDING).
 */
function toggleFilter() {
    // Jika sedang ALL, ubah ke PENDING. Jika sedang PENDING, ubah ke ALL.
    currentFilter = currentFilter === 'ALL' ? 'PENDING' : 'ALL';
    renderTasks();
}

// --- EVENT LISTENERS ---

// Listener untuk tombol Add
addButton.addEventListener('click', addTask);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Listener delegasi untuk tombol aksi di dalam tabel (Toggle dan Delete)
taskListBody.addEventListener('click', (e) => {
    const target = e.target;
    const action = target.getAttribute('data-action');
    const taskId = parseInt(target.getAttribute('data-id'));

    if (action === 'delete') {
        deleteTask(taskId);
    } else if (action === 'toggle') {
        toggleTaskStatus(taskId);
    }
});

// Listener untuk tombol Delete All
deleteAllButton.addEventListener('click', deleteAllTasks);

// Listener untuk tombol Filter
filterButton.addEventListener('click', toggleFilter);

// Panggil renderTasks() saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Opsional: Atur tanggal hari ini sebagai nilai minimum untuk mencegah input tanggal lampau
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today); 
    renderTasks();
});
