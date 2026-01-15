import requests
import json

def test_debate():
    url = "http://127.0.0.1:8000/debate"
    params = {
        "topic": "Is AI a threat to humanity?",
        "debater_1": "Elon Musk",
        "debater_2": "Trump"
    }
    
    print(f"Sending request to {url} with params: {params}")
    try:
        response = requests.post(url, params=params)
        response.raise_for_status()
        print("Response received successfully!")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_debate()
