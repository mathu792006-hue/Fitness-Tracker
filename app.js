/* ============================================
   MAIN APPLICATION LOGIC
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {

    // DOM Elements
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const addActivityBtn = document.getElementById('addActivityBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const activityForm = document.getElementById('activityForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtnText = document.getElementById('submitBtnText');
    const activityIdInput = document.getElementById('activityId');
    
    // Delete Modal Elements
    const deleteModalOverlay = document.getElementById('deleteModalOverlay');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Dashboard Elements
    const totalStepsEl = document.getElementById('totalSteps');
    const totalCaloriesEl = document.getElementById('totalCalories');
    const totalDurationEl = document.getElementById('totalDuration');
    const totalActivitiesEl = document.getElementById('totalActivities');
    
    // Progress Bars
    const stepsProgress = document.getElementById('stepsProgress');
    const caloriesProgress = document.getElementById('caloriesProgress');
    const durationProgress = document.getElementById('durationProgress');
    const activitiesProgress = document.getElementById('activitiesProgress');
    
    // Table & Filter
    const activitiesTableBody = document.getElementById('activitiesTableBody');
    const emptyState = document.getElementById('emptyState');
    const activityFilter = document.getElementById('activityFilter');
    
    // Toast
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Navigation
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Date Input
    const activityDateInput = document.getElementById('activityDate');
    
    let deleteTargetId = null;

    // Initialize App
    function init() {
        setDefaultDate();
        displayCurrentDate();
        displayGreeting();
        updateDashboard();
        renderActivities('week');
        ChartManager.init();
        setupEventListeners();
    }

    // Set today's date as default
    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        if (activityDateInput) {
            activityDateInput.value = today;
        }
    }
    
    // Display current date in header
    function displayCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        const currentDateEl = document.getElementById('currentDate');
        if (currentDateEl) {
            currentDateEl.textContent = dateString;
        }
    }
    
    // Display greeting based on time
    function displayGreeting() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning! ☀️';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon! 🌤️';
        } else if (hour >= 17 && hour < 21) {
            greeting = 'Good Evening! 🌅';
        } else {
            greeting = 'Good Night! 🌙';
        }
        
        const headerText = document.querySelector('.header-text h1');
        if (headerText) {
            headerText.textContent = greeting;
        }
    }

    // Update Dashboard Summary Cards
    function updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const summary = StorageManager.getDailySummary(today);
        const goals = StorageManager.getGoals();
        
        totalStepsEl.textContent = summary.totalSteps.toLocaleString();
        totalCaloriesEl.textContent = summary.totalCalories.toLocaleString();
        totalDurationEl.innerHTML = summary.totalDuration + ' <small>min</small>';
        totalActivitiesEl.textContent = summary.totalActivities;
        
        updateProgressBar(stepsProgress, summary.totalSteps, goals.steps);
        updateProgressBar(caloriesProgress, summary.totalCalories, goals.calories);
        updateProgressBar(durationProgress, summary.totalDuration, goals.duration);
        updateProgressBar(activitiesProgress, summary.totalActivities, goals.activities);
    }
    
    function updateProgressBar(element, current, goal) {
        if (!element) return;
        let percentage = Math.min((current / goal) * 100, 100);
        percentage = Math.round(percentage);
        element.style.width = percentage + '%';
    }

    // Render Activities Table
    function renderActivities(filter) {
        let activities;
        
        switch (filter) {
            case 'today':
                activities = StorageManager.getTodayActivities();
                break;
            case 'week':
                activities = StorageManager.getWeekActivities();
                break;
            case 'month':
                activities = StorageManager.getMonthActivities();
                break;
            case 'all':
                activities = StorageManager.getAllActivities();
                break;
            default:
                activities = StorageManager.getWeekActivities();
        }
        
        activitiesTableBody.innerHTML = '';
        
        if (activities.length === 0) {
            emptyState.style.display = 'block';
            document.querySelector('.table-wrapper').style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            document.querySelector('.table-wrapper').style.display = 'block';
            
            activities.forEach(activity => {
                const row = createActivityRow(activity);
                activitiesTableBody.appendChild(row);
            });
        }
    }
    
    function createActivityRow(activity) {
        const tr = document.createElement('tr');
        
        const dateObj = new Date(activity.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const emoji = getActivityEmoji(activity.type);
        
        tr.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="activity-badge">${emoji} ${activity.type}</span></td>
            <td>${parseInt(activity.steps || 0).toLocaleString()}</td>
            <td>${activity.duration} min</td>
            <td>${parseInt(activity.calories || 0).toLocaleString()} cal</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-id="${activity.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-delete" data-id="${activity.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tr.querySelector('.btn-edit').addEventListener('click', () => editActivity(activity.id));
        tr.querySelector('.btn-delete').addEventListener('click', () => showDeleteConfirmation(activity.id));
        
        return tr;
    }
    
    function getActivityEmoji(type) {
        const emojis = {
            'Running': '🏃',
            'Walking': '🚶',
            'Cycling': '🚴',
            'Swimming': '🏊',
            'Yoga': '🧘',
            'Weight Training': '🏋️',
            'HIIT': '⚡',
            'Dancing': '💃',
            'Sports': '⚽',
            'Other': '📋'
        };
        return emojis[type] || '🏃';
    }

    // Modal Control Functions
    function openAddModal() {
        activityForm.reset();
        setDefaultDate();
        activityIdInput.value = '';
        modalTitle.textContent = 'Add New Activity';
        submitBtnText.textContent = 'Save Activity';
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function editActivity(id) {
        const activity = StorageManager.getActivityById(id);
        if (!activity) {
            showToast('Activity not found!', 'error');
            return;
        }
        
        document.getElementById('activityType').value = activity.type;
        document.getElementById('steps').value = activity.steps || '';
        document.getElementById('duration').value = activity.duration;
        document.getElementById('calories').value = activity.calories;
        document.getElementById('activityDate').value = activity.date;
        document.getElementById('notes').value = activity.notes || '';
        
        activityIdInput.value = id;
        modalTitle.textContent = 'Edit Activity';
        submitBtnText.textContent = 'Update Activity';
        
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        activityForm.reset();
    }

    // Form Submission Handler
    function handleFormSubmit(event) {
        event.preventDefault();
        
        const activityData = {
            type: document.getElementById('activityType').value,
            steps: document.getElementById('steps').value || '0',
            duration: document.getElementById('duration').value,
            calories: document.getElementById('calories').value,
            date: document.getElementById('activityDate').value,
            notes: document.getElementById('notes').value
        };
        
        const editId = activityIdInput.value;
        
        if (editId) {
            StorageManager.updateActivity(editId, activityData);
            showToast('Activity updated successfully! ✏️');
        } else {
            StorageManager.addActivity(activityData);
            showToast('Activity added successfully! 🎉');
        }
        
        closeModal();
        refreshAll();
    }

    // Delete Operations
    function showDeleteConfirmation(id) {
        deleteTargetId = id;
        deleteModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeDeleteModal() {
        deleteModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        deleteTargetId = null;
    }
    
    function confirmDelete() {
        if (deleteTargetId) {
            StorageManager.deleteActivity(deleteTargetId);
            showToast('Activity deleted! 🗑️');
            closeDeleteModal();
            refreshAll();
        }
    }

    // Toast Notification
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.style.backgroundColor = type === 'error' ? '#EF4444' : '#10B981';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Refresh UI Components
    function refreshAll() {
        updateDashboard();
        renderActivities(activityFilter.value);
        ChartManager.updateCharts();
    }

    // Event Listeners
    function setupEventListeners() {
        addActivityBtn.addEventListener('click', openAddModal);
        modalClose.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) closeModal();
        });
        
        activityForm.addEventListener('submit', handleFormSubmit);
        
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        confirmDeleteBtn.addEventListener('click', confirmDelete);
        deleteModalOverlay.addEventListener('click', (event) => {
            if (event.target === deleteModalOverlay) closeDeleteModal();
        });
        
        activityFilter.addEventListener('change', function() {
            renderActivities(this.value);
        });
        
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
                closeDeleteModal();
            }
        });
    }

    // Run App Initialization
    init();
});