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
inactivity_counter = 0  # In seconds

# Alert-Notification Service URL
ALERT_NOTIFICATION_URL = "http://localhost:8082/api/alerts/email"

def is_within_perimeter(patient_location, center, radius_km):
    """
    Checks if the patient is within the defined perimeter.

    :param patient_location: Tuple (latitude, longitude) of the patient's location.
    :param center: Tuple (latitude, longitude) of the center of the safe perimeter.
    :param radius_km: Radius of the safe perimeter in kilometers.
    :return: True if within perimeter, False otherwise.
    """
    distance = geodesic(patient_location, center).km
    return distance <= radius_km

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
    global last_location, last_timestamp, inactivity_counter, last_perimeter_status, last_inactivity_status

    data = request.json
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    timestamp = data.get("timestamp")
    tracker_id = data.get("trackerId")

    if latitude is None or longitude is None or tracker_id is None:
        return jsonify({"error": "Invalid data"}), 400

    patient_location = (latitude, longitude)
    current_time = datetime.now()

    # Perimeter Check
    is_inside_perimeter = is_within_perimeter(patient_location, PERIMETER_CENTER, PERIMETER_RADIUS_KM)

    # Send email if perimeter status changes
    if last_perimeter_status is None or last_perimeter_status != ("inside" if is_inside_perimeter else "outside"):
        if is_inside_perimeter:
            subject = f"Patient {tracker_id} Returned Inside the Perimeter"
            body = (
                f"Patient {tracker_id} has returned inside the safe perimeter.\n\n"
                f"Location: Latitude={latitude}, Longitude={longitude}\n"
                f"Time: {current_time}\n\n"
                f"Thank you for your attention."
            )
        else:
            subject = f"Alert: Patient {tracker_id} Outside the Perimeter"
            body = (
                f"Patient {tracker_id} has exited the safe perimeter.\n\n"
                f"Location: Latitude={latitude}, Longitude={longitude}\n"
                f"Time: {current_time}\n\n"
                f"Please check on the patient immediately."
            )
        send_email_alert("alidalil123@gmail.com", subject, body)
        last_perimeter_status = "inside" if is_inside_perimeter else "outside"

    # Inactivity Check
    if last_location is not None:
        distance_from_last = geodesic(patient_location, last_location).km
        time_difference = (current_time - last_timestamp).total_seconds()

        if distance_from_last <= MOVEMENT_TOLERANCE_KM:
            # Patient has not moved significantly
            inactivity_counter += time_difference
            if inactivity_counter >= INACTIVITY_THRESHOLD_SEC:
                if last_inactivity_status != "inactive":
                    subject = f"Alert: Patient {tracker_id} Inactive for Too Long"
                    body = (
                        f"Patient {tracker_id} has been inactive for over {INACTIVITY_THRESHOLD_SEC} seconds.\n\n"
                        f"Location: Latitude={latitude}, Longitude={longitude}\n"
                        f"Time: {current_time}\n\n"
                        f"Please check on the patient immediately."
                    )
                    send_email_alert("alidalil123@gmail.com", subject, body)
                    last_inactivity_status = "inactive"
        else:
            # Reset inactivity if movement detected
            if last_inactivity_status == "inactive":
                subject = f"Patient {tracker_id} Became Active Again"
                body = (
                    f"Patient {tracker_id} has resumed activity after being inactive.\n\n"
                    f"Location: Latitude={latitude}, Longitude={longitude}\n"
                    f"Time: {current_time}\n\n"
                    f"Thank you for your attention."
                )
                send_email_alert("alidalil123@gmail.com", subject, body)
            inactivity_counter = 0
            last_inactivity_status = "active"
    else:
        # Initialize tracking
        inactivity_counter = 0
        last_inactivity_status = "active"

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
