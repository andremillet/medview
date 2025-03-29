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
    const apiForm = document.getElementById('api-form');
    const dataSourceCard = document.getElementById('data-source-card');

    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Chart objects
    let charts = {};
    
    // Check for saved theme
    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Theme toggle
    if (themeToggle) {
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
    }

    // Initialize Tabs
    if (tabButtons && tabButtons.length) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const contentId = 'content-' + button.id.split('-')[1];
                document.getElementById(contentId).classList.add('active');
            });
        });
    }

    // File Upload Functionality
    if (dropArea) {
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
    }

    // Open file selector when browse button is clicked
    if (browseButton && fileInput) {
        browseButton.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle selected files
        fileInput.addEventListener('change', () => {
            handleFiles(fileInput.files);
        });
    }

    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => file.name.endsWith('.med'));
        
        if (validFiles.length === 0) {
            showErrorNotification('Please select valid .med files');
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
        if (uploadButton) {
            uploadButton.disabled = fileList.children.length === 0;
        }
    }

    // Handle form submission
    if (uploadForm) {
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
                
                // Display data source info
                if (dataSourceCard) {
                    dataSourceCard.style.display = 'block';
                    document.getElementById('data-source').textContent = 'Uploaded Files';
                }
                
                displayAnalytics(data);
            } catch (error) {
                showErrorNotification('Error: ' + error.message);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        });
    }

    // Handle API form submission
    if (apiForm) {
        apiForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading overlay
            loadingOverlay.style.display = 'flex';
            
            const period = document.getElementById('api-period').value;
            
            try {
                const response = await fetch('/fetch-api-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ period: period })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error fetching API data');
                }
                
                const data = await response.json();
                
                // Display data source info
                if (dataSourceCard) {
                    dataSourceCard.style.display = 'block';
                    
                    let sourceText;
                    switch(period) {
                        case 'day':
                            sourceText = 'ROA API (Today)';
                            break;
                        case 'month':
                            sourceText = 'ROA API (This Month)';
                            break;
                        case '3months':
                            sourceText = 'ROA API (Last 3 Months)';
                            break;
                        case '6months':
                            sourceText = 'ROA API (Last 6 Months)';
                            break;
                        default:
                            sourceText = `ROA API (${period})`;
                    }
                    
                    document.getElementById('data-source').textContent = sourceText;
                }
                
                displayAnalytics(data);
            } catch (error) {
                showErrorNotification('Error: ' + error.message);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        });
    }

    // Use sample data
    if (sampleDataButton) {
        sampleDataButton.addEventListener('click', async function() {
            loadingOverlay.style.display = 'flex';
            
            try {
                const response = await fetch('/sample');
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error getting sample data');
                }
                
                const data = await response.json();
                
                // Display data source info
                if (dataSourceCard) {
                    dataSourceCard.style.display = 'block';
                    document.getElementById('data-source').textContent = 'Sample Data';
                }
                
                displayAnalytics(data);
            } catch (error) {
                showErrorNotification('Error: ' + error.message);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        });
    }

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

    // Show error notification to user
    function showErrorNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            dismissNotification(notification);
        }, 5000);
        
        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            dismissNotification(notification);
        });
    }

    // Dismiss the notification with animation
    function dismissNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
});
