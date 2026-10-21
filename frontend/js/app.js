const API_URL = '/api';
let notificationsEnabled = true;

console.log('Script cargado');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');
    checkAuth();
    setupEventListeners();
    loadNotificationPreference();
});

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

function showAuth() {
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    if (authSection) authSection.classList.remove('hidden');
    if (appSection) appSection.classList.add('hidden');
}

function showApp(user) {
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    if (authSection) authSection.classList.add('hidden');
    if (appSection) appSection.classList.remove('hidden');

    if (window.location.pathname === '/' || window.location.pathname === '/auth') {
        window.history.pushState({}, '', '/app');
    }

    // Aplicar tema del usuario
    if (user.theme) {
        applyTheme(user.theme);
    }

    loadTodayHabits();
    updateUserInfo(user);
}

function setupEventListeners() {
    console.log('Configurando event listeners');

    const loginFormElement = document.getElementById('loginFormElement');
    const registerFormElement = document.getElementById('registerFormElement');

    console.log('loginFormElement:', loginFormElement);
    console.log('registerFormElement:', registerFormElement);

    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
        console.log('Listener de login agregado');
    }
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
        console.log('Listener de registro agregado');
    }

    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    console.log('showRegisterBtn:', showRegisterBtn);
    console.log('showLoginBtn:', showLoginBtn);

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        });
    }
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        });
    }

    const navHome = document.getElementById('navHome');
    const navHabits = document.getElementById('navHabits');
    const navStats = document.getElementById('navStats');
    const navCalendar = document.getElementById('navCalendar');
    const navSettings = document.getElementById('navSettings');
    const logoutBtn = document.getElementById('logoutBtn');

    if (navHome) navHome.addEventListener('click', () => showSection('home'));
    if (navHabits) navHabits.addEventListener('click', () => showSection('habits'));
    if (navStats) navStats.addEventListener('click', () => showSection('stats'));
    if (navCalendar) navCalendar.addEventListener('click', () => showSection('calendar'));
    if (navSettings) navSettings.addEventListener('click', () => showSection('settings'));
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            mobileOverlay.classList.toggle('active');
        });
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        });
    }

    // Close mobile menu when clicking on nav items
    const navButtons = [navHome, navHabits, navStats, navCalendar, navSettings];
    navButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                mobileOverlay.classList.remove('active');
            });
        }
    });

    const addHabitBtn = document.getElementById('addHabitBtn');
    const addNewHabitBtn = document.getElementById('addNewHabitBtn');
    const cancelHabitBtn = document.getElementById('cancelHabitBtn');
    const habitForm = document.getElementById('habitForm');

    if (addHabitBtn) addHabitBtn.addEventListener('click', showHabitModal);
    if (addNewHabitBtn) addNewHabitBtn.addEventListener('click', showHabitModal);
    if (cancelHabitBtn) cancelHabitBtn.addEventListener('click', hideHabitModal);
    if (habitForm) habitForm.addEventListener('submit', handleCreateHabit);

    const achievementsBtn = document.getElementById('achievementsBtn');
    const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');

    if (achievementsBtn) achievementsBtn.addEventListener('click', showAchievementsModal);
    if (closeAchievementsBtn) closeAchievementsBtn.addEventListener('click', hideAchievementsModal);

    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (profileForm) profileForm.addEventListener('submit', handleUpdateProfile);
    if (passwordForm) passwordForm.addEventListener('submit', handleChangePassword);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', handleUpdateSettings);
    if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', handleDeleteAccount);

    const emojiPickerBtn = document.getElementById('emojiPickerBtn');
    const closeEmojiPicker = document.getElementById('closeEmojiPicker');

    if (emojiPickerBtn) emojiPickerBtn.addEventListener('click', showEmojiPicker);
    if (closeEmojiPicker) closeEmojiPicker.addEventListener('click', hideEmojiPicker);

    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');

    console.log('prevMonthBtn:', prevMonthBtn);
    console.log('nextMonthBtn:', nextMonthBtn);

    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => navigateCalendar(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => navigateCalendar(1));

    const notificationsToggle = document.getElementById('notificationsToggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            saveNotificationPreference(e.target.checked);
        });
    }

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

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Intentando login con:', email);

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (response.ok) {
            showAlert('Login exitoso', 'success');
            showApp(data.user);
            // Recargar datos actualizados del usuario
            const meResponse = await fetch(`${API_URL}/auth/me`);
            const meData = await meResponse.json();
            if (meResponse.ok) {
                updateUserInfo(meData.user);
            }
        } else {
            showAlert(data.message || 'Error en login', 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        showAlert('Error de conexión', 'error');
    }
}

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

async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        showAlert('Sesión cerrada', 'success');
        showAuth();
    } catch (error) {
        showAlert('Error al cerrar sesión', 'error');
    }
}

function showSection(section) {
    ['home', 'habits', 'stats', 'calendar', 'settings'].forEach(s => {
        document.getElementById(`${s}Section`).classList.add('hidden');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-50', 'text-blue-600', 'font-medium');
        btn.classList.add('hover:bg-gray-100', 'text-gray-700');
    });

    document.getElementById(`${section}Section`).classList.remove('hidden');

    const activeBtn = document.getElementById(`nav${section.charAt(0).toUpperCase() + section.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-50', 'text-blue-600', 'font-medium');
        activeBtn.classList.remove('hover:bg-gray-100', 'text-gray-700');
    }

    if (section === 'home') loadTodayHabits();
    if (section === 'habits') loadAllHabits();
    if (section === 'stats') loadStats();
    if (section === 'calendar') {
        currentCalendarDate = new Date();
        loadCalendar();
    }
    if (section === 'settings') loadSettings();
}

async function loadTodayHabits() {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayKey = `${year}-${month}-${day}`;
        const response = await fetch(`${API_URL}/habits/${todayKey}`);
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

async function createDefaultHabits() {
    try {
        const response = await fetch(`${API_URL}/habits/default`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Hábitos por defecto creados', 'success');
            loadTodayHabits();
            loadAllHabits();
        } else {
            showAlert(data.message || 'Error al crear hábitos por defecto', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

function getTodayDateKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderHabits(habits) {
    const container = document.getElementById('habitsList');
    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = `
            <p class="text-gray-500 text-center py-4">No hay hábitos para hoy. ¡Crea el primero!</p>
            <button onclick="createDefaultHabits()" class="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium shadow-lg">
                Crear hábitos por defecto
            </button>
        `;
        return;
    }

    const todayKey = getTodayDateKey();

    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = `habit-card p-4 rounded-lg border-2 ${habit.completedToday ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <input type="checkbox"
                           class="habit-checkbox"
                           ${habit.completedToday ? 'checked' : ''}
                           onchange="toggleHabit('${habit._id}', '${todayKey}')"
                           data-emoji="${habit.emoji}">
                    <div>
                        <h3 class="font-bold text-gray-800">${habit.name}</h3>
                        <p class="text-sm text-gray-600">${habit.category} • ${habit.duration.value} ${habit.duration.unit}</p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

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
            // Recargar datos del usuario para actualizar sidebar
            const meResponse = await fetch(`${API_URL}/auth/me`);
            const meData = await meResponse.json();
            if (meResponse.ok) {
                updateUserInfo(meData.user);
            }
            // Recargar calendario si está visible
            const calendarSection = document.getElementById('calendarSection');
            if (!calendarSection.classList.contains('hidden')) {
                loadCalendar();
            }
        } else {
            showAlert(data.message || 'Error al actualizar hábito', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

function showHabitModal() {
    document.getElementById('habitModal').classList.remove('hidden');
    document.getElementById('habitModal').classList.add('flex');
}

function hideHabitModal() {
    document.getElementById('habitModal').classList.add('hidden');
    document.getElementById('habitModal').classList.remove('flex');
    document.getElementById('habitForm').reset();
    document.getElementById('habitModalTitle').textContent = 'Hábito Nuevo';
    const habitForm = document.getElementById('habitForm');
    delete habitForm.dataset.editingId;
}

async function handleCreateHabit(e) {
    e.preventDefault();

    const habitForm = document.getElementById('habitForm');
    const editingId = habitForm.dataset.editingId;

    const name = document.getElementById('habitName').value;
    const emoji = document.getElementById('habitEmoji').value || '✓';
    const category = document.getElementById('habitCategory').value;
    const duration = {
        value: document.getElementById('habitDuration').value,
        unit: document.getElementById('habitDurationUnit').value
    };

    const frequency = [];
    document.querySelectorAll('.freq-checkbox:checked').forEach(cb => {
        frequency.push(cb.value);
    });

    try {
        let response;
        if (editingId) {
            response = await fetch(`${API_URL}/habits/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, emoji, category, duration, frequency })
            });
        } else {
            response = await fetch(`${API_URL}/habits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, emoji, category, duration, frequency })
            });
        }

        const data = await response.json();

        if (response.ok) {
            showAlert(editingId ? 'Hábito actualizado exitosamente' : 'Hábito creado exitosamente', 'success');
            hideHabitModal();
            delete habitForm.dataset.editingId;
            loadTodayHabits();
            loadAllHabits();
        } else {
            showAlert(data.message || 'Error al guardar hábito', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

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

async function editHabit(habitId) {
    try {
        const response = await fetch(`${API_URL}/habits`);
        const data = await response.json();

        if (response.ok) {
            const habit = data.habits.find(h => h._id === habitId);
            if (habit) {
                showHabitModal();
                document.getElementById('habitModalTitle').textContent = 'Editar Hábito';
                document.getElementById('habitName').value = habit.name;
                document.getElementById('habitEmoji').value = habit.emoji;
                document.getElementById('habitCategory').value = habit.category;
                document.getElementById('habitDuration').value = habit.duration.value;
                document.getElementById('habitDurationUnit').value = habit.duration.unit;

                document.querySelectorAll('.freq-checkbox').forEach(cb => {
                    cb.checked = true; // Marcar todos los días por defecto al editar
                    cb.dispatchEvent(new Event('change'));
                });

                const habitForm = document.getElementById('habitForm');
                habitForm.dataset.editingId = habitId;
            }
        }
    } catch (error) {
        showAlert('Error al cargar hábito', 'error');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        if (response.ok) {
            updateStatsUI(data);
            loadLevelProgress(); // Cargar progreso del nivel también
            // Actualizar racha en sidebar
            const userStreak = document.getElementById('userStreak');
            if (userStreak) userStreak.textContent = data.currentStreak || 0;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function updateStatsUI(stats) {
    const currentStreak = document.getElementById('currentStreak');
    const completionRate = document.getElementById('completionRate');
    const completionBar = document.getElementById('completionBar');
    const totalHabits = document.getElementById('totalHabits');
    const mostConsistentHabit = document.getElementById('mostConsistentHabit');

    if (currentStreak) currentStreak.textContent = stats.currentStreak + ' días 🔥';
    if (completionRate) completionRate.textContent = stats.completionRate + '%';
    if (completionBar) completionBar.style.width = stats.completionRate + '%';
    if (totalHabits) totalHabits.textContent = stats.totalHabits || 0;

    renderWeeklyChart(stats.weeklyData);

    if (stats.mostConsistentHabit && mostConsistentHabit) {
        mostConsistentHabit.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="text-2xl">${stats.mostConsistentHabit.emoji}</span>
                <div>
                    <p class="font-bold">${stats.mostConsistentHabit.name}</p>
                    <p class="text-sm text-gray-600">${stats.mostConsistentHabit.rate}% consistencia</p>
                </div>
            </div>
        `;
    } else if (mostConsistentHabit) {
        mostConsistentHabit.innerHTML = '<p class="text-gray-500 text-sm">Aún no hay datos</p>';
    }
}

function renderWeeklyChart(weeklyData) {
    const container = document.getElementById('weeklyChart');
    container.innerHTML = '';

    weeklyData.forEach(day => {
        const barContainer = document.createElement('div');
        barContainer.className = 'flex flex-col items-center flex-1';

        const barWrapper = document.createElement('div');
        barWrapper.className = 'w-full bg-gray-200 rounded-lg h-44 relative overflow-hidden flex items-end';

        const bar = document.createElement('div');
        bar.className = 'chart-bar bg-gradient-to-t from-green-600 to-green-400 rounded-lg transition-all duration-500 w-full';
        bar.style.height = `${day.completed}%`;

        const percentage = document.createElement('div');
        percentage.className = 'absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white z-10';
        percentage.textContent = `${day.completed}%`;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(percentage);

        const dayLabel = document.createElement('span');
        dayLabel.className = 'text-xs mt-2 font-medium text-gray-700';
        dayLabel.textContent = day.day;

        barContainer.appendChild(barWrapper);
        barContainer.appendChild(dayLabel);
        container.appendChild(barContainer);
    });
}

function updateProgress(habits) {
    const completed = habits.filter(h => h.completedToday).length;
    const total = habits.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = `${completed}/${total} completados`;
}

function updateCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('es-ES', options);
    document.getElementById('currentDate').textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
}

function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const userStreak = document.getElementById('userStreak');
    const userPoints = document.getElementById('userPoints');
    const userLevel = document.getElementById('userLevel');

    if (userName) userName.textContent = user.name;
    if (userStreak) userStreak.textContent = user.streak || 0;
    if (userPoints) userPoints.textContent = user.points || 0;
    if (userLevel) userLevel.textContent = user.level || 1;

    // Actualizar también los puntos y nivel en la sección de estadísticas
    const currentLevel = document.getElementById('currentLevel');
    const currentPoints = document.getElementById('currentPoints');
    if (currentLevel) currentLevel.textContent = user.level || 1;
    if (currentPoints) currentPoints.textContent = user.points || 0;
}

async function showAchievementsModal() {
    document.getElementById('achievementsModal').classList.remove('hidden');
    document.getElementById('achievementsModal').classList.add('flex');
    
    await loadAchievements();
    await loadLevelProgress();
}

function hideAchievementsModal() {
    document.getElementById('achievementsModal').classList.add('hidden');
    document.getElementById('achievementsModal').classList.remove('flex');
}

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

async function loadLevelProgress() {
    try {
        const response = await fetch(`${API_URL}/achievements/level-progress`);
        const data = await response.json();

        if (response.ok) {
            const levelProgressBar = document.getElementById('levelProgressBar');
            const levelProgressText = document.getElementById('levelProgressText');

            if (levelProgressBar) levelProgressBar.style.width = data.progress + '%';
            if (levelProgressText) levelProgressText.textContent = `${data.pointsInCurrentLevel}/${data.pointsForNextLevel} puntos para el siguiente nivel`;
        }
    } catch (error) {
        console.error('Error al cargar progreso:', error);
    }
}

async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/auth/me`);
        const data = await response.json();

        if (response.ok) {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const themeSelect = document.getElementById('themeSelect');

            if (profileName) profileName.value = data.user.name;
            if (profileEmail) profileEmail.value = data.user.email;
            if (themeSelect) themeSelect.value = data.user.theme || 'light';
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();

    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;

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

async function handleUpdateSettings() {
    const theme = document.getElementById('themeSelect').value;
    const notificationsToggle = document.getElementById('notificationsToggle');
    const notificationsEnabled = notificationsToggle ? notificationsToggle.checked : true;

    saveNotificationPreference(notificationsEnabled);

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

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

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


function showEmojiPicker() {
    document.getElementById('emojiPickerModal').classList.remove('hidden');
    document.getElementById('emojiPickerModal').classList.add('flex');

    const emojiGrid = document.getElementById('emojiGrid');
    if (emojiGrid.children.length === 0) {
        const emojis = ['🎯', '💧', '🏃', '📚', '💪', '🧘', '🌅', '🦉', '🥗', '💤', '📝', '🎨', '🎵', '🎬', '💻', '📱', '🎮', '⚽', '🛏️', '🏠', '💰', '💼', '📅', '🌱', '🚴', '📖', '✈️', '🍎', '🍔', '🍕', '☕', '🥤', '🍣', '🥘', '🌮', '🍭', '🍬', '🍦', '🍏', '🍋', '🍊', '🍍', '🥝', '🥜', '🥔', '🥕', '🥦', '🥬', '🥒', '🍈', '🍆', '🌽', '🍒', '🥑', '🍠', '🍄', '🌶', '🍉', '🍐', '🍇', '🍌', '🍑', '🍓', '💝', '🎁', '🎈', '🎉', '🎊', '🎓', '🎩', '🏆', '🏅', '🥇', '🥈', '🥉', '⚡', '💎', '⭐', '🌟', '✨', '🌈', '🔥', '💡', '🔦', '📌', '📍', '🔖', '🏷️', '🔑', '🔒', '🔓', '🔔', '🔕', '📢', '📣', '🔊', '🔉', '🔈', '🔇', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹', '💱', '💲', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪓', '⛏️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🧰', '🧲', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🚪', '🛗', '🪞', '🪟', '🛏️', '🛋️', '🪑', '🚽', '🪠', '🚿', '🛁', '🪤', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🪥', '🧽', '🧯', '🛒', '🚬', '⚰️', '⚱️', '🗿', '🏧', '🚮', '🚰', '♿', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂', '🛃', '🛄', '🚸', '⚠️', '🚸', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚕️', '♾️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '✖️', '❌', '❎', '➕', '➖', '➗', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '‼️', '⁉️', '❓', '❔', '❕', '❗', '〰️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '▪️', '🔻', '💠', '🔘', '🔳', '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️'];

        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'p-2 text-2xl hover:bg-gray-100 rounded cursor-pointer transition';
            emojiBtn.textContent = emoji;
            emojiBtn.onclick = () => selectEmoji(emoji);
            emojiGrid.appendChild(emojiBtn);
        });
    }
}

function hideEmojiPicker() {
    document.getElementById('emojiPickerModal').classList.add('hidden');
    document.getElementById('emojiPickerModal').classList.remove('flex');
}

function selectEmoji(emoji) {
    document.getElementById('habitEmoji').value = emoji;
    hideEmojiPicker();
}

let currentCalendarDate = new Date();
let selectedDateKey = null; // Guardar el día seleccionado

async function loadCalendar() {
    // Usar la fecha actual del calendario (no resetear a hoy cada vez)
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    try {
        const response = await fetch(`${API_URL}/stats/month/${year}/${month}`);
        const data = await response.json();

        if (response.ok) {
            // Convertir strings de fecha a objetos Date usando hora local
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);
            console.log('startDate parseado:', startDate);
            console.log('endDate parseado:', endDate);
            renderCalendar(data.monthlyData, startDate, endDate);
        } else {
            console.error('Error en respuesta del calendario:', data);
        }
    } catch (error) {
        console.error('Error al cargar calendario:', error);
    }
}

function renderCalendar(monthlyData, startDate, endDate) {
    const container = document.getElementById('calendarView');
    container.innerHTML = '';

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('currentMonthYear').textContent = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-3';

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'text-center font-semibold text-gray-600 p-3';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'p-4';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= endDate.getDate(); day++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayNum = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${dayNum}`;
        const dayData = monthlyData[dateKey] || { completed: 0, total: 0, rate: 0, habits: [] };

        const dayCell = document.createElement('div');
        let bgColor = 'bg-white border-2 border-gray-200';
        let textColor = 'text-gray-800';

        if (dayData.total > 0) {
            if (dayData.rate === 100) {
                bgColor = 'bg-green-500 border-green-600';
                textColor = 'text-white';
            } else if (dayData.rate >= 75) {
                bgColor = 'bg-green-400 border-green-500';
                textColor = 'text-white';
            } else if (dayData.rate >= 50) {
                bgColor = 'bg-green-300 border-green-400';
                textColor = 'text-white';
            } else if (dayData.rate >= 25) {
                bgColor = 'bg-green-200 border-green-300';
                textColor = 'text-green-900';
            } else {
                bgColor = 'bg-green-100 border-green-200';
                textColor = 'text-green-800';
            }
        }

        dayCell.className = `calendar-day ${bgColor} ${textColor} p-4 rounded-lg text-center cursor-pointer hover:scale-105 transition-all duration-200 font-bold text-xl shadow-md`;
        dayCell.textContent = day;
        dayCell.title = `${dayData.completed}/${dayData.total} completados (${dayData.rate}%)`;

        dayCell.addEventListener('click', () => showDayDetails(dateKey, dayData));

        grid.appendChild(dayCell);
    }

    container.appendChild(grid);

    // Mostrar hábitos del día seleccionado o del día actual por defecto
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayKey = `${year}-${month}-${day}`;

    // Si hay un día seleccionado y está en el mes actual, mostrarlo
    if (selectedDateKey && monthlyData[selectedDateKey]) {
        const selectedData = monthlyData[selectedDateKey];
        showDayDetails(selectedDateKey, selectedData);
    } else {
        // Si no, mostrar el día actual
        const todayData = monthlyData[todayKey] || { completed: 0, total: 0, rate: 0, habits: [] };
        showDayDetails(todayKey, todayData);
        selectedDateKey = todayKey;
    }
}

function showDayDetails(dateKey, dayData) {
    const dayDetails = document.getElementById('dayDetails');
    const selectedDateTitle = document.getElementById('selectedDateTitle');
    const dayHabitsList = document.getElementById('dayHabitsList');

    // Guardar el día seleccionado
    selectedDateKey = dateKey;

    // Convertir dateKey a fecha local correcta
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = date.toLocaleDateString('es-ES', options);
    selectedDateTitle.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);

    dayHabitsList.innerHTML = '';

    if (dayData.habits && dayData.habits.length > 0) {
        console.log('Renderizando', dayData.habits.length, 'hábitos');
        dayData.habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = `flex items-center justify-between p-4 rounded-lg ${habit.completed ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100 border-2 border-gray-200'}`;
            habitItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${habit.emoji}</span>
                    <span class="font-medium">${habit.name}</span>
                </div>
                <span class="${habit.completed ? 'text-green-600 font-bold' : 'text-gray-400'}">${habit.completed ? '✓ Completado' : '✗ Pendiente'}</span>
            `;
            dayHabitsList.appendChild(habitItem);
        });
    } else {
        console.log('No hay hábitos para mostrar');
        dayHabitsList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay hábitos para este día</p>';
    }

    dayDetails.classList.remove('hidden');
}

function navigateCalendar(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    loadCalendar();
}

function showAlert(message, type) {
    if (!notificationsEnabled) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function loadNotificationPreference() {
    const saved = localStorage.getItem('notificationsEnabled');
    notificationsEnabled = saved === null ? true : saved === 'true';

    const toggle = document.getElementById('notificationsToggle');
    if (toggle) {
        toggle.checked = notificationsEnabled;
    }
}

function saveNotificationPreference(enabled) {
    notificationsEnabled = enabled;
    localStorage.setItem('notificationsEnabled', enabled.toString());
}
