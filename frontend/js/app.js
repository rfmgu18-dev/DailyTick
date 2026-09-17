// DailyTick - Frontend simplificado

const API_URL = '/api';

// Elementos del DOM
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Verificar autenticación
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/me`);
        if (response.ok) {
            const data = await response.json();
            showApp(data.user);
        } else {
            showAuth();
        }
    } catch (error) {
        showAuth();
    }
}

// Mostrar sección de autenticación
function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

// Mostrar aplicación principal
function showApp(user) {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    
    if (window.location.pathname === '/' || window.location.pathname === '/auth') {
        window.history.pushState({}, '', '/app');
    }
    
    loadTodayHabits();
    updateUserInfo(user);
}

// Configurar eventos
function setupEventListeners() {
    // Formularios de autenticación
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('showRegister').addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    document.getElementById('showLogin').addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Navegación
    document.getElementById('navHome').addEventListener('click', () => showSection('home'));
    document.getElementById('navHabits').addEventListener('click', () => showSection('habits'));
    document.getElementById('navStats').addEventListener('click', () => showSection('stats'));
    document.getElementById('navCalendar').addEventListener('click', () => showSection('calendar'));
    document.getElementById('navSettings').addEventListener('click', () => showSection('settings'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Botones de hábitos
    document.getElementById('addHabitBtn').addEventListener('click', showHabitModal);
    document.getElementById('addNewHabitBtn').addEventListener('click', showHabitModal);
    document.getElementById('cancelHabitBtn').addEventListener('click', hideHabitModal);
    document.getElementById('habitForm').addEventListener('submit', handleCreateHabit);

    // Modal de logros
    document.getElementById('achievementsBtn').addEventListener('click', showAchievementsModal);
    document.getElementById('closeAchievementsBtn').addEventListener('click', hideAchievementsModal);

    // Configuración
    document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);
    document.getElementById('passwordForm').addEventListener('submit', handleChangePassword);
    document.getElementById('saveSettingsBtn').addEventListener('click', handleUpdateSettings);
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);

    // Selector de emoji
    document.getElementById('emojiPickerBtn').addEventListener('click', showEmojiPicker);
    document.getElementById('closeEmojiPicker').addEventListener('click', hideEmojiPicker);

    // Frecuencia de hábitos
    document.querySelectorAll('.freq-checkbox').forEach(cb => {
        cb.checked = true;
        cb.addEventListener('change', function() {
            const parent = this.closest('.freq-day');
            if (this.checked) {
                parent.style.backgroundColor = '#2563eb';
                parent.style.borderColor = '#2563eb';
                parent.style.color = 'white';
            } else {
                parent.style.backgroundColor = '';
                parent.style.borderColor = '';
                parent.style.color = '';
            }
        });
        cb.dispatchEvent(new Event('change'));
    });
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Login exitoso', 'success');
            showApp(data.user);
        } else {
            showAlert(data.message || 'Error en login', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Manejar registro
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Registro exitoso', 'success');
            showApp(data.user);
        } else {
            showAlert(data.message || 'Error en registro', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Manejar logout
async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        showAlert('Sesión cerrada', 'success');
        showAuth();
    } catch (error) {
        showAlert('Error al cerrar sesión', 'error');
    }
}

// Mostrar sección
function showSection(section) {
    // Ocultar todas las secciones
    ['home', 'habits', 'stats', 'calendar', 'settings'].forEach(s => {
        document.getElementById(`${s}Section`).classList.add('hidden');
    });

    // Remover clase activa de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-50', 'text-blue-600', 'font-medium');
        btn.classList.add('hover:bg-gray-100', 'text-gray-700');
    });

    // Mostrar sección seleccionada
    document.getElementById(`${section}Section`).classList.remove('hidden');

    // Activar botón correspondiente
    const activeBtn = document.getElementById(`nav${section.charAt(0).toUpperCase() + section.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-50', 'text-blue-600', 'font-medium');
        activeBtn.classList.remove('hover:bg-gray-100', 'text-gray-700');
    }

    // Cargar datos específicos
    if (section === 'home') loadTodayHabits();
    if (section === 'habits') loadAllHabits();
    if (section === 'stats') loadStats();
    if (section === 'calendar') {
        currentCalendarDate = new Date();
        loadCalendar();
    }
    if (section === 'settings') loadSettings();
}

// Cargar hábitos de hoy
async function loadTodayHabits() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_URL}/habits/${today}`);
        const data = await response.json();

        if (response.ok) {
            renderHabits(data.habits);
            updateProgress(data.habits);
            updateCurrentDate();
        }
    } catch (error) {
        console.error('Error al cargar hábitos:', error);
    }
}

// Cargar todos los hábitos
async function loadAllHabits() {
    try {
        const response = await fetch(`${API_URL}/habits`);
        const data = await response.json();

        if (response.ok) {
            renderAllHabits(data.habits);
        }
    } catch (error) {
        console.error('Error al cargar hábitos:', error);
    }
}

// Renderizar hábitos
function renderHabits(habits) {
    const container = document.getElementById('habitsList');
    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay hábitos para hoy. ¡Crea el primero!</p>';
        return;
    }

    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = `habit-card p-4 rounded-lg border-2 ${habit.completedToday ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <input type="checkbox" 
                           class="habit-checkbox" 
                           ${habit.completedToday ? 'checked' : ''} 
                           onchange="toggleHabit('${habit._id}', '${new Date().toISOString().split('T')[0]}')"
                           data-emoji="${habit.emoji}">
                    <div>
                        <h3 class="font-bold text-gray-800">${habit.name}</h3>
                        <p class="text-sm text-gray-600">${habit.category} • ${habit.duration.value} ${habit.duration.unit}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="editHabit('${habit._id}')" class="text-blue-500 hover:text-blue-700">✏️</button>
                    <button onclick="deleteHabit('${habit._id}')" class="text-red-500 hover:text-red-700">🗑️</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Renderizar todos los hábitos
function renderAllHabits(habits) {
    const container = document.getElementById('allHabitsList');
    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No tienes hábitos. ¡Crea el primero!</p>';
        return;
    }

    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card p-4 rounded-lg border-2';
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <span class="text-2xl">${habit.emoji}</span>
                    <div>
                        <h3 class="font-bold text-gray-800">${habit.name}</h3>
                        <p class="text-sm text-gray-600">${habit.category} • ${habit.frequency.join(', ')}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="editHabit('${habit._id}')" class="text-blue-500 hover:text-blue-700">✏️</button>
                    <button onclick="deleteHabit('${habit._id}')" class="text-red-500 hover:text-red-700">🗑️</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Marcar hábito como completado
async function toggleHabit(habitId, date) {
    try {
        const response = await fetch(`${API_URL}/habits/${habitId}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.newAchievements) {
                showAlert(`¡Logro desbloqueado: ${data.newAchievements[0].name}!`, 'success');
            }
            loadTodayHabits();
        } else {
            showAlert(data.message || 'Error al actualizar hábito', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Mostrar modal de hábito
function showHabitModal() {
    document.getElementById('habitModal').classList.remove('hidden');
    document.getElementById('habitModal').classList.add('flex');
}

// Ocultar modal de hábito
function hideHabitModal() {
    document.getElementById('habitModal').classList.add('hidden');
    document.getElementById('habitModal').classList.remove('flex');
    document.getElementById('habitForm').reset();
}

// Crear hábito
async function handleCreateHabit(e) {
    e.preventDefault();
    
    const name = document.getElementById('habitName').value;
    const emoji = document.getElementById('habitEmoji').value || '✓';
    const category = document.getElementById('habitCategory').value;
    const duration = {
        value: document.getElementById('habitDuration').value,
        unit: document.getElementById('habitUnit').value
    };

    const frequency = [];
    document.querySelectorAll('.freq-checkbox:checked').forEach(cb => {
        frequency.push(cb.value);
    });

    try {
        const response = await fetch(`${API_URL}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, emoji, category, duration, frequency })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Hábito creado exitosamente', 'success');
            hideHabitModal();
            loadTodayHabits();
        } else {
            showAlert(data.message || 'Error al crear hábito', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Eliminar hábito
async function deleteHabit(habitId) {
    if (!confirm('¿Estás seguro de eliminar este hábito?')) return;

    try {
        const response = await fetch(`${API_URL}/habits/${habitId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Hábito eliminado', 'success');
            loadTodayHabits();
            loadAllHabits();
        } else {
            showAlert('Error al eliminar hábito', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Cargar estadísticas
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        if (response.ok) {
            updateStatsUI(data);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Actualizar UI de estadísticas
function updateStatsUI(stats) {
    document.getElementById('currentStreak').textContent = stats.currentStreak;
    document.getElementById('completionRate').textContent = stats.completionRate + '%';
    document.getElementById('totalHabits').textContent = stats.totalHabits;
    document.getElementById('totalCompleted').textContent = stats.totalCompleted;

    // Renderizar gráfico semanal
    renderWeeklyChart(stats.weeklyData);

    // Mostrar hábito más consistente
    if (stats.mostConsistentHabit) {
        document.getElementById('mostConsistentHabit').innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="text-2xl">${stats.mostConsistentHabit.emoji}</span>
                <div>
                    <p class="font-bold">${stats.mostConsistentHabit.name}</p>
                    <p class="text-sm text-gray-600">${stats.mostConsistentHabit.rate}% consistencia</p>
                </div>
            </div>
        `;
    }
}

// Renderizar gráfico semanal
function renderWeeklyChart(weeklyData) {
    const container = document.getElementById('weeklyChart');
    container.innerHTML = '';

    weeklyData.forEach(day => {
        const bar = document.createElement('div');
        bar.className = 'flex flex-col items-center';
        bar.innerHTML = `
            <div class="chart-bar bg-green-500 rounded-t" style="height: ${day.completed}%"></div>
            <span class="text-xs mt-1">${day.day}</span>
        `;
        container.appendChild(bar);
    });
}

// Actualizar progreso
function updateProgress(habits) {
    const completed = habits.filter(h => h.completedToday).length;
    const total = habits.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${completed}/${total} completados`;
}

// Actualizar fecha actual
function updateCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('es-ES', options);
}

// Actualizar información de usuario
function updateUserInfo(user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userStreak').textContent = user.streak;
    document.getElementById('userPoints').textContent = user.points;
    document.getElementById('userLevel').textContent = user.level;
}

// Mostrar modal de logros
async function showAchievementsModal() {
    document.getElementById('achievementsModal').classList.remove('hidden');
    document.getElementById('achievementsModal').classList.add('flex');
    
    await loadAchievements();
    await loadLevelProgress();
}

// Ocultar modal de logros
function hideAchievementsModal() {
    document.getElementById('achievementsModal').classList.add('hidden');
    document.getElementById('achievementsModal').classList.remove('flex');
}

// Cargar logros
async function loadAchievements() {
    try {
        const response = await fetch(`${API_URL}/achievements`);
        const data = await response.json();

        if (response.ok) {
            renderAchievements(data.achievements);
        }
    } catch (error) {
        console.error('Error al cargar logros:', error);
    }
}

// Renderizar logros
function renderAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    container.innerHTML = '';

    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `p-4 rounded-lg border-2 ${achievement.unlocked ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-60'}`;
        card.innerHTML = `
            <div class="flex items-center space-x-4">
                <span class="text-4xl ${achievement.unlocked ? '' : 'grayscale'}">${achievement.icon}</span>
                <div class="flex-1">
                    <h3 class="font-bold text-gray-800">${achievement.name}</h3>
                    <p class="text-sm text-gray-600">${achievement.description}</p>
                    <p class="text-xs text-purple-600 font-medium">+${achievement.points} puntos</p>
                </div>
                ${achievement.unlocked ? '<span class="text-green-600 font-bold">✓</span>' : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Cargar progreso de nivel
async function loadLevelProgress() {
    try {
        const response = await fetch(`${API_URL}/achievements/level-progress`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('levelProgress').style.width = data.progress + '%';
            document.getElementById('levelText').textContent = `Nivel ${data.currentLevel} - ${data.pointsInCurrentLevel}/${data.pointsForNextLevel} puntos`;
        }
    } catch (error) {
        console.error('Error al cargar progreso:', error);
    }
}

// Cargar configuración
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/auth/me`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('settingsName').value = data.user.name;
            document.getElementById('settingsEmail').value = data.user.email;
            document.getElementById('themeSelect').value = data.user.theme;
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

// Actualizar perfil
async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Perfil actualizado', 'success');
            updateUserInfo(data.user);
        } else {
            showAlert(data.message || 'Error al actualizar perfil', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Cambiar contraseña
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Contraseña cambiada exitosamente', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showAlert(data.message || 'Error al cambiar contraseña', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Actualizar configuración
async function handleUpdateSettings() {
    const theme = document.getElementById('themeSelect').value;
    const notificationsEnabled = document.getElementById('notificationsEnabled').checked;

    try {
        const response = await fetch(`${API_URL}/auth/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, notificationsEnabled })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Configuración actualizada', 'success');
            applyTheme(theme);
        } else {
            showAlert(data.message || 'Error al actualizar configuración', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Aplicar tema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('bg-gray-900');
    } else {
        document.body.classList.remove('bg-gray-900');
    }
}

// Eliminar cuenta
async function handleDeleteAccount() {
    const password = prompt('Ingresa tu contraseña para confirmar la eliminación de tu cuenta:');
    if (!password) return;

    try {
        const response = await fetch(`${API_URL}/auth/account`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            showAlert('Cuenta eliminada', 'success');
            window.location.href = '/';
        } else {
            showAlert('Error al eliminar cuenta', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Mostrar selector de emoji
function showEmojiPicker() {
    document.getElementById('emojiPickerModal').classList.remove('hidden');
    document.getElementById('emojiPickerModal').classList.add('flex');
}

// Ocultar selector de emoji
function hideEmojiPicker() {
    document.getElementById('emojiPickerModal').classList.add('hidden');
    document.getElementById('emojiPickerModal').classList.remove('flex');
}

// Seleccionar emoji
function selectEmoji(emoji) {
    document.getElementById('habitEmoji').value = emoji;
    hideEmojiPicker();
}

// Variables para calendario
let currentCalendarDate = new Date();

// Cargar calendario
async function loadCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    try {
        const response = await fetch(`${API_URL}/stats/month/${year}/${month}`);
        const data = await response.json();

        if (response.ok) {
            renderCalendar(data.monthlyData, data.startDate, data.endDate);
        }
    } catch (error) {
        console.error('Error al cargar calendario:', error);
    }
}

// Renderizar calendario
function renderCalendar(monthlyData, startDate, endDate) {
    const container = document.getElementById('calendarGrid');
    container.innerHTML = '';

    // Actualizar título del mes
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('calendarMonth').textContent = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

    // Renderizar días
    for (let day = 1; day <= endDate.getDate(); day++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayData = monthlyData[dateKey] || { completed: 0, total: 0, rate: 0 };

        const dayCell = document.createElement('div');
        let bgColor = 'bg-gray-100';
        
        if (dayData.total > 0) {
            if (dayData.rate === 100) bgColor = 'bg-green-500';
            else if (dayData.rate >= 75) bgColor = 'bg-green-400';
            else if (dayData.rate >= 50) bgColor = 'bg-green-300';
            else if (dayData.rate >= 25) bgColor = 'bg-green-200';
            else bgColor = 'bg-green-100';
        }

        dayCell.className = `calendar-day ${bgColor} p-2 rounded text-center cursor-pointer hover:opacity-80`;
        dayCell.textContent = day;
        dayCell.title = `${dayData.completed}/${dayData.total} completados (${dayData.rate}%)`;
        
        container.appendChild(dayCell);
    }
}

// Navegar calendario
function navigateCalendar(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    loadCalendar();
}

// Mostrar alerta
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
