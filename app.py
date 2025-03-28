import os
import json
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from utils.analytics import process_med_files, get_analytics

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = '/tmp/medview_uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    """Render the main dashboard page."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    """Handle file uploads and process the data."""
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400
    
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No files selected'}), 400
    
    # Save files temporarily
    file_paths = []
    for file in files:
        if file and file.filename.endswith('.med'):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            file_paths.append(file_path)
    
    if not file_paths:
        return jsonify({'error': 'No valid .med files uploaded'}), 400
    
    # Process the files
    try:
        data = process_med_files(file_paths)
        analytics = get_analytics(data)
        
        # Clean up temporary files
        for file_path in file_paths:
            os.remove(file_path)
        
        return jsonify(analytics)
    except Exception as e:
        # Clean up temporary files
        for file_path in file_paths:
            if os.path.exists(file_path):
                os.remove(file_path)
        return jsonify({'error': str(e)}), 500

@app.route('/sample', methods=['GET'])
def get_sample_data():
    """Provide sample data for testing."""
    sample_data = [
        {
            "name": "pat1", 
            "age": "74", 
            "sex": "male", 
            "diagnosis": "Parkinson's Disease", 
            "medical_conducts": {
                "prescriptions": ["Levodopa/Carbidopa"], 
                "exam_requests": ["Magnetic Resonance Imaging (MRI) Brain"], 
                "referrals": ["Physical Medicine and Rehabilitation (PM&R)"]
            }, 
            "timestamp": "2025-03-27T23:15:40.336957Z"
        },
        {
            "name": "pat2", 
            "age": "65", 
            "sex": "female", 
            "diagnosis": "Rheumatoid Arthritis", 
            "medical_conducts": {
                "prescriptions": ["Methotrexate", "Prednisone"], 
                "exam_requests": ["X-Ray Hands", "Complete Blood Count"], 
                "referrals": ["Rheumatology"]
            }, 
            "timestamp": "2025-03-26T10:30:22.123456Z"
        },
        {
            "name": "pat3", 
            "age": "42", 
            "sex": "male", 
            "diagnosis": "Type 2 Diabetes", 
            "medical_conducts": {
                "prescriptions": ["Metformin", "Glipizide"], 
                "exam_requests": ["HbA1c", "Lipid Panel"], 
                "referrals": ["Nutritionist", "Endocrinology"]
            }, 
            "timestamp": "2025-03-25T14:45:10.987654Z"
        }
    ]
    
    analytics = get_analytics(sample_data)
    return jsonify(analytics)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
