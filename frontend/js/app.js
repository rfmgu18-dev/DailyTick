// DailyTick Frontend Application

// API Base URL
const API_URL = '/api';

// DOM Elements
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const habitModal = document.getElementById('habitModal');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
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
        console.error('Error checking auth:', error);
        showAuth();
    }
}

// Show authentication section
function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

// Show main application
function showApp(user) {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    loadTodayHabits();
    updateUserInfo(user);
}

// Setup event listeners
function setupEventListeners() {
    // Auth forms
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

    // Navigation
    document.getElementById('navHome').addEventListener('click', () => showSection('home'));
    document.getElementById('navHabits').addEventListener('click', () => showSection('habits'));
    document.getElementById('navStats').addEventListener('click', () => showSection('stats'));
    document.getElementById('navCalendar').addEventListener('click', () => showSection('calendar'));
    document.getElementById('navSettings').addEventListener('click', () => showSection('settings'));
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Habit buttons
    document.getElementById('addHabitBtn').addEventListener('click', () => showHabitModal());
    document.getElementById('addNewHabitBtn').addEventListener('click', () => showHabitModal());
    document.getElementById('cancelHabitBtn').addEventListener('click', hideHabitModal);
    document.getElementById('habitForm').addEventListener('submit', handleCreateHabit);

    // Achievements modal
    document.getElementById('achievementsBtn').addEventListener('click', showAchievementsModal);
    document.getElementById('closeAchievementsBtn').addEventListener('click', hideAchievementsModal);
    
    // Custom achievements tabs
    document.getElementById('systemAchievementsTab').addEventListener('click', () => showAchievementsTab('system'));
    document.getElementById('customAchievementsTab').addEventListener('click', () => showAchievementsTab('custom'));
    document.getElementById('createCustomAchievementBtn').addEventListener('click', () => {
        showAchievementsTab('custom');
        showCustomAchievementCreator();
    });
    
    // Custom achievement form
    document.getElementById('customAchievementForm').addEventListener('submit', handleCreateCustomAchievement);
    document.getElementById('cancelCustomAchievement').addEventListener('click', hideCustomAchievementCreator);

    // Settings forms
    document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);
    document.getElementById('passwordForm').addEventListener('submit', handleChangePassword);
    document.getElementById('saveSettingsBtn').addEventListener('click', handleUpdateSettings);
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);

    // Emoji picker
    document.getElementById('emojiPickerBtn').addEventListener('click', showEmojiPicker);
    document.getElementById('closeEmojiPicker').addEventListener('click', hideEmojiPicker);

    // Set default frequency checkboxes and handle UI
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
        // Trigger change to set initial state
        cb.dispatchEvent(new Event('change'));
    });
}

// Handle login
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

// Handle registration
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

// Handle logout
async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        showAlert('Sesión cerrada', 'success');
        showAuth();
    } catch (error) {
        showAlert('Error al cerrar sesión', 'error');
    }
}

// Show section
function showSection(section) {
    // Hide all sections
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('habitsSection').classList.add('hidden');
    document.getElementById('statsSection').classList.add('hidden');
    document.getElementById('calendarSection').classList.add('hidden');
    document.getElementById('settingsSection').classList.add('hidden');

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-50', 'text-blue-600', 'font-medium');
        btn.classList.add('hover:bg-gray-100', 'text-gray-700');
    });

    // Show selected section
    document.getElementById(`${section}Section`).classList.remove('hidden');

    // Add active class to selected nav button
    const activeBtn = document.getElementById(`nav${section.charAt(0).toUpperCase() + section.slice(1)}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-blue-50', 'text-blue-600', 'font-medium');
        activeBtn.classList.remove('hover:bg-gray-100', 'text-gray-700');
    }

    // Load section-specific data
    if (section === 'home') loadTodayHabits();
    if (section === 'habits') loadAllHabits();
    if (section === 'stats') loadStats();
    if (section === 'calendar') {
        currentCalendarDate = new Date(); // Reset to current month
        loadCalendar();
    }
    if (section === 'settings') loadSettings();
}

// Load today's habits
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
        console.error('Error loading habits:', error);
    }
}

// Load all habits
async function loadAllHabits() {
    try {
        const response = await fetch(`${API_URL}/habits`);
        const data = await response.json();

        if (response.ok) {
            renderAllHabits(data.habits);
        }
    } catch (error) {
        console.error('Error loading all habits:', error);
    }
}

// Render habits list
function renderHabits(habits) {
    const container = document.getElementById('habitsList');
    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay hábitos para hoy. ¡Agrega uno nuevo!</p>';
        return;
    }

    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = `habit-card bg-white p-4 rounded-lg shadow flex items-center justify-between ${habit.completedToday ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="flex items-center space-x-3">
                <input type="checkbox" 
                    class="habit-checkbox" 
                    data-emoji="${habit.emoji}"
                    ${habit.completedToday ? 'checked' : ''} 
                    onchange="toggleHabit('${habit._id}', '${habit.completedToday}')">
                <div>
                    <p class="font-medium text-gray-800">${habit.name}</p>
                    <p class="text-sm text-gray-500">${habit.duration.value} ${habit.duration.unit} • ${habit.category}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Render all habits
function renderAllHabits(habits) {
    const container = document.getElementById('allHabitsList');
    container.innerHTML = '';

    if (habits.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No tienes hábitos creados aún.</p>';
        return;
    }

    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card bg-white p-4 rounded-lg shadow';
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${habit.emoji}</span>
                    <div>
                        <p class="font-medium text-gray-800">${habit.name}</p>
                        <p class="text-sm text-gray-500">${habit.category} • ${habit.frequency.join(', ')}</p>
                    </div>
                </div>
                <div class="relative">
                    <button onclick="toggleHabitMenu('${habit._id}')" class="text-gray-500 hover:text-gray-700 text-xl">⋮</button>
                    <div id="habitMenu-${habit._id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                        <button onclick="editHabit('${habit._id}')" class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg">✏️ Modificar Hábito</button>
                        <button onclick="deleteHabit('${habit._id}')" class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-b-lg">🗑️ Eliminar Hábito</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Toggle habit menu
function toggleHabitMenu(habitId) {
    const menu = document.getElementById(`habitMenu-${habitId}`);
    const allMenus = document.querySelectorAll('[id^="habitMenu-"]');
    
    // Close all other menus
    allMenus.forEach(m => {
        if (m.id !== `habitMenu-${habitId}`) {
            m.classList.add('hidden');
        }
    });
    
    // Toggle current menu
    menu.classList.toggle('hidden');
}

// Edit habit (opens the habit modal with existing data)
function editHabit(habitId) {
    // Find the habit data
    fetch(`${API_URL}/habits`)
        .then(response => response.json())
        .then(data => {
            const habit = data.habits.find(h => h._id === habitId);
            if (habit) {
                // Populate the form with existing data
                document.getElementById('habitName').value = habit.name;
                document.getElementById('habitEmoji').value = habit.emoji;
                document.getElementById('habitCategory').value = habit.category;
                document.getElementById('habitDuration').value = habit.duration.value;
                document.getElementById('habitDurationUnit').value = habit.duration.unit;
                
                // Set frequency checkboxes
                document.querySelectorAll('.freq-checkbox').forEach(cb => {
                    cb.checked = habit.frequency.includes(cb.value);
                    cb.dispatchEvent(new Event('change'));
                });
                
                // Store the habit ID for updating
                document.getElementById('habitForm').dataset.editingHabitId = habitId;
                
                // Change the form behavior to update instead of create
                const submitBtn = document.querySelector('#habitForm button[type="submit"]');
                submitBtn.textContent = 'Actualizar Hábito';
                
                showHabitModal();
            }
        });
}

// Toggle habit completion
async function toggleHabit(habitId, currentStatus) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_URL}/habits/${habitId}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: today })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Show achievement notifications if any
            if (data.newAchievements && data.newAchievements.length > 0) {
                data.newAchievements.forEach(achievement => {
                    showAchievementNotification(achievement);
                });
            }
            
            loadTodayHabits();
        }
    } catch (error) {
        console.error('Error toggling habit:', error);
    }
}

// Delete habit
async function deleteHabit(habitId) {
    if (!confirm('¿Estás seguro de eliminar este hábito?')) return;

    try {
        const response = await fetch(`${API_URL}/habits/${habitId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Hábito eliminado', 'success');
            // Close the menu
            const menu = document.getElementById(`habitMenu-${habitId}`);
            if (menu) menu.classList.add('hidden');
            loadAllHabits();
        }
    } catch (error) {
        showAlert('Error al eliminar hábito', 'error');
    }
}

// Show habit modal
function showHabitModal() {
    habitModal.classList.remove('hidden');
    habitModal.classList.add('flex');
}

// Hide habit modal
function hideHabitModal() {
    habitModal.classList.add('hidden');
    habitModal.classList.remove('flex');
    document.getElementById('habitForm').reset();
    
    // Reset editing state
    const form = document.getElementById('habitForm');
    delete form.dataset.editingHabitId;
    
    // Reset button text
    const submitBtn = document.querySelector('#habitForm button[type="submit"]');
    submitBtn.textContent = 'Crear Hábito';
    
    // Reset frequency checkboxes
    document.querySelectorAll('.freq-checkbox').forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
}

// Handle create habit
async function handleCreateHabit(e) {
    e.preventDefault();

    const name = document.getElementById('habitName').value;
    const emoji = document.getElementById('habitEmoji').value || '✓';
    const category = document.getElementById('habitCategory').value;
    const duration = {
        value: parseInt(document.getElementById('habitDuration').value),
        unit: document.getElementById('habitDurationUnit').value
    };

    const frequency = [];
    document.querySelectorAll('.freq-checkbox:checked').forEach(cb => {
        frequency.push(cb.value);
    });

    if (frequency.length === 0) {
        showAlert('Selecciona al menos un día de la semana', 'error');
        return;
    }

    const form = document.getElementById('habitForm');
    const editingHabitId = form.dataset.editingHabitId;

    try {
        let response, data;

        if (editingHabitId) {
            // Update existing habit
            response = await fetch(`${API_URL}/habits/${editingHabitId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, emoji, category, frequency, duration })
            });
            data = await response.json();

            if (response.ok) {
                showAlert('Hábito actualizado exitosamente', 'success');
            } else {
                showAlert(data.message || 'Error al actualizar hábito', 'error');
            }
        } else {
            // Create new habit
            response = await fetch(`${API_URL}/habits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, emoji, category, frequency, duration })
            });
            data = await response.json();

            if (response.ok) {
                showAlert('Hábito creado exitosamente', 'success');
            } else {
                showAlert(data.message || 'Error al crear hábito', 'error');
            }
        }

        if (response.ok) {
            hideHabitModal();
            loadTodayHabits();
            loadAllHabits();
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Update progress counter
function updateProgress(habits) {
    const completed = habits.filter(h => h.completedToday).length;
    const total = habits.length;
    document.getElementById('progressCounter').textContent = `${completed}/${total} completados`;
}

// Update current date display
function updateCurrentDate() {
    const options = { weekday: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('es-ES', options);
    document.getElementById('currentDate').textContent = `Hoy - ${today.charAt(0).toUpperCase() + today.slice(1)}`;
}

// Update user info
function updateUserInfo(user) {
    // Update user-related UI elements
    console.log('User info updated:', user);
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        if (response.ok) {
            // Update streak
            document.getElementById('currentStreak').textContent = `${data.currentStreak} días 🔥`;
            
            // Update completion rate
            document.getElementById('completionRate').textContent = `${data.completionRate}%`;
            document.getElementById('completionBar').style.width = `${data.completionRate}%`;
            
            // Render weekly chart with real data
            const weeklyData = data.weeklyData.map(day => day.completed);
            renderWeeklyChart(weeklyData);
            
            // Show most consistent habit if exists
            if (data.mostConsistentHabit) {
                showMostConsistentHabit(data.mostConsistentHabit);
            }
            
            // Load level progress
            await loadLevelProgress();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        showAlert('Error al cargar estadísticas', 'error');
    }
}

// Render weekly chart
function renderWeeklyChart(data) {
    const container = document.getElementById('weeklyChart');
    container.innerHTML = '';
    
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const maxValue = Math.max(...data, 1); // Avoid division by zero

    days.forEach((day, index) => {
        const height = (data[index] / maxValue) * 100;
        const bar = document.createElement('div');
        bar.className = 'chart-bar flex flex-col items-center';
        bar.innerHTML = `
            <div class="bg-blue-500 w-8 rounded-t" style="height: ${height}%"></div>
            <span class="text-sm text-gray-600 mt-2">${day}</span>
        `;
        container.appendChild(bar);
    });
}

// Show most consistent habit
function showMostConsistentHabit(habit) {
    const container = document.getElementById('weeklyChart').parentElement;
    
    const habitInfo = document.createElement('div');
    habitInfo.className = 'mt-4 p-4 bg-green-50 rounded-lg';
    habitInfo.innerHTML = `
        <h4 class="font-semibold text-green-800">🏆 Hábito más consistente</h4>
        <p class="text-green-700">${habit.emoji} ${habit.name} - ${habit.rate}% de cumplimiento</p>
    `;
    
    container.appendChild(habitInfo);
}

// Show alert
function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Show achievement notification
function showAchievementNotification(achievement) {
    const container = document.getElementById('alertContainer');
    const notification = document.createElement('div');
    notification.className = 'alert alert-success bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0';
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="text-2xl">${achievement.icon}</span>
            <div>
                <p class="font-bold">¡Logro desbloqueado!</p>
                <p class="text-sm">${achievement.name} - +${achievement.points} puntos</p>
            </div>
        </div>
    `;
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Show achievements modal
async function showAchievementsModal() {
    const modal = document.getElementById('achievementsModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    await loadAchievements();
    await loadLevelProgress();
}

// Show achievements tab
function showAchievementsTab(tab) {
    const systemTab = document.getElementById('systemAchievementsTab');
    const customTab = document.getElementById('customAchievementsTab');
    const creator = document.getElementById('customAchievementCreator');
    
    if (tab === 'system') {
        systemTab.classList.add('border-green-500', 'text-green-600');
        systemTab.classList.remove('border-transparent', 'text-gray-500');
        customTab.classList.remove('border-green-500', 'text-green-600');
        customTab.classList.add('border-transparent', 'text-gray-500');
        creator.classList.add('hidden');
        loadAchievements();
    } else {
        customTab.classList.add('border-green-500', 'text-green-600');
        customTab.classList.remove('border-transparent', 'text-gray-500');
        systemTab.classList.remove('border-green-500', 'text-green-600');
        systemTab.classList.add('border-transparent', 'text-gray-500');
        creator.classList.remove('hidden');
        loadCustomAchievements();
    }
}

// Load custom achievements
async function loadCustomAchievements() {
    try {
        const response = await fetch(`${API_URL}/achievements/custom`);
        const data = await response.json();

        if (response.ok) {
            renderCustomAchievements(data.customAchievements);
        }
    } catch (error) {
        console.error('Error loading custom achievements:', error);
    }
}

// Render custom achievements
function renderCustomAchievements(achievements) {
    const container = document.getElementById('achievementsList');
    container.innerHTML = '';

    if (achievements.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No tienes logros personalizados. ¡Crea el primero!</p>';
        return;
    }

    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `p-4 rounded-lg border-2 ${achievement.unlocked ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`;
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <span class="text-4xl">${achievement.icon}</span>
                    <div>
                        <h3 class="font-bold text-gray-800">${achievement.name}</h3>
                        <p class="text-sm text-gray-600">${achievement.description}</p>
                        <p class="text-xs text-purple-600 font-medium">+${achievement.points} puntos</p>
                        <p class="text-xs text-gray-500">${achievement.currentValue}/${achievement.targetValue} ${achievement.metric}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${achievement.unlocked 
                        ? '<span class="text-green-600 font-bold">✓ Desbloqueado</span>' 
                        : `<button onclick="unlockCustomAchievement('${achievement.id}')" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">Desbloquear</button>`}
                    <button onclick="deleteCustomAchievement('${achievement.id}')" class="text-red-500 hover:text-red-700 text-xl">×</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Create custom achievement
async function handleCreateCustomAchievement(e) {
    e.preventDefault();
    
    const name = document.getElementById('customAchievementName').value;
    const description = document.getElementById('customAchievementDescription').value;
    const icon = document.getElementById('customAchievementIcon').value || '🏆';
    const points = parseInt(document.getElementById('customAchievementPoints').value);
    const targetValue = parseInt(document.getElementById('customAchievementTarget').value);
    const metric = document.getElementById('customAchievementMetric').value;

    try {
        const response = await fetch(`${API_URL}/achievements/custom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, icon, points, targetValue, metric })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Logro personalizado creado', 'success');
            document.getElementById('customAchievementForm').reset();
            loadCustomAchievements();
        } else {
            showAlert(data.message || 'Error al crear logro personalizado', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Unlock custom achievement
async function unlockCustomAchievement(achievementId) {
    try {
        const response = await fetch(`${API_URL}/achievements/custom/${achievementId}/unlock`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Logro desbloqueado', 'success');
            loadCustomAchievements();
            loadLevelProgress();
        } else {
            showAlert(data.message || 'Error al desbloquear logro', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Delete custom achievement
async function deleteCustomAchievement(achievementId) {
    if (!confirm('¿Estás seguro de eliminar este logro personalizado?')) return;

    try {
        const response = await fetch(`${API_URL}/achievements/custom/${achievementId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Logro eliminado', 'success');
            loadCustomAchievements();
        } else {
            showAlert('Error al eliminar logro', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

// Show custom achievement creator
function showCustomAchievementCreator() {
    document.getElementById('customAchievementCreator').classList.remove('hidden');
}

// Hide custom achievement creator
function hideCustomAchievementCreator() {
    document.getElementById('customAchievementCreator').classList.add('hidden');
    document.getElementById('customAchievementForm').reset();
}

// Hide achievements modal
function hideAchievementsModal() {
    const modal = document.getElementById('achievementsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Load achievements
async function loadAchievements() {
    try {
        const response = await fetch(`${API_URL}/achievements`);
        const data = await response.json();

        if (response.ok) {
            renderAchievements(data.achievements);
        }
    } catch (error) {
        console.error('Error loading achievements:', error);
    }
}

// Render achievements
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
                <div class="text-right">
                    ${achievement.unlocked 
                        ? '<span class="text-green-600 font-bold">✓ Desbloqueado</span>' 
                        : '<span class="text-gray-400">Pendiente</span>'}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Load level progress
async function loadLevelProgress() {
    try {
        const response = await fetch(`${API_URL}/achievements/level-progress`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('currentLevel').textContent = data.currentLevel;
            document.getElementById('currentPoints').textContent = data.currentPoints;
            document.getElementById('levelProgressBar').style.width = `${data.progress}%`;
            document.getElementById('levelProgressText').textContent = 
                `${data.pointsInCurrentLevel}/100 puntos para el nivel ${data.nextLevel}`;
        }
    } catch (error) {
        console.error('Error loading level progress:', error);
    }
}

// Calendar functionality
let currentCalendarDate = new Date();

// Load calendar data
async function loadCalendar() {
    try {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        const response = await fetch(`${API_URL}/stats/month/${year}/${month}`);
        const data = await response.json();

        if (response.ok) {
            renderCalendar(data.monthlyData, year, month);
            updateMonthYearDisplay(year, month);
        }
    } catch (error) {
        console.error('Error loading calendar:', error);
    }
}

// Render calendar
function renderCalendar(monthlyData, year, month) {
    const container = document.getElementById('calendarView');
    container.innerHTML = '';

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    // Calendar header
    const header = document.createElement('div');
    header.className = 'grid grid-cols-7 gap-2 mb-4';
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'text-center font-semibold text-gray-600';
        dayHeader.textContent = day;
        header.appendChild(dayHeader);
    });
    container.appendChild(header);

    // Calendar grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-2';

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'p-2';
        grid.appendChild(emptyCell);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = monthlyData[dateKey] || { total: 0, completed: 0, rate: 0 };
        
        const dayCell = document.createElement('div');
        dayCell.className = 'p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition';
        
        // Color based on completion rate
        let bgColor = 'bg-gray-100';
        if (dayData.total > 0) {
            if (dayData.rate === 100) bgColor = 'bg-green-100';
            else if (dayData.rate >= 50) bgColor = 'bg-yellow-100';
            else if (dayData.rate > 0) bgColor = 'bg-orange-100';
            else bgColor = 'bg-red-100';
        }
        
        dayCell.classList.add(bgColor);
        
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        if (isToday) {
            dayCell.classList.add('ring-2', 'ring-blue-500');
        }

        dayCell.innerHTML = `
            <div class="text-center">
                <span class="font-medium ${isToday ? 'text-blue-600' : 'text-gray-800'}">${day}</span>
                ${dayData.total > 0 ? `<div class="text-xs text-gray-600">${dayData.completed}/${dayData.total}</div>` : ''}
            </div>
        `;
        
        dayCell.addEventListener('click', () => showDayDetails(dateKey, dayData));
        grid.appendChild(dayCell);
    }

    container.appendChild(grid);
}

// Update month/year display
function updateMonthYearDisplay(year, month) {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;
}

// Show day details
function showDayDetails(dateKey, dayData) {
    const detailsSection = document.getElementById('dayDetails');
    const title = document.getElementById('selectedDateTitle');
    const habitsList = document.getElementById('dayHabitsList');

    const date = new Date(dateKey);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    title.textContent = date.toLocaleDateString('es-ES', options);

    habitsList.innerHTML = '';

    if (dayData.habits && dayData.habits.length > 0) {
        dayData.habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = `flex items-center space-x-3 p-2 rounded ${habit.completed ? 'bg-green-50' : 'bg-gray-50'}`;
            habitItem.innerHTML = `
                <span class="text-2xl">${habit.emoji}</span>
                <span class="flex-1">${habit.name}</span>
                <span class="${habit.completed ? 'text-green-600' : 'text-gray-400'}">
                    ${habit.completed ? '✓ Completado' : '○ Pendiente'}
                </span>
            `;
            habitsList.appendChild(habitItem);
        });
    } else {
        habitsList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay hábitos programados para este día</p>';
    }

    detailsSection.classList.remove('hidden');
}

// Navigate months
document.getElementById('prevMonthBtn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    loadCalendar();
});

document.getElementById('nextMonthBtn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    loadCalendar();
});

// Settings functionality
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/auth/me`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('profileName').value = data.user.name;
            document.getElementById('profileEmail').value = data.user.email;
            document.getElementById('themeSelect').value = data.user.theme || 'light';
            document.getElementById('notificationsToggle').checked = data.user.notificationsEnabled !== false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
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
            showAlert('Perfil actualizado exitosamente', 'success');
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
    const notificationsEnabled = document.getElementById('notificationsToggle').checked;

    try {
        const response = await fetch(`${API_URL}/auth/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, notificationsEnabled })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Preferencias guardadas', 'success');
            applyTheme(theme);
        } else {
            showAlert(data.message || 'Error al guardar preferencias', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

async function handleDeleteAccount() {
    const password = prompt('Para eliminar tu cuenta, por favor ingresa tu contraseña:');
    
    if (!password) return;

    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/account`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Cuenta eliminada exitosamente', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showAlert(data.message || 'Error al eliminar cuenta', 'error');
        }
    } catch (error) {
        showAlert('Error de conexión', 'error');
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('bg-gray-900');
        document.body.classList.remove('bg-gray-50');
    } else {
        document.body.classList.remove('bg-gray-900');
        document.body.classList.add('bg-gray-50');
    }
}

// Emoji picker functionality
const commonEmojis = [
    // Checkmarks & Success
    '✓', '✅', '❌', '⭕', '🔘', '🔳', '🔲',
    
    // Stars & Awards
    '⭐', '🌟', '💫', '✨', '🌙', '☀️', '🌞', '🔥', '💪', '🎯', '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅',
    
    // Learning & Mind
    '📚', '💡', '🧠', '🎓', '📖', '�', '✏️', '📐', '📏', '🎨', '�', '🎪', '🎬', '🎤', '🎧',
    
    // Health & Wellness
    '🏃', '🚶', '🧘', '🧗', '🏊', '🚴', '⛹️', '�', '🤾', '🏋️', '🧖', '�🧘', '🍎', '🥗', '🥑', '🥦', '🥕',
    '💧', '🥤', '🥛', '☕', '🍵', '🥣', '🍲', '🥘', '🍝', '🍜', '🍲', '🥗', '🍱', '🥪', '🌮', '�',
    
    // Nature & Weather
    '�🌅', '�', '🌆', '🌇', '🌉', '�🌙', '☀️', '🌧️', '❄️', '⚡', '�', '�🌸', '🌺', '🌻', '🌹', '🌷', '�',
    '🌲', '🌳', '�🍀', '🍁', '🍂', '🍃', '🌿', '☘️', '🍄', '🌵', '🌾', '🌾', '🌽', '🥕', '🥔', '🍠',
    
    // Activities & Hobbies
    '🎮', '🎯', '🎲', '🎳', '🏈', '�', '⚽', '🎾', '🏸', '🏒', '🥎', '🎱', '🏓', '🏸', '🏑', '🏏',
    '🥊', '🥋', '🥅', '⛳', '⛸️', '�', '🤿', '�', '🛷', '�', '�', '�', '🧗', '🧗', '🧗',
    
    // Time & Organization
    '⏰', '⏱️', '⏲️', '🕰', '🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '�', '🕗', '�', '�', '🕚',
    '�', '📆', '🗓️', '�', '�️', '📁', '�', '�️', '🗄️', '💾', '💿', '📀', '�️', '�️',
    
    // Technology
    '💻', '🖥️', '�️', '⌨️', '�️', '�️', '�', '💾', '💿', '📀', '📱', '📲', '☎️', '�', '�', '�',
    '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '�', '⌚', '�', '🧭',
    
    // Home & Daily Life
    '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒',
    '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🏰', '🏯', '🏟️', '🎪', '🎡',
    
    // Travel & Places
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🚲', '🚢', '🚁',
    '✈️', '🚀', '🛸', '🛶', '⛵', '🚤', '🛥', '🛳️', '⛴️', '🚢', '🗺️', '🗿', '🗽', '🗼', '�',
    
    // Animals
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
    
    // Food & Drink
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
    '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯',
    
    // Faces & People
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
    
    // Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎',
    
    // More activities
    '🎁', '🎈', '🎉', '🎊', '🎎', '🎒', '🎓', '🎖️', '🏅', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷',
    '🎺', '🎸', '🪕', '🎻', '🪘', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻',
    
    // Fitness & Sports
    '🤸', '🤼', '🤽', '🤾', '🤹', '🥎', '🤺', '🥏', '🪃', '🥅', '🥊', '🥋', '🥌', '🛹', '🛼', '🛷',
    '⛸️', '🥌', '🎯', '🪀', '🎳', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '♠️', '♥️', '♦️', '♣️', '♟️',
    
    // Office & Work
    '📅', '📆', '🗓️', '📇', '🗃️', '🗄️', '🗑️', '📒', '📓', '📔', '📕', '📖', '📗', '📘', '📙', '📚',
    '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴', '💵', '💶', '💷', '💸',
    
    // Nature Extended
    '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🥜', '🌰',
    '🐀', '🐁', '🐂', '🐃', '🐄', '🐅', '🐆', '🐇', '🐈', '🐉', '🐊', '🐋', '🐌', '🐍', '🐎', '🐏',
    
    // Tools & Objects
    '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪓', '🪚', '🔩', '⚙️', '🪤', '🧰', '🪛', '🔫', '💣', '🧨', '🪓',
    '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '�', '🗿', '🗽', '🗼', '🗽', '�️', '�️',
    
    // Music & Arts
    '�', '�', '�️', '�️', '🎛️', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '🪘',
    '🎬', '🎨', '�', '🖼️', '�', '�️', '�️', '�', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎'
];

function showEmojiPicker() {
    const modal = document.getElementById('emojiPickerModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';
    
    commonEmojis.forEach(emoji => {
        const emojiBtn = document.createElement('button');
        emojiBtn.type = 'button';
        emojiBtn.className = 'text-2xl p-2 hover:bg-gray-100 rounded transition';
        emojiBtn.textContent = emoji;
        emojiBtn.addEventListener('click', () => selectEmoji(emoji));
        grid.appendChild(emojiBtn);
    });
}

function hideEmojiPicker() {
    const modal = document.getElementById('emojiPickerModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function selectEmoji(emoji) {
    document.getElementById('habitEmoji').value = emoji;
    hideEmojiPicker();
}