from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze incoming GPS data.
    """
    # Parse incoming JSON data
    data = request.json
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    timestamp = data.get("timestamp")
    tracker_id = data.get("trackerId")

    # Log received data to the console
    print(f"Received GPS data: Latitude={latitude}, Longitude={longitude}, Timestamp={timestamp}, Tracker ID={tracker_id}")

    # Placeholder logic for analysis (to be replaced with AI models)
    response = {
        "trackerId": tracker_id,
        "geofence_breach": False,  # Placeholder: Add geofencing logic here
        "inactivity": False,       # Placeholder: Add inactivity detection logic here
        "anomaly_detected": False  # Placeholder: Add anomaly detection logic here
    }

    # Log the response to the console
    print(f"AI Module Response: {response}")

    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
