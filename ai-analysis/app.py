import requests
from flask import Flask, request, jsonify
from geopy.distance import geodesic
from datetime import datetime

app = Flask(__name__)

# Define the center of the perimeter and its radius (in kilometers)
PERIMETER_CENTER = (31.669206, -8.025967)  # Replace with your coordinates
PERIMETER_RADIUS_KM = 0.002  # Radius in kilometers (2 meters)

# Inactivity threshold (in seconds) and movement tolerance (in kilometers)
INACTIVITY_THRESHOLD_SEC = 20  # Time threshold for inactivity
MOVEMENT_TOLERANCE_KM = 0.002  # 2 meters from last point

# Track the last known location, timestamp, inactivity counter, and last email states
last_location = None
last_timestamp = None
last_perimeter_status = None  # "inside" or "outside"
last_inactivity_status = None  # "active" or "inactive"
is_first_request = True  # Tracks whether this is the first request
inactivity_counter = 0  # In seconds

# Microservices URLs
PATIENT_SERVICE_URL = "http://localhost:8080/api/patients"
DOCTOR_SERVICE_URL = "http://localhost:8081/api/doctors"
ALERT_NOTIFICATION_URL = "http://localhost:8082/api/alerts/email"

def is_within_perimeter(patient_location, center, radius_km):
    """
    Checks if the patient is within the defined perimeter.
    """
    distance = geodesic(patient_location, center).km
    return distance <= radius_km

def fetch_patient_info(patient_id):
    """
    Fetch patient details from the patient service using patient ID.
    """
    try:
        response = requests.get(f"{PATIENT_SERVICE_URL}/{patient_id}")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch patient info: {response.status_code} {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching patient info: {e}")
        return None

def fetch_doctor_email(doctor_id):
    """
    Fetch doctor details from the doctor service using doctor ID.
    """
    try:
        response = requests.get(f"{DOCTOR_SERVICE_URL}/{doctor_id}")
        if response.status_code == 200:
            doctor = response.json()
            return doctor.get("email")
        else:
            print(f"Failed to fetch doctor info: {response.status_code} {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching doctor info: {e}")
        return None

def send_email_alert(to, subject, body):
    """
    Sends an email alert using the alert-notification service.
    """
    payload = {
        "to": to,
        "subject": subject,
        "body": body
    }
    try:
        response = requests.post(ALERT_NOTIFICATION_URL, json=payload)
        if response.status_code == 200:
            print(f"Email sent successfully: {subject}")
        else:
            print(f"Failed to send email: {response.text}")
    except Exception as e:
        print(f"Error sending email: {e}")

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze incoming GPS data for perimeter condition and inactivity.
    """
    global last_location, last_timestamp, inactivity_counter, last_perimeter_status, last_inactivity_status, is_first_request

    data = request.json
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    timestamp = data.get("timestamp")
    tracker_id = data.get("trackerId")  # This is the patient ID

    if latitude is None or longitude is None or tracker_id is None:
        return jsonify({"error": "Invalid data"}), 400

    # Fetch patient details
    patient = fetch_patient_info(tracker_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    doctor_email = fetch_doctor_email(patient.get("doctorId"))
    if not doctor_email:
        return jsonify({"error": "Doctor not found"}), 404

    patient_location = (latitude, longitude)
    current_time = datetime.now()

    # Styled Console Logs
    print("\n================ GPS Data Received ================")
    print(f"Timestamp       : {timestamp}")
    print(f"Tracker ID      : {tracker_id}")
    print(f"Latitude        : {latitude}")
    print(f"Longitude       : {longitude}")
    print(f"Patient Name    : {patient['firstName']} {patient['lastName']}")
    print(f"Doctor Email    : {doctor_email}")
    print("--------------------------------------------------")

    # Handle First Request
    if is_first_request:
        print("System Status   : Patient CONNECTED to the system ✅")
        subject = f"Patient {patient['firstName']} Connected to the System"
        body = (
            f"Patient {patient['firstName']} {patient['lastName']} has successfully connected to the monitoring system.\n\n"
            f"Initial Location:\n"
            f"  - Latitude: {latitude}\n"
            f"  - Longitude: {longitude}\n"
            f"  - Time: {current_time}\n\n"
            f"The system will now monitor their movements, perimeter breaches, and inactivity.\n\n"
            f"Patient Details:\n"
            f"  - Age: {patient['age']}\n"
            f"  - Address: {patient['address']}\n\n"
            f"Thank you for using our patient monitoring service."
        )
        send_email_alert(doctor_email, subject, body)
        is_first_request = False
        last_perimeter_status = "inside"  # Mark as inside since it's the first connection
        print("==================================================\n")
        return jsonify({"message": "Patient connected to the system"}), 200

    # Perimeter Check
    is_inside_perimeter = is_within_perimeter(patient_location, PERIMETER_CENTER, PERIMETER_RADIUS_KM)

    if last_perimeter_status is None or last_perimeter_status != ("inside" if is_inside_perimeter else "outside"):
        if is_inside_perimeter:
            print("Perimeter Status: INSIDE the perimeter ✅")
            subject = f"Patient {patient['firstName']} Returned Inside the Perimeter"
            body = (
                f"Patient {patient['firstName']} {patient['lastName']} has returned inside the safe perimeter.\n\n"
                f"Location: Latitude={latitude}, Longitude={longitude}\n"
                f"Time: {current_time}\n\n"
                f"Patient Details:\n"
                f"  - Age: {patient['age']}\n"
                f"  - Address: {patient['address']}\n\n"
                f"Thank you for your attention."
            )
        else:
            print("Perimeter Status: OUTSIDE the perimeter ❌")
            subject = f"Alert: Patient {patient['firstName']} Outside the Perimeter"
            body = (
                f"Patient {patient['firstName']} {patient['lastName']} has exited the safe perimeter.\n\n"
                f"Location: Latitude={latitude}, Longitude={longitude}\n"
                f"Time: {current_time}\n\n"
                f"Patient Details:\n"
                f"  - Age: {patient['age']}\n"
                f"  - Address: {patient['address']}\n\n"
                f"Please check on the patient immediately."
            )
        send_email_alert(doctor_email, subject, body)
        last_perimeter_status = "inside" if is_inside_perimeter else "outside"

    # Inactivity Check
    if last_location is not None:
        distance_from_last = geodesic(patient_location, last_location).km
        time_difference = (current_time - last_timestamp).total_seconds()

        if distance_from_last <= MOVEMENT_TOLERANCE_KM:
            # Patient has not moved significantly
            inactivity_counter += time_difference
            print(f"Movement Status : STATIONARY (distance={distance_from_last:.4f} km)")
            print(f"Inactivity Time : {int(inactivity_counter // 3600):02} H:"
                  f"{int((inactivity_counter % 3600) // 60):02} Min:"
                  f"{int(inactivity_counter % 60):02} S")
            
            # Send email only if status changes to "inactive"
            if inactivity_counter >= INACTIVITY_THRESHOLD_SEC and last_inactivity_status != "inactive":
                subject = f"Alert: Patient {patient['firstName']} Inactive for Too Long"
                body = (
                    f"Patient {patient['firstName']} {patient['lastName']} has been inactive for over {INACTIVITY_THRESHOLD_SEC} seconds.\n\n"
                    f"Location: Latitude={latitude}, Longitude={longitude}\n"
                    f"Time: {current_time}\n\n"
                    f"Patient Details:\n"
                    f"  - Age: {patient['age']}\n"
                    f"  - Address: {patient['address']}\n\n"
                    f"Please check on the patient immediately."
                )
                send_email_alert(doctor_email, subject, body)
                last_inactivity_status = "inactive"  # Update status to "inactive"
        else:
            # Reset inactivity if movement detected
            print("Movement Status : MOVING (distance={:.4f} km)".format(distance_from_last))
            print("Inactivity Time : RESET to 0")
            
            # Reset inactivity status if patient moves
            if last_inactivity_status == "inactive":
                subject = f"Patient {patient['firstName']} Became Active Again"
                body = (
                    f"Patient {patient['firstName']} {patient['lastName']} has resumed activity after being inactive.\n\n"
                    f"Location: Latitude={latitude}, Longitude={longitude}\n"
                    f"Time: {current_time}\n\n"
                    f"Patient Details:\n"
                    f"  - Age: {patient['age']}\n"
                    f"  - Address: {patient['address']}\n\n"
                    f"Thank you for your attention."
                )
                send_email_alert(doctor_email, subject, body)
            inactivity_counter = 0
            last_inactivity_status = "active"  # Update status to "active"
    else:
        # Initialize tracking
        print("Movement Status : INITIALIZING TRACKING")
        inactivity_counter = 0
        last_inactivity_status = "active"

    print("==================================================\n")

    # Update last location and timestamp
    last_location = patient_location
    last_timestamp = current_time

    # Return response
    response = {
        "trackerId": tracker_id,
        "perimeter_status": "inside" if is_inside_perimeter else "outside",
        "inactivity_time": int(inactivity_counter)  # Include inactivity time in response
    }
    return jsonify(response), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
