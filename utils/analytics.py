import json
from collections import Counter
from datetime import datetime
import re

def process_med_files(file_paths):
    """
    Process multiple .med files and return a list of patient data.
    
    Args:
        file_paths (list): List of paths to .med files
        
    Returns:
        list: List of patient data dictionaries
    """
    patients = []
    
    for file_path in file_paths:
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
                patients.append(data)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {str(e)}")
    
    return patients

def get_age_distribution(patients):
    """
    Calculate age distribution from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Age distribution data
    """
    age_groups = {
        "0-18": 0,
        "19-40": 0,
        "41-65": 0,
        "66+": 0
    }
    
    for patient in patients:
        try:
            age = int(patient.get("age", 0))
            if age <= 18:
                age_groups["0-18"] += 1
            elif age <= 40:
                age_groups["19-40"] += 1
            elif age <= 65:
                age_groups["41-65"] += 1
            else:
                age_groups["66+"] += 1
        except (ValueError, TypeError):
            # Skip if age is not a valid number
            pass
    
    # Convert to format suitable for charts
    labels = list(age_groups.keys())
    values = list(age_groups.values())
    
    return {
        "labels": labels,
        "values": values
    }

def get_gender_distribution(patients):
    """
    Calculate gender distribution from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Gender distribution data
    """
    genders = Counter()
    
    for patient in patients:
        sex = patient.get("sex", "unknown").lower()
        genders[sex] += 1
    
    return {
        "labels": list(genders.keys()),
        "values": list(genders.values())
    }

def get_diagnoses_distribution(patients):
    """
    Calculate diagnoses distribution from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Diagnoses distribution data
    """
    diagnoses = Counter()
    
    for patient in patients:
        diagnosis = patient.get("diagnosis", "Unknown")
        diagnoses[diagnosis] += 1
    
    # Sort by frequency and limit to top 10
    most_common = diagnoses.most_common(10)
    
    return {
        "labels": [item[0] for item in most_common],
        "values": [item[1] for item in most_common]
    }

def get_prescription_frequency(patients):
    """
    Calculate prescription frequency from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Prescription frequency data
    """
    prescriptions = Counter()
    
    for patient in patients:
        try:
            for prescription in patient.get("medical_conducts", {}).get("prescriptions", []):
                prescriptions[prescription] += 1
        except (AttributeError, TypeError):
            # Skip if medical_conducts structure is not as expected
            pass
    
    # Sort by frequency and limit to top 10
    most_common = prescriptions.most_common(10)
    
    return {
        "labels": [item[0] for item in most_common],
        "values": [item[1] for item in most_common]
    }

def get_exam_frequency(patients):
    """
    Calculate exam request frequency from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Exam request frequency data
    """
    exams = Counter()
    
    for patient in patients:
        try:
            for exam in patient.get("medical_conducts", {}).get("exam_requests", []):
                exams[exam] += 1
        except (AttributeError, TypeError):
            # Skip if medical_conducts structure is not as expected
            pass
    
    # Sort by frequency and limit to top 10
    most_common = exams.most_common(10)
    
    return {
        "labels": [item[0] for item in most_common],
        "values": [item[1] for item in most_common]
    }

def get_referral_frequency(patients):
    """
    Calculate referral frequency from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Referral frequency data
    """
    referrals = Counter()
    
    for patient in patients:
        try:
            for referral in patient.get("medical_conducts", {}).get("referrals", []):
                referrals[referral] += 1
        except (AttributeError, TypeError):
            # Skip if medical_conducts structure is not as expected
            pass
    
    # Sort by frequency and limit to top 10
    most_common = referrals.most_common(10)
    
    return {
        "labels": [item[0] for item in most_common],
        "values": [item[1] for item in most_common]
    }

def get_temporal_distribution(patients):
    """
    Calculate temporal distribution of encounters from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Temporal distribution data
    """
    encounters_by_month = Counter()
    
    for patient in patients:
        try:
            timestamp = patient.get("timestamp", "")
            if timestamp:
                date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                month_year = date.strftime("%Y-%m")
                encounters_by_month[month_year] += 1
        except (ValueError, TypeError):
            # Skip if timestamp is not valid
            pass
    
    # Sort by month-year
    sorted_months = sorted(encounters_by_month.items())
    
    return {
        "labels": [item[0] for item in sorted_months],
        "values": [item[1] for item in sorted_months]
    }

def get_analytics(patients):
    """
    Generate analytics from patient data.
    
    Args:
        patients (list): List of patient data dictionaries
        
    Returns:
        dict: Analytics data for dashboard
    """
    return {
        "total_patients": len(patients),
        "age_distribution": get_age_distribution(patients),
        "gender_distribution": get_gender_distribution(patients),
        "diagnoses_distribution": get_diagnoses_distribution(patients),
        "prescription_frequency": get_prescription_frequency(patients),
        "exam_frequency": get_exam_frequency(patients),
        "referral_frequency": get_referral_frequency(patients),
        "temporal_distribution": get_temporal_distribution(patients)
    }
