document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    const fileList = document.getElementById('file-list');
    const uploadButton = document.getElementById('upload-button');
    const uploadForm = document.getElementById('upload-form');
    const sampleDataButton = document.getElementById('sample-data');
    const dashboard = document.getElementById('dashboard');
    const loadingOverlay = document.getElementById('loading-overlay');
    const themeToggle = document.getElementById('theme-toggle');

    // Chart objects
    let charts = {};
    
    // Check for saved theme
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Theme toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('darkTheme', 'true');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkTheme', 'false');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Update charts if they exist
        updateChartsTheme();
    });

    // File Upload Functionality
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Open file selector when browse button is clicked
    browseButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle selected files
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => file.name.endsWith('.med'));
        
        if (validFiles.length === 0) {
            alert('Please select valid .med files');
            return;
        }
        
        // Clear file list if this is a new selection
        if (fileList.children.length === 0) {
            fileList.innerHTML = '';
        }
        
        validFiles.forEach(addFileToList);
        updateUploadButton();
    }

    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-medical"></i>
                <span>${file.name}</span>
            </div>
            <span class="remove-file"><i class="fas fa-times"></i></span>
        `;
        
        // Add remove functionality
        fileItem.querySelector('.remove-file').addEventListener('click', function() {
            fileItem.remove();
            updateUploadButton();
        });
        
        fileList.appendChild(fileItem);
    }

    function updateUploadButton() {
        uploadButton.disabled = fileList.children.length === 0;
    }

    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (fileList.children.length === 0) {
            return;
        }
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        const formData = new FormData();
        
        // Get files from input
        for (let i = 0; i < fileInput.files.length; i++) {
            if (fileInput.files[i].name.endsWith('.med')) {
                formData.append('files', fileInput.files[i]);
            }
        }
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error uploading files');
            }
            
            const data = await response.json();
            displayAnalytics(data);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    // Use sample data
    sampleDataButton.addEventListener('click', async function() {
        loadingOverlay.style.display = 'flex';
        
        try {
            const response = await fetch('/sample');
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error getting sample data');
            }
            
            const data = await response.json();
            displayAnalytics(data);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    // Display analytics
    function displayAnalytics(data) {
        // Show dashboard
        dashboard.style.display = 'block';
        
        // Update summary cards
        document.getElementById('total-patients').textContent = data.total_patients;
        
        // Create or update charts
        createOrUpdateChart('age-chart', 'bar', 'Age Distribution', data.age_distribution);
        createOrUpdateChart('gender-chart', 'pie', 'Gender Distribution', data.gender_distribution);
        createOrUpdateChart('diagnoses-chart', 'bar', 'Top Diagnoses', data.diagnoses_distribution);
        createOrUpdateChart('prescriptions-chart', 'bar', 'Top Prescriptions', data.prescription_frequency);
        createOrUpdateChart('exams-chart', 'bar', 'Top Exams', data.exam_frequency);
        createOrUpdateChart('referrals-chart', 'bar', 'Top Referrals', data.referral_frequency);
        createOrUpdateChart('timeline-chart', 'line', 'Encounters Timeline', data.temporal_distribution);
        
        // Scroll to dashboard
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }

    // Create or update chart
    function createOrUpdateChart(chartId, type, label, data) {
        const ctx = document.getElementById(chartId).getContext('2d');
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const fontColor = isDarkTheme ? '#e0e0e0' : '#333';
        const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        // Destroy existing chart if it exists
        if (charts[chartId]) {
            charts[chartId].destroy();
        }
        
        // Chart configuration
        const config = {
            type: type,
            data: {
                labels: data.labels,
                datasets: [{
                    label: label,
                    data: data.values,
                    backgroundColor: type === 'pie' 
                        ? [
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(46, 204, 113, 0.7)',
                            'rgba(155, 89, 182, 0.7)',
                            'rgba(241, 196, 15, 0.7)',
                            'rgba(230, 126, 34, 0.7)'
                        ]
                        : 'rgba(52, 152, 219, 0.7)',
                    borderColor: type === 'line' ? 'rgba(52, 152, 219, 1)' : 'rgba(52, 152, 219, 1)',
                    borderWidth: 1,
                    tension: type === 'line' ? 0.4 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type === 'pie',
                        labels: {
                            color: fontColor
                        }
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                scales: type !== 'pie' ? {
                    x: {
                        ticks: {
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: fontColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                } : {}
            }
        };
        
        // Create new chart
        charts[chartId] = new Chart(ctx, config);
    }

    // Update charts theme
    function updateChartsTheme() {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const fontColor = isDarkTheme ? '#e0e0e0' : '#333';
        const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        Object.keys(charts).forEach(chartId => {
            const chart = charts[chartId];
            
            if (chart.config.type !== 'pie') {
                chart.options.scales.x.ticks.color = fontColor;
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.y.ticks.color = fontColor;
                chart.options.scales.y.grid.color = gridColor;
            }
            
            chart.options.plugins.legend.labels.color = fontColor;
            chart.update();
        });
    }
});
