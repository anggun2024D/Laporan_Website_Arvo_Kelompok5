// script.js - Main application logic for Arvo

// Initialize database
const db = new Database();

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const mainContent = document.getElementById('mainContent');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// Variables untuk notifikasi dan kalender
let notificationCheckInterval;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Check if user is logged in
    if (db.currentUser) {
        showMainApp();
        loadDashboardData();
    } else {
        showLoginModal();
    }

    setupEventListeners();
}

function setupEventListeners() {
    // Login/Register forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    showRegister.addEventListener('click', showRegisterForm);
    showLogin.addEventListener('click', showLoginForm);
    logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.target.getAttribute('data-page');
            showPage(pageName);
            setActiveNavLink(e.target);
        });
    });

    // Schedule form
    document.getElementById('scheduleForm').addEventListener('submit', handleAddSchedule);
    
    // Notes form
    document.getElementById('notesForm').addEventListener('submit', handleAddNote);
    
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);
    
    // Password form
    document.getElementById('passwordForm').addEventListener('submit', handleChangePassword);
    
    // Schedule filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            filterSchedules(filter);
            setActiveFilter(e.target);
        });
    });
    
    // Note search
    document.getElementById('noteSearch').addEventListener('input', searchNotes);
    
    // Quick action buttons
    document.querySelectorAll('[data-page]').forEach(btn => {
        if (btn.tagName === 'BUTTON') {
            btn.addEventListener('click', (e) => {
                const pageName = e.target.getAttribute('data-page');
                showPage(pageName);
                setActiveNavLink(document.querySelector(`[data-page="${pageName}"]`));
            });
        }
    });

    // Export data button
    document.getElementById('exportData').addEventListener('click', handleExportData);
    
    // Delete account button
    document.getElementById('deleteAccount').addEventListener('click', handleDeleteAccount);
}

// Calender navigation
 document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-all-calendar')) {
            e.preventDefault();
            showFullCalendar();
        }
        
        if (e.target.id === 'prevMonth') {
            navigateMonth(-1);
        }
        
        if (e.target.id === 'nextMonth') {
            navigateMonth(1);
        }
        
        if (e.target.classList.contains('calendar-day')) {
            const date = e.target.getAttribute('data-date');
            selectCalendarDate(date);
        }
    });


// ===== SISTEM NOTIFIKASI JADWAL =====
function startNotificationChecker() {
    // Cek notifikasi setiap 1 menit
    notificationCheckInterval = setInterval(() => {
        checkUpcomingSchedules();
    }, 60000);
    
    // Cek langsung saat app dimulai
    checkUpcomingSchedules();
}

function checkUpcomingSchedules() {
    if (!db.currentUser) return;
    
    const now = new Date();
    const userId = db.currentUser.id;
    const schedules = db.getUserSchedules(userId);
    
    schedules.forEach(schedule => {
        if (!schedule.notified) {
            const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
            const timeDiff = scheduleDateTime - now;
            const minutesDiff = timeDiff / (1000 * 60);
            
            // Notifikasi 15 menit sebelum jadwal
            if (minutesDiff <= 15 && minutesDiff > 0) {
                showScheduleNotification(schedule);
                // Tandai sudah dinotifikasi
                schedule.notified = true;
                db.updateSchedule(schedule.id, { notified: true });
            }
            
            // Notifikasi untuk jadwal yang sudah lewat (hanya sekali)
            if (minutesDiff < 0 && !schedule.notified) {
                showMissedScheduleNotification(schedule);
                schedule.notified = true;
                db.updateSchedule(schedule.id, { notified: true });
            }
        }
    });
}

function showScheduleNotification(schedule) {
    const notificationMessage = `⏰ Jadwal "${schedule.title}" dimulai dalam 15 menit (${formatTime(schedule.time)})`;
    
    // Notification di browser
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Arvo - Pengingat Jadwal", {
            body: notificationMessage,
            icon: "/favicon.ico"
        });
    }
    
    // Notification dalam app
    showNotification(notificationMessage, 'info');
    
    // Sound notification (optional)
    playNotificationSound();
}

function showMissedScheduleNotification(schedule) {
    const notificationMessage = `⚠️ Jadwal "${schedule.title}" telah terlewat (${formatTime(schedule.time)})`;
    showNotification(notificationMessage, 'warning');
}

function playNotificationSound() {
    // Simple beep sound
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
}

// Minta izin notifikasi browser
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted");
            }
        });
    }
}

// ===== SISTEM KALENDER LENGKAP =====
function showFullCalendar() {
    // Sembunyikan semua page
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan calendar page
    document.getElementById('calendar').classList.add('active');
    
    // Set nav link active
    setActiveNavLink(document.querySelector('[data-page="calendar"]'));
    
    // Load kalender
    loadFullCalendar();
}

function loadFullCalendar() {
    const calendarElement = document.getElementById('fullCalendar');
    if (!calendarElement) return;
    
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const today = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    // Update calendar header
    document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    let html = '';
    
    // Hari dalam seminggu
    html += `<div class="calendar-weekdays">`;
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    dayNames.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    html += `</div>`;
    
    // Tanggal-tanggal
    html += `<div class="calendar-days">`;
    
    // Blank days di awal
    for (let i = 0; i < startingDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }
    
    // Hari-hari dalam bulan
    for (let day = 1; day <= monthLength; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && 
                       today.getMonth() === currentMonth && 
                       today.getFullYear() === currentYear;
        
        // Cek apakah ada jadwal di tanggal ini
        const hasSchedule = checkDateHasSchedule(dateStr);
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasSchedule ? 'has-schedule' : ''}" 
                 data-date="${dateStr}">
                <span class="day-number">${day}</span>
                ${hasSchedule ? '<span class="schedule-dot"></span>' : ''}
            </div>
        `;
    }
    
    html += `</div>`;
    
    calendarElement.innerHTML = html;
    
    // Load jadwal untuk tanggal yang dipilih
    loadSelectedDateSchedules();
}

function navigateMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    loadFullCalendar();
}

function checkDateHasSchedule(dateStr) {
    if (!db.currentUser) return false;
    
    const schedules = db.getUserSchedules(db.currentUser.id);
    return schedules.some(schedule => schedule.date === dateStr);
}

function selectCalendarDate(dateStr) {
    // Hapus seleksi sebelumnya
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Tambah seleksi ke tanggal yang dipilih
    const selectedDay = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    // Simpan tanggal yang dipilih dan load jadwal
    localStorage.setItem('selectedCalendarDate', dateStr);
    loadSelectedDateSchedules(dateStr);
}

function loadSelectedDateSchedules(dateStr = null) {
    if (!db.currentUser) return;
    
    const selectedDate = dateStr || localStorage.getItem('selectedCalendarDate') || new Date().toISOString().split('T')[0];
    const schedules = db.getUserSchedules(db.currentUser.id)
        .filter(schedule => schedule.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));
    
    const scheduleListElement = document.getElementById('selectedDateSchedules');
    
    if (!scheduleListElement) return;
    
    if (schedules.length === 0) {
        scheduleListElement.innerHTML = `
            <div class="no-activities">
                <i class="fas fa-calendar-plus"></i>
                <p>Tidak ada jadwal untuk tanggal ini</p>
            </div>
        `;
    } else {
        scheduleListElement.innerHTML = schedules.map(schedule => `
            <div class="schedule-item" data-type="${schedule.type}">
                <div class="schedule-header">
                    <h4>${schedule.title}</h4>
                    <span class="schedule-date">${formatTime(schedule.time)}</span>
                </div>
                <div class="schedule-type">${getTypeLabel(schedule.type)}</div>
                ${schedule.description ? `<p class="schedule-description">${schedule.description}</p>` : ''}
            </div>
        `).join('');
    }
    
    // Update selected date display
    const selectedDateElement = document.getElementById('selectedDate');
    if (selectedDateElement) {
        selectedDateElement.textContent = formatDate(new Date(selectedDate));
    }
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validasi input
    if (!username || !password) {
        showNotification('Harap isi semua field!', 'error');
        return;
    }

    const user = db.getUser(username);
    if (user && user.password === password) {
        db.setCurrentUser(user);
        showMainApp();
        loadDashboardData();
        showNotification('Login berhasil!', 'success');
    } else {
        showNotification('Username atau password salah!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validasi input
    if (!username || !email || !password || !confirmPassword) {
        showNotification('Harap isi semua field!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Password tidak cocok!', 'error');
        return;
    }

    if (db.getUser(username)) {
        showNotification('Username sudah digunakan!', 'error');
        return;
    }

    const newUser = {
        id: generateId(),
        username,
        email,
        password,
        name: username,
        institution: '',
        major: '',
        bio: '',
        role: 'Mahasiswa',
        createdAt: new Date().toISOString()
    };

    db.addUser(newUser);
    db.setCurrentUser(newUser);
    showMainApp();
    loadDashboardData();
    showNotification('Registrasi berhasil!', 'success');

    // Reset form
    registerForm.reset();
}

function handleLogout() {
    db.clearCurrentUser();
    showLoginModal();
    showNotification('Anda telah logout', 'info');
}

// UI Functions
function showLoginModal() {
    loginModal.style.display = 'flex';
    mainContent.classList.add('hidden');

    showLoginForm({preventDefault: () => {}});
}

function showMainApp() {
    loginModal.style.display = 'none';
    mainContent.classList.remove('hidden');
}

function showLoginForm(e) {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');

    // Reset forms
    loginForm.reset();
    registerForm.reset();
}

function showRegisterForm(e) {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');

    // Reset forms
    loginForm.reset();
    registerForm.reset();
}

function showPage(pageName) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
    
    // Load page-specific data
    if (pageName === 'dashboard') {
        loadDashboardData();
    } else if (pageName === 'schedule') {
        loadSchedules();
    } else if (pageName === 'notes') {
        loadNotes();
    } else if (pageName === 'profile') {
        loadProfile();
    } else if (pageName === 'calendar') {
        loadFullCalendar();
    }
}

function setActiveNavLink(activeLink) {
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function setActiveFilter(activeFilter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeFilter.classList.add('active');
}

// Data Management Functions
function handleAddSchedule(e) {
    e.preventDefault();
    
    if (!db.currentUser) return;
    
    const formData = new FormData(e.target);
    const schedule = {
        id: generateId(),
        userId: db.currentUser.id,
        title: formData.get('scheduleTitle'),
        date: formData.get('scheduleDate'),
        time: formData.get('scheduleTime'),
        type: formData.get('scheduleType'),
        description: formData.get('scheduleDescription'),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    db.addSchedule(schedule);
    e.target.reset();
    loadSchedules();
    loadDashboardData();
    showNotification('Jadwal berhasil ditambahkan!', 'success');
}

function handleAddNote(e) {
    e.preventDefault();
    
    if (!db.currentUser) return;
    
    const formData = new FormData(e.target);
    const note = {
        id: generateId(),
        userId: db.currentUser.id,
        title: formData.get('noteTitle'),
        category: formData.get('noteCategory'),
        content: formData.get('noteContent'),
        createdAt: new Date().toISOString()
    };
    
    db.addNote(note);
    e.target.reset();
    loadNotes();
    loadDashboardData();
    showNotification('Notulensi berhasil disimpan!', 'success');
}

function handleUpdateProfile(e) {
    e.preventDefault();
    
    if (!db.currentUser) return;
    
    const formData = new FormData(e.target);
    const updatedUser = {
        ...db.currentUser,
        name: formData.get('profileName'),
        email: formData.get('profileEmail'),
        institution: formData.get('profileInstitution'),
        major: formData.get('profileMajor'),
        bio: formData.get('profileBio')
    };
    
    db.updateUserProfile(updatedUser);
    loadDashboardData();
    showNotification('Profil berhasil diperbarui!', 'success');
}

function handleChangePassword(e) {
    e.preventDefault();
    
    if (!db.currentUser) return;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (currentPassword !== db.currentUser.password) {
        showNotification('Password saat ini salah!', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Password baru tidak cocok!', 'error');
        return;
    }
    
    const updatedUser = {
        ...db.currentUser,
        password: newPassword
    };
    
    db.updateUserProfile(updatedUser);
    e.target.reset();
    showNotification('Password berhasil diubah!', 'success');
}

function handleExportData() {
    if (!db.currentUser) return;
    
    const userData = db.exportUserData(db.currentUser.id);
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arvo-data-${db.currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data berhasil diekspor!', 'success');
}

function handleDeleteAccount() {
    if (!db.currentUser) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan!')) {
        db.deleteUserAccount(db.currentUser.id);
        showLoginModal();
        showNotification('Akun berhasil dihapus', 'info');
    }
}

// Data Loading Functions
function loadDashboardData() {
    if (!db.currentUser) return;
    
    const userId = db.currentUser.id;
    
    // Update user info
    document.getElementById('userName').textContent = db.currentUser.name;
    document.getElementById('displayName').textContent = db.currentUser.name;
    document.getElementById('userGreeting').textContent = `Welcome, ${db.currentUser.name}!`;
    document.getElementById('userRole').textContent = db.currentUser.role;
    
    // Load stats
    const schedules = db.getUserSchedules(userId);
    const notes = db.getUserNotes(userId);
    
    document.getElementById('totalSchedules').textContent = schedules.length;
    document.getElementById('totalNotes').textContent = notes.length;
    document.getElementById('completedTasks').textContent = schedules.filter(s => s.completed).length;
    document.getElementById('activeDays').textContent = calculateActiveDays(schedules);
    
    // Load today's activities
    loadTodayActivities(userId);
    
    // Update progress
    updateProgress(schedules, notes);
    
    // Set today's date
    const today = new Date();
    document.getElementById('todayDate').textContent = formatDate(today);
    
    // Load mini calendar
    loadMiniCalendar();
    
    // Set daily quote
    setDailyQuote();
}

function loadSchedules() {
    if (!db.currentUser) return;
    
    const schedules = db.getUserSchedules(db.currentUser.id);
    const scheduleList = document.getElementById('scheduleList');
    
    if (schedules.length === 0) {
        scheduleList.innerHTML = `
            <div class="no-activities">
                <i class="fas fa-calendar-plus"></i>
                <p>Belum ada jadwal</p>
                <p class="text-muted">Tambahkan jadwal pertama Anda!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date and time
    schedules.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });
    
    scheduleList.innerHTML = schedules.map(schedule => `
        <div class="schedule-item" data-type="${schedule.type}">
            <div class="schedule-header">
                <h4>${schedule.title}</h4>
                <span class="schedule-date">${formatDate(new Date(schedule.date))} • ${formatTime(schedule.time)}</span>
            </div>
            <div class="schedule-type">${getTypeLabel(schedule.type)}</div>
            ${schedule.description ? `<p class="schedule-description">${schedule.description}</p>` : ''}
            <div class="schedule-actions">
                <button class="btn-outline btn-small" onclick="deleteSchedule('${schedule.id}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

function loadNotes() {
    if (!db.currentUser) return;
    
    const notes = db.getUserNotes(db.currentUser.id);
    const notesList = document.getElementById('notesList');
    const noteCount = document.getElementById('noteCount');
    
    noteCount.textContent = `${notes.length} notulensi ditemukan`;
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="no-activities">
                <i class="fas fa-sticky-note"></i>
                <p>Belum ada notulensi</p>
                <p class="text-muted">Buat notulensi pertama Anda!</p>
            </div>
        `;
        return;
    }
    
    // Sort by creation date (newest first)
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-item" data-category="${note.category}">
            <div class="note-header">
                <h4>${note.title}</h4>
                <span class="note-category">${getCategoryLabel(note.category)}</span>
            </div>
            <div class="note-date">${formatDateTime(new Date(note.createdAt))}</div>
            <div class="note-content">${note.content}</div>
            <div class="note-actions">
                <button class="btn-outline btn-small" onclick="deleteNote('${note.id}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

function loadProfile() {
    if (!db.currentUser) return;
    
    const user = db.currentUser;
    
    document.getElementById('profileName').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profileInstitution').value = user.institution || '';
    document.getElementById('profileMajor').value = user.major || '';
    document.getElementById('profileBio').value = user.bio || '';
}

function loadTodayActivities(userId) {
    const todaySchedules = db.getTodaySchedules(userId).sort((a, b) => a.time.localeCompare(b.time));
    
    const activitiesList = document.getElementById('todayActivities');
    
    if (todaySchedules.length === 0) {
        activitiesList.innerHTML = `
            <div class="no-activities">
                <i class="fas fa-calendar-check"></i>
                <p>Tidak ada kegiatan hari ini</p>
            </div>
        `;
        return;
    }
    
    activitiesList.innerHTML = todaySchedules.map(schedule => `
        <div class="activity-item" data-type="${schedule.type}">
            <div class="activity-time">${formatTime(schedule.time)}</div>
            <div class="activity-details">
                <div class="activity-title">${schedule.title}</div>
                <div class="activity-type">${getTypeLabel(schedule.type)}</div>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function updateProgress(schedules, notes) {
    const totalSchedules = schedules.length;
    const completedSchedules = schedules.filter(s => s.completed).length;
    const progress = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0;
    
    document.getElementById('overallProgress').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${progress}% Progress Keseluruhan`;
    document.getElementById('completedSchedules').textContent = `${completedSchedules}/${totalSchedules}`;
    document.getElementById('activeNotes').textContent = notes.length;
    document.getElementById('activeDaysCount').textContent = calculateActiveDays(schedules);
}

function calculateActiveDays(schedules) {
    const uniqueDays = new Set(schedules.map(s => s.date));
    return uniqueDays.size;
}

function filterSchedules(filter) {
    const scheduleItems = document.querySelectorAll('.schedule-item');
    
    scheduleItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-type') === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchNotes() {
    const searchTerm = document.getElementById('noteSearch').value.toLowerCase();
    const noteItems = document.querySelectorAll('.note-item');
    let visibleCount = 0;
    
    noteItems.forEach(item => {
        const title = item.querySelector('h4').textContent.toLowerCase();
        const content = item.querySelector('.note-content').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    document.getElementById('noteCount').textContent = `${visibleCount} notulensi ditemukan`;
}

function loadMiniCalendar() {
    const today = new Date();
    const weekDays = document.getElementById('weekCalendar');
    
    let html = '';
    for (let i = -3; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const isToday = i === 0;
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
        const dayDate = date.getDate();
        
        html += `
            <div class="week-day ${isToday ? 'today' : ''}">
                <span class="day-name">${dayName}</span>
                <span class="day-date">${dayDate}</span>
            </div>
        `;
    }
    
    weekDays.innerHTML = html;
}

function setDailyQuote() {
    const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('dailyQuote').textContent = `"${randomQuote.text}"`;
    document.querySelector('.quote-author').textContent = `- ${randomQuote.author}`;
}

function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Global functions for delete operations
window.deleteSchedule = function(scheduleId) {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
        db.deleteSchedule(scheduleId);
        loadSchedules();
        loadDashboardData();
        showNotification('Jadwal berhasil dihapus', 'success');
    }
};

window.deleteNote = function(noteId) {
    if (confirm('Apakah Anda yakin ingin menghapus notulensi ini?')) {
        db.deleteNote(noteId);
        loadNotes();
        loadDashboardData();
        showNotification('Notulensi berhasil dihapus', 'success');
    }
};