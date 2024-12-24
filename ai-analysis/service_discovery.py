import requests
import json

with open('config.json') as f:
    config = json.load(f)

EUREKA_SERVER = config['eureka_server']
INSTANCE_NAME = config['instance_name']
HOST = config['host']
PORT = config['port']

def register_with_eureka():
    url = f"{EUREKA_SERVER}/apps/{INSTANCE_NAME}"
    payload = {
        "instance": {
            "hostName": HOST,
            "app": INSTANCE_NAME.upper(),
            "vipAddress": INSTANCE_NAME.lower(),
            "secureVipAddress": INSTANCE_NAME.lower(),
            "ipAddr": HOST,
            "status": "UP",
            "port": {"$": PORT, "@enabled": "true"},
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            }
        }
    }
    headers = {"Content-Type": "application/json"}

    try:
        print(f"Registering {INSTANCE_NAME} with Eureka at {url}")
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code in [200, 204]:
            print(f"Successfully registered {INSTANCE_NAME} with Eureka")
        else:
            print(f"Failed to register with Eureka: {response.status_code} {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error registering with Eureka: {e}")

register_with_eureka()
