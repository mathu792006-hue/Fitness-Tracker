/* ============================================
   STORAGE MODULE (localStorage Management)
   ============================================ */

const StorageManager = {

    STORAGE_KEY: 'fittrack_activities',
    GOALS_KEY: 'fittrack_goals',

    // Get all activities from localStorage
    getAllActivities: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },

    // Save all activities array to localStorage
    saveAllActivities: function(activities) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(activities));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    // Add a new activity
    addActivity: function(activity) {
        const activities = this.getAllActivities();
        
        // Generate unique ID
        activity.id = 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        activity.createdAt = new Date().toISOString();
        
        // Add to beginning of array (newest first)
        activities.unshift(activity);
        
        this.saveAllActivities(activities);
        return activity;
    },

    // Update an existing activity by ID
    updateActivity: function(id, updatedData) {
        const activities = this.getAllActivities();
        const index = activities.findIndex(activity => activity.id === id);
        
        if (index !== -1) {
            activities[index] = {
                ...activities[index],
                ...updatedData,
                id: activities[index].id,
                createdAt: activities[index].createdAt
            };
            
            this.saveAllActivities(activities);
            return activities[index];
        }
        
        return null;
    },

    // Delete an activity by ID
    deleteActivity: function(id) {
        const activities = this.getAllActivities();
        const filtered = activities.filter(activity => activity.id !== id);
        
        if (filtered.length < activities.length) {
            this.saveAllActivities(filtered);
            return true;
        }
        
        return false;
    },

    // Get a single activity by ID
    getActivityById: function(id) {
        const activities = this.getAllActivities();
        return activities.find(activity => activity.id === id);
    },

    // Get today's activities
    getTodayActivities: function() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.getAllActivities();
        return activities.filter(activity => activity.date === today);
    },

    // Get this week's activities (from Monday)
    getWeekActivities: function() {
        const now = new Date();
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const activities = this.getAllActivities();
        return activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= startOfWeek && activityDate <= now;
        });
    },

    // Get this month's activities
    getMonthActivities: function() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const activities = this.getAllActivities();
        return activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= startOfMonth && activityDate <= now;
        });
    },

    // Get summary totals for a specific date
    getDailySummary: function(date) {
        const activities = this.getAllActivities().filter(
            activity => activity.date === date
        );
        
        return {
            totalSteps: activities.reduce((sum, act) => sum + (parseInt(act.steps) || 0), 0),
            totalCalories: activities.reduce((sum, act) => sum + (parseInt(act.calories) || 0), 0),
            totalDuration: activities.reduce((sum, act) => sum + (parseInt(act.duration) || 0), 0),
            totalActivities: activities.length,
            activities: activities
        };
    },

    // Get weekly summary for charts (7 days)
    getWeeklySummary: function() {
        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const now = new Date();
        const summary = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            const dayOfWeek = now.getDay();
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            date.setDate(now.getDate() - daysFromMonday + i);
            
            const dateString = date.toISOString().split('T')[0];
            const dayData = this.getDailySummary(dateString);
            
            summary.push({
                day: weekDays[i],
                date: dateString,
                ...dayData
            });
        }
        
        return summary;
    },

    // Get activity type breakdown for pie chart
    getActivityBreakdown: function() {
        const activities = this.getWeekActivities();
        const breakdown = {};
        
        activities.forEach(activity => {
            const type = activity.type;
            if (breakdown[type]) {
                breakdown[type]++;
            } else {
                breakdown[type] = 1;
            }
        });
        
        return breakdown;
    },

    // Save user goals
    saveGoals: function(goals) {
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    },

    // Get user goals
    getGoals: function() {
        const data = localStorage.getItem(this.GOALS_KEY);
        return data ? JSON.parse(data) : {
            steps: 10000,
            calories: 500,
            duration: 60,
            activities: 5
        };
    }
};