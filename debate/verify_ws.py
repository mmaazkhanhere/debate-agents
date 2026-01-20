import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws?topic=Cats+vs+Dogs&debater_1=CatLover&debater_2=DogLover"
    print(f"Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=60)
                    print(f"Received: {message[:100]}...") # Print first 100 chars
                    if message == "[DONE]":
                        print("Debate finished successfully.")
                        break
                except asyncio.TimeoutError:
                    print("Timeout waiting for message")
                    break
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
