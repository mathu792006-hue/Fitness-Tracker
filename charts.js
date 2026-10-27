/* ============================================
   CHARTS MODULE (Chart.js Integration)
   ============================================ */

const ChartManager = {

    weeklyChart: null,
    activityChart: null,

    // Initialize charts
    init: function() {
        this.createWeeklyChart();
        this.createActivityChart();
    },

    // Create Weekly Activity Bar Chart
    createWeeklyChart: function() {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const weeklyData = StorageManager.getWeeklySummary();
        
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
        }
        
        this.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weeklyData.map(day => day.day),
                datasets: [
                    {
                        label: 'Calories Burned',
                        data: weeklyData.map(day => day.totalCalories),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: '#EF4444',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false
                    },
                    {
                        label: 'Workout Minutes',
                        data: weeklyData.map(day => day.totalDuration),
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: '#6366F1',
                        borderWidth: 2,
                        borderRadius: 6,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { family: 'Poppins', size: 12 },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        titleFont: { family: 'Poppins' },
                        bodyFont: { family: 'Poppins' },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { family: 'Poppins', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Poppins', size: 11 } }
                    }
                }
            }
        });
    },

    // Create Activity Type Doughnut Chart
    createActivityChart: function() {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const breakdown = StorageManager.getActivityBreakdown();
        const labels = Object.keys(breakdown);
        const values = Object.values(breakdown);
        
        const backgroundColors = [
            'rgba(99, 102, 241, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(244, 63, 94, 0.8)'
        ];
        
        if (this.activityChart) {
            this.activityChart.destroy();
        }
        
        this.activityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['No Data'],
                datasets: [{
                    data: values.length > 0 ? values : [1],
                    backgroundColor: values.length > 0 
                        ? backgroundColors.slice(0, labels.length) 
                        : ['rgba(203, 213, 225, 0.5)'],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Poppins', size: 12 },
                            usePointStyle: true,
                            padding: 16
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        titleFont: { family: 'Poppins' },
                        bodyFont: { family: 'Poppins' },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.parsed;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return ` ${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    },

    // Update charts when data changes
    updateCharts: function() {
        this.createWeeklyChart();
        this.createActivityChart();
    }
};