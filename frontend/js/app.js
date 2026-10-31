const API_URL = '/api';
let notificationsEnabled = true;

console.log('🔄 Script cargado - VERSIÓN CON LOGS DE DEADLINE');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');

    // Solo ejecutar checkAuth si estamos en /app o /auth, no en landing page
    const currentPath = window.location.pathname;
    if (currentPath === '/app' || currentPath === '/auth') {
        checkAuth();
    }

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

    // Mostrar botón de admin si el usuario es admin
    console.log('Verificando rol de admin:', user.isAdmin, user.role);
    const adminNavLi = document.getElementById('adminNavLi');
    if (adminNavLi) {
        if (user.isAdmin) {
            console.log('Mostrando botón de admin');
            adminNavLi.classList.remove('hidden');
        } else {
            console.log('Ocultando botón de admin');
            adminNavLi.classList.add('hidden');
        }
    }

    loadSidebarPreference();
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
    const navAdmin = document.getElementById('navAdmin');
    const navGoals = document.getElementById('navGoals');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (navHome) navHome.addEventListener('click', () => showSection('home'));
    if (navHabits) navHabits.addEventListener('click', () => showSection('habits'));
    if (navStats) navStats.addEventListener('click', () => showSection('stats'));
    if (navCalendar) navCalendar.addEventListener('click', () => showSection('calendar'));
    if (navSettings) navSettings.addEventListener('click', () => showSection('settings'));
    if (navAdmin) navAdmin.addEventListener('click', () => showSection('admin'));
    if (navGoals) navGoals.addEventListener('click', () => showSection('goals'));
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);

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

    // Goal section toggle
    const hasGoalCheckbox = document.getElementById('hasGoal');
    const goalSection = document.getElementById('goalSection');
    if (hasGoalCheckbox && goalSection) {
        hasGoalCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                goalSection.classList.remove('hidden');
            } else {
                goalSection.classList.add('hidden');
            }
        });
    }

    // Goal condition type toggle
    const goalConditionType = document.getElementById('goalConditionType');
    const timesConditionSection = document.getElementById('timesConditionSection');
    const hoursConditionSection = document.getElementById('hoursConditionSection');
    if (goalConditionType && timesConditionSection && hoursConditionSection) {
        goalConditionType.addEventListener('change', (e) => {
            if (e.target.value === 'times') {
                timesConditionSection.classList.remove('hidden');
                hoursConditionSection.classList.add('hidden');
            } else {
                timesConditionSection.classList.add('hidden');
                hoursConditionSection.classList.remove('hidden');
            }
        });
    }

    // Botón para crear nueva meta (al editar)
    const createNewGoalBtn = document.getElementById('createNewGoalBtn');
    if (createNewGoalBtn) {
        createNewGoalBtn.addEventListener('click', () => {
            const habitForm = document.getElementById('habitForm');
            delete habitForm.dataset.editingGoalId;
            document.getElementById('goalModeLabel').textContent = 'Nueva Meta';
            createNewGoalBtn.classList.add('hidden');
            // Resetear campos de meta
            document.getElementById('goalTitle').value = '';
            document.getElementById('goalConditionType').value = 'times';
            document.getElementById('timesConditionSection').classList.remove('hidden');
            document.getElementById('hoursConditionSection').classList.add('hidden');
            document.getElementById('goalTargetTimes').value = '1';
            document.getElementById('goalPeriod').value = 'week';
            document.getElementById('goalTotalHours').value = '1';
        });
    }

    document.querySelectorAll('.freq-checkbox').forEach(cb => {
        cb.checked = false; // No marcar días por defecto
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

    // Notification bell
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            notificationDropdown.classList.toggle('hidden');
            loadNotifications();
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }

    // Close notification dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationBtn && !notificationBtn.contains(e.target) && notificationDropdown && !notificationDropdown.contains(e.target)) {
            if (notificationDropdown) notificationDropdown.classList.add('hidden');
        }
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
    }
}

async function handleLoginEvent() {
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

async function handleRegisterEvent() {
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
    ['home', 'habits', 'stats', 'calendar', 'settings', 'admin', 'goals'].forEach(s => {
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
    if (section === 'admin') loadAdminUsers();
    if (section === 'goals') loadGoals();
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

        // Formato de horario
        let scheduleText = '';
        if (habit.schedule && habit.schedule.time) {
            scheduleText = habit.schedule.deadline
                ? `🕐 ${habit.schedule.time} - ${habit.schedule.deadline}`
                : `🕐 ${habit.schedule.time}`;
        }

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
                        <p class="text-sm text-gray-600">${habit.category} • ${habit.duration.value} ${habit.duration.unit} ${scheduleText}</p>
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

    // Ordenar hábitos por horario
    const sortedHabits = [...habits].sort((a, b) => {
        if (!a.schedule || !a.schedule.time) return 1;
        if (!b.schedule || !b.schedule.time) return -1;
        return a.schedule.time.localeCompare(b.schedule.time);
    });

    sortedHabits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card p-4 rounded-lg border-2';

        // Formato de horario
        let scheduleText = '';
        if (habit.schedule && habit.schedule.time) {
            scheduleText = habit.schedule.deadline
                ? `🕐 ${habit.schedule.time} - ${habit.schedule.deadline}`
                : `🕐 ${habit.schedule.time}`;
        }

        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <span class="text-2xl">${habit.emoji}</span>
                    <div>
                        <h3 class="font-bold text-gray-800">${habit.name}</h3>
                        <p class="text-sm text-gray-600">${habit.category} • ${habit.frequency.join(', ')} ${scheduleText}</p>
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
            // Recargar metas para actualizar el progreso
            loadGoals();
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
            // Verificar si el deadline es cercano y enviar notificación
            const deadline = document.getElementById('habitDeadline').value;
            if (deadline) {
                checkAndSendDeadlineNotification(deadline, document.getElementById('habitName').value);
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
    delete habitForm.dataset.editingGoalId;
    // Resetear sección de meta
    document.getElementById('hasGoal').checked = false;
    document.getElementById('goalSection').classList.add('hidden');
    document.getElementById('goalModeLabel').textContent = 'Nueva Meta';
    document.getElementById('createNewGoalBtn').classList.add('hidden');
    // Desmarcar todos los días de frecuencia
    document.querySelectorAll('.freq-checkbox').forEach(cb => {
        cb.checked = false;
        const parent = cb.closest('.freq-day');
        parent.style.backgroundColor = '';
    });
}

async function handleCreateHabit(e) {
    e.preventDefault();
    console.log('🚀 handleCreateHabit iniciado');

    const habitForm = document.getElementById('habitForm');
    const editingId = habitForm.dataset.editingId;
    console.log('🚀 editingId:', editingId);

    const name = document.getElementById('habitName').value;
    const emoji = document.getElementById('habitEmoji').value || '✓';
    const category = document.getElementById('habitCategory').value;
    const duration = {
        value: document.getElementById('habitDuration').value,
        unit: document.getElementById('habitDurationUnit').value
    };

    const schedule = {
        time: document.getElementById('habitTime').value || null,
        deadline: document.getElementById('habitDeadline').value || null
    };

    const frequency = [];
    document.querySelectorAll('.freq-checkbox:checked').forEach(cb => {
        frequency.push(cb.value);
    });

    // Manejo de metas
    const hasGoal = document.getElementById('hasGoal').checked;
    let goalData = null;

    if (hasGoal) {
        const goalTitle = document.getElementById('goalTitle').value;
        const goalConditionType = document.getElementById('goalConditionType').value;

        if (!goalTitle) {
            showAlert('El título de la meta es requerido', 'error');
            return;
        }

        if (goalConditionType === 'times') {
            goalData = {
                title: goalTitle,
                conditionType: 'times',
                timesCondition: {
                    targetTimes: parseInt(document.getElementById('goalTargetTimes').value) || 1,
                    period: document.getElementById('goalPeriod').value,
                    currentCount: 0
                }
            };
        } else if (goalConditionType === 'hours') {
            goalData = {
                title: goalTitle,
                conditionType: 'hours',
                hoursCondition: {
                    totalHours: parseInt(document.getElementById('goalTotalHours').value) || 1,
                    currentHours: 0
                }
            };
        }
    }

    try {
        let response;
        if (editingId) {
            response = await fetch(`${API_URL}/habits/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, emoji, category, duration, frequency, schedule })
            });
        } else {
            response = await fetch(`${API_URL}/habits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, emoji, category, duration, frequency, schedule })
            });
        }

        const data = await response.json();

        if (response.ok) {
            console.log('Hábito creado/actualizado:', data);

            // Si hay meta, crearla después de crear el hábito
            if (hasGoal && goalData && !editingId) {
                console.log('Intentando crear meta con datos:', goalData);
                console.log('Habit ID:', data.habit._id);

                if (!data.habit || !data.habit._id) {
                    console.error('Error: data.habit._id no existe:', data);
                    showAlert('Error: ID de hábito no disponible', 'error');
                    return;
                }

                try {
                    const goalResponse = await fetch(`${API_URL}/goals`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            habitId: data.habit._id,
                            ...goalData
                        })
                    });

                    console.log('Respuesta de creación de meta - Status:', goalResponse.status);
                    const goalDataResponse = await goalResponse.json();
                    console.log('Respuesta de creación de meta - Data:', goalDataResponse);

                    if (goalResponse.ok) {
                        showAlert('Hábito y meta creados exitosamente', 'success');
                        console.log('Cargando metas...');
                        loadGoals(); // Cargar metas actualizadas
                    } else {
                        console.error('Error al crear meta:', goalDataResponse);
                        showAlert('Hábito creado, pero error al crear meta: ' + (goalDataResponse.message || 'Error desconocido'), 'warning');
                    }
                } catch (goalError) {
                    console.error('Excepción al crear meta:', goalError);
                    showAlert('Hábito creado, pero error al crear meta: ' + goalError.message, 'warning');
                }
            } else if (hasGoal && goalData && editingId) {
                // Actualizar meta existente
                const editingGoalId = habitForm.dataset.editingGoalId;
                console.log('Actualizando meta existente:', editingGoalId);

                if (editingGoalId) {
                    try {
                        const goalUpdateResponse = await fetch(`${API_URL}/goals/${editingGoalId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(goalData)
                        });

                        const goalUpdateData = await goalUpdateResponse.json();
                        console.log('Respuesta de actualización de meta:', goalUpdateData);

                        if (goalUpdateResponse.ok) {
                            showAlert('Hábito y meta actualizados exitosamente', 'success');
                            loadGoals();
                        } else {
                            showAlert('Hábito actualizado, pero error al actualizar meta: ' + (goalUpdateData.message || 'Error desconocido'), 'warning');
                        }
                    } catch (goalError) {
                        console.error('Excepción al actualizar meta:', goalError);
                        showAlert('Hábito actualizado, pero error al actualizar meta: ' + goalError.message, 'warning');
                    }
                } else {
                    // No había meta, crear una nueva
                    try {
                        const goalResponse = await fetch(`${API_URL}/goals`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                habitId: editingId,
                                ...goalData
                            })
                        });

                        const goalDataResponse = await goalResponse.json();
                        console.log('Respuesta de creación de meta en edición:', goalDataResponse);

                        if (goalResponse.ok) {
                            showAlert('Hábito actualizado y meta creada exitosamente', 'success');
                            loadGoals();
                        } else {
                            showAlert('Hábito actualizado, pero error al crear meta: ' + (goalDataResponse.message || 'Error desconocido'), 'warning');
                        }
                    } catch (goalError) {
                        console.error('Excepción al crear meta en edición:', goalError);
                        showAlert('Hábito actualizado, pero error al crear meta: ' + goalError.message, 'warning');
                    }
                }
            } else if (!hasGoal && editingId && habitForm.dataset.editingGoalId) {
                // Se desmarcó el checkbox de meta, eliminar la meta existente
                const editingGoalId = habitForm.dataset.editingGoalId;
                console.log('Eliminando meta:', editingGoalId);

                try {
                    const goalDeleteResponse = await fetch(`${API_URL}/goals/${editingGoalId}`, {
                        method: 'DELETE'
                    });

                    if (goalDeleteResponse.ok) {
                        showAlert('Hábito actualizado y meta eliminada', 'success');
                        loadGoals();
                    } else {
                        showAlert('Hábito actualizado, pero error al eliminar meta', 'warning');
                    }
                } catch (goalError) {
                    console.error('Excepción al eliminar meta:', goalError);
                    showAlert('Hábito actualizado, pero error al eliminar meta', 'warning');
                }
            } else {
                showAlert(editingId ? 'Hábito actualizado exitosamente' : 'Hábito creado exitosamente', 'success');
            }

            // Verificar deadline y enviar notificación SIEMPRE que haya deadline (movido fuera del else)
            const deadline = document.getElementById('habitDeadline').value;
            console.log('🔍 Deadline del input:', deadline, 'Nombre del hábito:', name);
            
            if (deadline && deadline.trim() !== '') {
                console.log('🔍 Deadline tiene valor, enviando notificación');
                checkAndSendDeadlineNotification(deadline, name);
            } else {
                console.log('❌ Deadline está vacío');
            }

            hideHabitModal();
            delete habitForm.dataset.editingId;
            delete habitForm.dataset.editingGoalId;
            loadTodayHabits();
            loadAllHabits();
        } else {
            console.error('Error al guardar hábito:', data);
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

                // Cargar horarios si existen
                if (habit.schedule) {
                    document.getElementById('habitTime').value = habit.schedule.time || '';
                    document.getElementById('habitDeadline').value = habit.schedule.deadline || '';
                }

                document.querySelectorAll('.freq-checkbox').forEach(cb => {
                    cb.checked = true; // Marcar todos los días por defecto al editar
                    cb.dispatchEvent(new Event('change'));
                });

                const habitForm = document.getElementById('habitForm');
                habitForm.dataset.editingId = habitId;

                // Cargar meta asociada si existe
                console.log('Cargando meta para hábito:', habitId);
                const goalsResponse = await fetch(`${API_URL}/goals/habit/${habitId}`);
                const goalsData = await goalsResponse.json();

                if (goalsResponse.ok && goalsData.goals && goalsData.goals.length > 0) {
                    console.log('Meta encontrada:', goalsData.goals[0]);
                    const goal = goalsData.goals[0];

                    // Marcar checkbox de meta
                    document.getElementById('hasGoal').checked = true;
                    document.getElementById('goalSection').classList.remove('hidden');

                    // Guardar ID de la meta para editar
                    habitForm.dataset.editingGoalId = goal._id;

                    // Mostrar label de edición y botón de crear nueva
                    document.getElementById('goalModeLabel').textContent = 'Editando Meta Existente';
                    document.getElementById('createNewGoalBtn').classList.remove('hidden');

                    // Llenar campos de la meta
                    document.getElementById('goalTitle').value = goal.title;
                    document.getElementById('goalConditionType').value = goal.conditionType;

                    // Mostrar sección según tipo de condición
                    if (goal.conditionType === 'times') {
                        document.getElementById('timesConditionSection').classList.remove('hidden');
                        document.getElementById('hoursConditionSection').classList.add('hidden');
                        document.getElementById('goalTargetTimes').value = goal.timesCondition.targetTimes;
                        document.getElementById('goalPeriod').value = goal.timesCondition.period;
                    } else if (goal.conditionType === 'hours') {
                        document.getElementById('timesConditionSection').classList.add('hidden');
                        document.getElementById('hoursConditionSection').classList.remove('hidden');
                        document.getElementById('goalTotalHours').value = goal.hoursCondition.totalHours;
                    }
                } else {
                    console.log('No hay meta asociada al hábito');
                    // Limpiar campos de meta
                    document.getElementById('hasGoal').checked = false;
                    document.getElementById('goalSection').classList.add('hidden');
                    delete habitForm.dataset.editingGoalId;
                    document.getElementById('goalModeLabel').textContent = 'Nueva Meta';
                    document.getElementById('createNewGoalBtn').classList.add('hidden');
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar hábito:', error);
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
            // Cargar estadísticas de metas
            loadGoalsStats();
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
        const emojis = ['🎯', '💧', '🏃', '📚', '💪', '🧘', '🌅', '🦉', '🥗', '💤', '📝', '🎨', '🎵', '💻', '📱', '🎮', '⚽', '🛏️', '🏠', '💰', '💼', '📅', '🌱', '🚴', '📖', '✈️', '🍎', '☕', '🥤', '🍣', '🌮', '🍦', '🍏', '🍋', '🍊', '🍍', '🥝', '🥜', '🥕', '🥦', '🥒', '🍒', '🥑', '🍄', '🌶', '🍉', '🍐', '🍇', '🍌', '🍑', '🍓', '💝', '🎁', '🎈', '🎉', '🎊', '🎓', '🏆', '🏅', '🥇', '🥈', '🥉', '⚡', '💎', '⭐', '🌟', '✨', '🌈', '🔥', '💡', '📌', '📍', '🔖', '🏷️', '🔑', '🔒', '🔓', '🔔', '📢', '📣', '🔊', '🎵', '🎶', '🎤', '🎧', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁', '☎️', '🔋', '🔌', '⌨️', '🖱️', '💾', '💿', '🎥', '📺', '📷', '📸', '📹', '🔍', '🔎', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '📑', '💰', '💵', '💸', '💳', '🧾', '💹', '💲', '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '✏️', '🖊️', '🖌️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🔨', '⛏️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗'];

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
        // Agregar timestamp para evitar cache del navegador
        const timestamp = Date.now();
        const response = await fetch(`${API_URL}/stats/month/${year}/${month}?t=${timestamp}`);
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

async function checkAndSendDeadlineNotification(deadline, habitName) {
    try {
        console.log('🔍 Verificando deadline:', deadline, 'para hábito:', habitName);
        
        const now = new Date();
        const [hours, minutes] = deadline.split(':').map(Number);

        const deadlineDate = new Date();
        deadlineDate.setHours(hours, minutes, 0, 0);

        // Calcular diferencia en minutos
        let diffMs = deadlineDate - now;
        let diffMinutes = Math.floor(diffMs / 60000);

        console.log('📅 Ahora:', now.toLocaleTimeString(), 'Deadline:', deadlineDate.toLocaleTimeString(), 'Diferencia:', diffMinutes, 'min');

        // Si el deadline ya pasó hoy, asumir que es mañana
        if (diffMs < 0) {
            deadlineDate.setDate(deadlineDate.getDate() + 1);
            diffMs = deadlineDate - now;
            diffMinutes = Math.floor(diffMs / 60000);
            console.log('📅 Deadline es mañana, nueva diferencia:', diffMinutes, 'min');
        }

        // Si faltan menos de 30 minutos (en las próximas 24 horas), enviar notificación inmediata
        if (diffMinutes > 0 && diffMinutes <= 30) {
            const message = diffMinutes <= 15
                ? `⚠️ Faltan ${diffMinutes} minutos para que "${habitName}" se complete. ¡Última oportunidad!`
                : `⏰ Faltan ${diffMinutes} minutos para que "${habitName}" se complete. ¡Apúrate!`;

            console.log('📢 Enviando notificación urgente:', message);
            const response = await fetch(`${API_URL}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type: 'warning' })
            });

            if (response.ok) {
                loadNotifications();
                showAlert('Notificación de deadline enviada', 'success');
            }
        } else if (diffMinutes > 30 && diffMinutes <= 1440) {
            // Si faltan entre 30 min y 24 horas, enviar notificación informativa
            const hours = Math.floor(diffMinutes / 60);
            const mins = diffMinutes % 60;
            const timeText = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

            const message = `⏰ Faltan ${timeText} para que "${habitName}" se complete.`;

            console.log('📢 Enviando notificación informativa:', message);
            const response = await fetch(`${API_URL}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type: 'info' })
            });

            if (response.ok) {
                loadNotifications();
                showAlert('Notificación de deadline enviada', 'success');
            }
        } else {
            console.log('❌ No se envió notificación: tiempo restante fuera de rango');
        }
    } catch (error) {
        console.error('Error al verificar deadline:', error);
    }
}

function showAlert(message, type) {
    // Las alertas siempre se muestran, independientemente de notificationsEnabled
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

// ===== SIDEBAR TOGGLE =====

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    const toggleBtn = document.getElementById('sidebarToggle');

    sidebar.classList.toggle('sidebar-collapsed');
    main.classList.toggle('sidebar-collapsed');

    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    toggleBtn.textContent = isCollapsed ? '▶' : '◀';

    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
}

function loadSidebarPreference() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('main');
    const toggleBtn = document.getElementById('sidebarToggle');

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    if (isCollapsed) {
        sidebar.classList.add('sidebar-collapsed');
        main.classList.add('sidebar-collapsed');
        if (toggleBtn) toggleBtn.textContent = '▶';
    }
}

// ===== GOALS FUNCTIONS =====

function calculateCyclesCompleted(goal) {
    if (goal.conditionType === 'hours') {
        return null; // No aplica para horas
    }

    const createdAt = new Date(goal.createdAt);
    const now = new Date();
    const period = goal.timesCondition.period;

    const diffTime = now - createdAt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (period === 'day') {
        return { completed: diffDays, period: 'días' };
    } else if (period === 'week') {
        const weeks = Math.floor(diffDays / 7);
        return { completed: weeks, period: 'semanas' };
    } else if (period === 'month') {
        const months = Math.floor(diffDays / 30);
        return { completed: months, period: 'meses' };
    }

    return { completed: 0, period: period };
}

async function loadGoals() {
    console.log('Cargando metas...');
    try {
        const response = await fetch(`${API_URL}/goals`);
        const data = await response.json();

        console.log('Respuesta de loadGoals - Status:', response.status);
        console.log('Respuesta de loadGoals - Data:', data);

        if (response.ok) {
            console.log('Metas cargadas:', data.goals);
            renderGoals(data.goals);
            loadGoalsStats();
        } else {
            console.error('Error al cargar metas:', data);
            showAlert(data.message || 'Error al cargar metas', 'error');
        }
    } catch (error) {
        console.error('Excepción en loadGoals:', error);
        showAlert('Error de conexión', 'error');
    }
}

// ===== NOTIFICATIONS FUNCTIONS =====

async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/notifications`);
        const data = await response.json();

        if (response.ok) {
            renderNotifications(data.notifications);
            updateNotificationBadge(data.notifications);
        }
    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notificationList');
    container.innerHTML = '';

    if (notifications.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No tienes notificaciones</p>';
        return;
    }

    notifications.forEach(notification => {
        const div = document.createElement('div');
        div.className = `p-3 border-b hover:bg-gray-50 ${notification.read ? 'bg-gray-50' : 'bg-white'}`;

        const createdAt = new Date(notification.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="text-sm text-gray-800 ${notification.read ? '' : 'font-semibold'}">${notification.message}</p>
                    <p class="text-xs text-gray-500 mt-1">${createdAt}</p>
                </div>
                <button onclick="deleteNotification('${notification._id}')" class="text-red-500 hover:text-red-700 text-xs ml-2">🗑️</button>
            </div>
        `;

        container.appendChild(div);
    });
}

function updateNotificationBadge(notifications) {
    const badge = document.getElementById('notificationBadge');
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

async function markAllNotificationsAsRead() {
    try {
        const response = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT'
        });

        if (response.ok) {
            loadNotifications();
            showAlert('Todas las notificaciones marcadas como leídas', 'success');
        } else {
            showAlert('Error al marcar notificaciones', 'error');
        }
    } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
        showAlert('Error de conexión', 'error');
    }
}

async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadNotifications();
            showAlert('Notificación eliminada', 'success');
        } else {
            showAlert('Error al eliminar notificación', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        showAlert('Error de conexión', 'error');
    }
}

async function loadGoalsStats() {
    try {
        const response = await fetch(`${API_URL}/goals/stats/all`);
        const data = await response.json();

        if (response.ok) {
            const stats = data.stats;
            // Sección de metas
            document.getElementById('totalGoals').textContent = stats.total;
            document.getElementById('activeGoals').textContent = stats.active;
            document.getElementById('completedGoals').textContent = stats.completed;
            document.getElementById('goalsSuccessRate').textContent = stats.successRate + '%';
            // Sección de estadísticas
            document.getElementById('statsTotalGoals').textContent = stats.total;
            document.getElementById('statsActiveGoals').textContent = stats.active;
            document.getElementById('statsCompletedGoals').textContent = stats.completed;
            document.getElementById('statsGoalsSuccessRate').textContent = stats.successRate + '%';
        }
    } catch (error) {
        console.error('Error al cargar estadísticas de metas:', error);
    }
}

function renderGoals(goals) {
    console.log('=== RENDERIZANDO METAS ===');
    console.log('Metas recibidas:', goals);
    console.log('Número de metas:', goals.length);

    const container = document.getElementById('goalsList');
    console.log('Contenedor goalsList:', container);

    if (!container) {
        console.error('Error: Contenedor goalsList no encontrado');
        return;
    }

    container.innerHTML = '';

    if (goals.length === 0) {
        console.log('No hay metas, mostrando mensaje vacío');
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No tienes metas asignadas. Crea un hábito con una meta para comenzar.</p>';
        return;
    }

    // Agrupar metas por hábito
    const goalsByHabit = {};
    goals.forEach(goal => {
        console.log('Procesando meta:', goal);
        const habitName = goal.habit.name;
        if (!goalsByHabit[habitName]) {
            goalsByHabit[habitName] = [];
        }
        goalsByHabit[habitName].push(goal);
    });

    console.log('Metas agrupadas por hábito:', goalsByHabit);

    // Renderizar cada grupo
    Object.keys(goalsByHabit).forEach(habitName => {
        console.log('Renderizando grupo para hábito:', habitName);
        const habitGoals = goalsByHabit[habitName];
        const habitEmoji = habitGoals[0].habit.emoji;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'border rounded-lg p-4 mb-4';

        groupDiv.innerHTML = `
            <div class="flex items-center space-x-3 mb-3">
                <span class="text-2xl">${habitEmoji}</span>
                <h3 class="font-bold text-gray-800">${habitName}</h3>
            </div>
        `;

        habitGoals.forEach(goal => {
            const goalCard = document.createElement('div');
            goalCard.className = 'ml-8 p-3 bg-gray-50 rounded-lg mb-2';

            // Formato de condición
            let conditionText = '';
            if (goal.conditionType === 'times') {
                const periodMap = {
                    'day': 'al día',
                    'week': 'a la semana',
                    'month': 'al mes'
                };
                const periodText = periodMap[goal.timesCondition.period] || goal.timesCondition.period;
                conditionText = `${goal.timesCondition.currentCount}/${goal.timesCondition.targetTimes} veces ${periodText}`;
            } else if (goal.conditionType === 'hours') {
                conditionText = `${goal.hoursCondition.currentHours}/${goal.hoursCondition.totalHours} horas`;
            }

            // Calcular ciclos completados
            const cycles = calculateCyclesCompleted(goal);
            let cyclesText = '';
            if (cycles) {
                cyclesText = `<p class="text-xs text-gray-500 mt-1">📅 ${cycles.completed} ${cycles.period} completados</p>`;
            }

            // Color de estado
            let statusColor = 'bg-gray-100 text-gray-700';
            if (goal.status === 'completed') statusColor = 'bg-green-100 text-green-700';
            if (goal.status === 'active') statusColor = 'bg-blue-100 text-blue-700';
            if (goal.status === 'failed') statusColor = 'bg-red-100 text-red-700';

            goalCard.innerHTML = `
                <div class="flex items-center justify-between" id="goal-content-${goal._id}">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${goal.title}</h4>
                        <p class="text-sm text-gray-600">${conditionText}</p>
                        ${cyclesText}
                        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div class="bg-purple-500 h-2 rounded-full" style="width: ${goal.progress}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">${goal.progress}% completado</p>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        <span class="px-2 py-1 rounded text-xs font-medium ${statusColor}">
                            ${goal.status === 'active' ? 'Activa' : goal.status === 'completed' ? 'Completada' : goal.status}
                        </span>
                        <button onclick="toggleGoalEdit('${goal._id}')" class="text-blue-500 hover:text-blue-700 text-sm">✏️</button>
                        <button onclick="deleteGoal('${goal._id}')" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>
                    </div>
                </div>
                <div class="hidden mt-3 pt-3 border-t border-gray-200" id="goal-edit-${goal._id}">
                    <div class="space-y-2">
                        <div>
                            <label class="text-xs text-gray-500">Título</label>
                            <input type="text" id="edit-goal-title-${goal._id}" value="${goal.title}"
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Frecuencia</label>
                            <select id="edit-goal-period-${goal._id}"
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                                <option value="day" ${goal.timesCondition.period === 'day' ? 'selected' : ''}>Al día</option>
                                <option value="week" ${goal.timesCondition.period === 'week' ? 'selected' : ''}>A la semana</option>
                                <option value="month" ${goal.timesCondition.period === 'month' ? 'selected' : ''}>Al mes</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Veces objetivo</label>
                            <input type="number" id="edit-goal-target-${goal._id}" value="${goal.timesCondition.targetTimes}"
                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        </div>
                        <div class="flex space-x-2 mt-2">
                            <button onclick="saveGoalEdit('${goal._id}')" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Guardar</button>
                            <button onclick="toggleGoalEdit('${goal._id}')" class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400">Cancelar</button>
                        </div>
                    </div>
                </div>
            `;
            groupDiv.appendChild(goalCard);
        });

        container.appendChild(groupDiv);
    });
}

// ===== GOAL EDIT/DELETE FUNCTIONS =====

async function editGoal(goalId) {
    // Esta función ya no se usa, se reemplaza por toggleGoalEdit
    toggleGoalEdit(goalId);
}

function toggleGoalEdit(goalId) {
    const contentDiv = document.getElementById(`goal-content-${goalId}`);
    const editDiv = document.getElementById(`goal-edit-${goalId}`);

    if (contentDiv && editDiv) {
        contentDiv.classList.toggle('hidden');
        editDiv.classList.toggle('hidden');
    }
}

async function saveGoalEdit(goalId) {
    try {
        const title = document.getElementById(`edit-goal-title-${goalId}`).value;
        const period = document.getElementById(`edit-goal-period-${goalId}`).value;
        const targetTimes = parseInt(document.getElementById(`edit-goal-target-${goalId}`).value);

        const response = await fetch(`${API_URL}/goals/${goalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                timesCondition: {
                    period,
                    targetTimes
                }
            })
        });

        if (response.ok) {
            showAlert('Meta actualizada', 'success');
            loadGoals();
        } else {
            showAlert('Error al actualizar meta', 'error');
        }
    } catch (error) {
        console.error('Error al guardar meta:', error);
        showAlert('Error de conexión', 'error');
    }
}

async function deleteGoal(goalId) {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return;

    try {
        const response = await fetch(`${API_URL}/goals/${goalId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Meta eliminada', 'success');
            loadGoals();
        } else {
            showAlert('Error al eliminar meta', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// ===== ADMIN FUNCTIONS =====

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`);
        const data = await response.json();

        if (response.ok) {
            renderAdminUsers(data.users);
        } else {
            showAlert(data.message || 'Error al cargar usuarios', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

function renderAdminUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-200';
        row.innerHTML = `
            <td class="py-3 px-4 text-white font-medium">${user.name}</td>
            <td class="py-3 px-4 text-gray-800">${user.email}</td>
            <td class="py-3 px-4 text-gray-500 font-semibold">${user.streak} 🔥</td>
            <td class="py-3 px-4 text-gray-500 font-semibold">${user.level} ⭐</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-xs font-medium ${user.isAdmin ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'}">
                    ${user.isAdmin ? 'Admin' : 'Usuario'}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button onclick="showAdminActionModal('${user._id}', 'resetPassword')" class="text-blue-400 hover:text-blue-300 text-sm font-medium">Reset Password</button>
                    <button onclick="showAdminActionModal('${user._id}', 'changeEmail')" class="text-green-700 hover:text-green-900 text-sm font-medium">Cambiar Email</button>
                    <button onclick="showAdminActionModal('${user._id}', 'delete')" class="text-red-700 hover:text-red-900 text-sm font-medium">Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

let currentAdminAction = null;
let currentAdminUserId = null;

async function showAdminActionModal(userId, action) {
    currentAdminUserId = userId;
    currentAdminAction = action;

    const modal = document.getElementById('adminModal');
    const title = document.getElementById('adminModalTitle');
    const content = document.getElementById('adminModalContent');

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Obtener datos del usuario
    const usersResponse = await fetch(`${API_URL}/admin/users`);
    const usersData = await usersResponse.json();
    const user = usersData.users.find(u => u._id === userId);

    if (action === 'resetPassword') {
        title.textContent = 'Resetear Contraseña';
        content.innerHTML = `
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">Usuario</label>
                <p class="text-gray-800 font-medium">${user ? user.name : 'N/A'}</p>
                <p class="text-gray-600 text-sm">${user ? user.email : 'N/A'}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                <div class="relative">
                    <input type="password" id="adminNewPassword" required minlength="6"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        placeholder="Nueva contraseña (mínimo 6 caracteres)">
                    <button type="button" onclick="togglePasswordVisibility('adminNewPassword')" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg">
                        👁️
                    </button>
                </div>
            </div>
        `;
    } else if (action === 'changeEmail') {
        title.textContent = 'Cambiar Email';
        content.innerHTML = `
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">Email Actual</label>
                <p class="text-gray-800 font-medium">${user ? user.email : 'N/A'}</p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nuevo Email</label>
                <input type="email" id="adminNewEmail" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="nuevo@email.com">
            </div>
        `;
    } else if (action === 'delete') {
        title.textContent = 'Eliminar Usuario';
        content.innerHTML = `
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1">Usuario a eliminar</label>
                <p class="text-gray-800 font-medium">${user ? user.name : 'N/A'}</p>
                <p class="text-gray-600 text-sm">${user ? user.email : 'N/A'}</p>
            </div>
            <p class="text-red-600 mb-4">⚠️ Esta acción es irreversible. ¿Estás seguro de que deseas eliminar este usuario y todos sus datos?</p>
        `;
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function hideAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentAdminAction = null;
    currentAdminUserId = null;
}

async function handleAdminAction() {
    if (!currentAdminUserId || !currentAdminAction) return;

    try {
        let response;
        let body = {};

        if (currentAdminAction === 'resetPassword') {
            const newPassword = document.getElementById('adminNewPassword').value;
            if (!newPassword || newPassword.length < 6) {
                showAlert('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            body = { newPassword };
            response = await fetch(`${API_URL}/admin/users/${currentAdminUserId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else if (currentAdminAction === 'changeEmail') {
            const newEmail = document.getElementById('adminNewEmail').value;
            if (!newEmail) {
                showAlert('El email es requerido', 'error');
                return;
            }
            body = { newEmail };
            response = await fetch(`${API_URL}/admin/users/${currentAdminUserId}/email`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } else if (currentAdminAction === 'delete') {
            response = await fetch(`${API_URL}/admin/users/${currentAdminUserId}`, {
                method: 'DELETE'
            });
        }

        const data = await response.json();

        if (response.ok) {
            showAlert(data.message, 'success');
            hideAdminModal();
            loadAdminUsers();
        } else {
            showAlert(data.message || 'Error en la acción', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Agregar event listeners para admin modal
document.addEventListener('DOMContentLoaded', () => {
    const closeAdminModal = document.getElementById('closeAdminModal');
    const confirmAdminAction = document.getElementById('confirmAdminAction');

    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', hideAdminModal);
    }
    if (confirmAdminAction) {
        confirmAdminAction.addEventListener('click', handleAdminAction);
    }
});
