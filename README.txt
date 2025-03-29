# MedView - Medical Data Dashboard

MedView is a modern, minimalist web application for visualizing and analyzing medical encounter data. It allows healthcare professionals to upload `.med` files (JSON-formatted medical records) and generates comprehensive analytics and visualizations.

![MedView Dashboard](https://api.placeholder.com/800/400)

## Features

### Data Visualization
- **Patient Demographics:** Age and gender distribution charts
- **Medical Analysis:** Top diagnoses, prescriptions, exams, and referrals
- **Temporal Analysis:** Encounter frequency over time
- **Summary Statistics:** Quick overview of key metrics

### User Experience
- **Modern Interface:** Clean, responsive design that works on all devices
- **Dark/Light Mode:** Toggle between color schemes based on preference
- **Drag-and-Drop:** Easy file upload with visual feedback
- **Sample Data:** Test functionality without uploading files

## Technology Stack

### Backend
- **Flask:** Python web framework
- **JSON Processing:** Robust parsing and analysis of medical data
- **RESTful API:** Endpoints for data upload and processing

### Frontend
- **HTML5/CSS3:** Modern, responsive layout
- **JavaScript (ES6+):** Dynamic user interface
- **Chart.js:** Interactive data visualizations
- **FontAwesome:** Iconography

## Getting Started

### Prerequisites
- Python 3.8+
- Modern web browser

### Local Installation

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/medview.git
   cd medview
   ```

2. **Set up a virtual environment**
   ```
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```
   python app.py
   ```

5. **Access in browser**
   Open your browser and go to `http://127.0.0.1:5000`

### Deployment on Render.com

1. **Create a new Web Service** on Render.com
2. **Connect your repository**
3. **Configure the service:**
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

## Using the Application

### Uploading Files
1. Drag and drop `.med` files onto the upload area
2. Alternatively, click "Browse Files" to select files
3. Once files are selected, click "Process Files"

### Sample Data
- Click "Use Sample Data" to visualize example patient data

### Interpreting Results
- **Age Distribution:** Breakdown of patients by age group
- **Gender Distribution:** Proportion of patients by gender
- **Top Diagnoses:** Most common medical conditions
- **Prescription Frequency:** Most prescribed medications
- **Exam Requests:** Most requested medical examinations
- **Referrals:** Most common specialist referrals
- **Timeline:** Encounter distribution over time

## File Format

MedView accepts `.med` files, which are JSON-formatted files with the following structure:

```json
{
  "name": "patient_id",
  "age": "74",
  "sex": "male",
  "diagnosis": "Parkinson's Disease",
  "medical_conducts": {
    "prescriptions": ["Levodopa/Carbidopa"],
    "exam_requests": ["Magnetic Resonance Imaging (MRI) Brain"],
    "referrals": ["Physical Medicine and Rehabilitation (PM&R)"]
  },
  "timestamp": "2025-03-27T23:15:40.336957Z"
}
```

## Project Structure

```
medview/
├── app.py                # Main Flask application
├── requirements.txt      # Dependencies
├── static/               # Static files
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── js/
│   │   └── main.js       # Frontend JavaScript
│   └── favicon.ico       # Favicon
├── templates/            # HTML templates
│   ├── index.html        # Main dashboard page
│   └── layout.html       # Base template
└── utils/                # Utility functions
    └── analytics.py      # Data processing functions
```

## Customization

### Adding New Analytics
1. Define a new analysis function in `utils/analytics.py`
2. Add the function call to the `get_analytics()` function
3. Update the frontend to display the new data

### Modifying the UI
- Customize colors and styles in `static/css/style.css`
- Adjust layout and components in the HTML templates

## Privacy and Security

- All data processing happens locally - no data is sent to external servers
- Files are temporarily stored during processing and then removed
- No patient identifiable information is stored permanently

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chart.js for the visualization library
- Flask for the web framework
- FontAwesome for the icons

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com)
