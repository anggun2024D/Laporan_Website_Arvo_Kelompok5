// database.js - Database simulation for Arvo

class Database {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('arvo_users')) || [];
        this.schedules = JSON.parse(localStorage.getItem('arvo_schedules')) || [];
        this.notes = JSON.parse(localStorage.getItem('arvo_notes')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('arvo_currentUser')) || null;
        
        // Initialize with demo data if empty
        this.initializeDemoData();
    }

    initializeDemoData() {
        if (this.users.length === 0) {
            const demoUser = {
                id: 'demo-user-001',
                username: 'demo',
                email: 'demo@arvo.com',
                password: 'demo123',
                name: 'Demo User',
                institution: 'Universitas Arvo',
                major: 'Teknik Informatika',
                bio: 'Pengguna demo Arvo - Your Journey to Growth',
                role: 'Mahasiswa',
                createdAt: new Date().toISOString()
            };
            this.users.push(demoUser);
            this.saveUsers();
        }
    }

    // User methods
    addUser(user) {
        this.users.push(user);
        this.saveUsers();
    }

    getUser(username) {
        return this.users.find(user => user.username === username);
    }

    getUserById(userId) {
        return this.users.find(user => user.id === userId);
    }

    saveUsers() {
        localStorage.setItem('arvo_users', JSON.stringify(this.users));
    }

    // Schedule methods
    
    addSchedule(schedule) {
        this.schedules.push(schedule);
        this.saveSchedules();
    }

    getUserSchedules(userId) {
        return this.schedules.filter(schedule => schedule.userId === userId);
    }

    getTodaySchedules(userId) {
        const today = new Date().toISOString().split('T')[0];
        return this.getUserSchedules(userId).filter(schedule => schedule.date === today);
    }

    deleteSchedule(scheduleId) {
        this.schedules = this.schedules.filter(schedule => schedule.id !== scheduleId);
        this.saveSchedules();
    }

    updateSchedule(scheduleId, updates) {
        const index = this.schedules.findIndex(schedule => schedule.id === scheduleId);
        if (index !== -1) {
            this.schedules[index] = { ...this.schedules[index], ...updates };
            this.saveSchedules();
        }
    }

    saveSchedules() {
        localStorage.setItem('arvo_schedules', JSON.stringify(this.schedules));
    }

    // Notes methods
    addNote(note) {
        this.notes.push(note);
        this.saveNotes();
    }

    getUserNotes(userId) {
        return this.notes.filter(note => note.userId === userId);
    }

    deleteNote(noteId) {
        this.notes = this.notes.filter(note => note.id !== noteId);
        this.saveNotes();
    }

    updateNote(noteId, updates) {
        const index = this.notes.findIndex(note => note.id === noteId);
        if (index !== -1) {
            this.notes[index] = { ...this.notes[index], ...updates };
            this.saveNotes();
        }
    }

    saveNotes() {
        localStorage.setItem('arvo_notes', JSON.stringify(this.notes));
    }

    // Current user methods
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('arvo_currentUser', JSON.stringify(user));
    }

    clearCurrentUser() {
        this.currentUser = null;
        localStorage.removeItem('arvo_currentUser');
    }

    updateUserProfile(updatedUser) {
        const index = this.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            this.users[index] = updatedUser;
            this.saveUsers();
            if (this.currentUser && this.currentUser.id === updatedUser.id) {
                this.setCurrentUser(updatedUser);
            }
        }
    }

    // Utility methods
    exportUserData(userId) {
        const user = this.getUserById(userId);
        const userSchedules = this.getUserSchedules(userId);
        const userNotes = this.getUserNotes(userId);
        
        return {
            user,
            schedules: userSchedules,
            notes: userNotes,
            exportDate: new Date().toISOString()
        };
    }

    deleteUserAccount(userId) {
        // Remove user data
        this.users = this.users.filter(user => user.id !== userId);
        this.schedules = this.schedules.filter(schedule => schedule.userId !== userId);
        this.notes = this.notes.filter(note => note.userId !== userId);
        
        // Save changes
        this.saveUsers();
        this.saveSchedules();
        this.saveNotes();
        
        // Clear current user if it's the deleted user
        if (this.currentUser && this.currentUser.id === userId) {
            this.clearCurrentUser();
        }
    }
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    return time.substring(0, 5);
}

function formatDateTime(date) {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTypeLabel(type) {
    const labels = {
        kuliah: 'Kuliah',
        organisasi: 'Organisasi',
        tugas: 'Tugas',
        pribadi: 'Pribadi'
    };
    return labels[type] || type;
}

function getCategoryLabel(category) {
    const labels = {
        kuliah: 'Kuliah',
        organisasi: 'Organisasi',
        pribadi: 'Pribadi',
        lainnya: 'Lainnya'
    };
    return labels[category] || category;
}

