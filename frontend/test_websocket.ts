import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:8000/ws");

socket.on("open", () => {
    console.log("Connected to server");
    socket.send("Hello from Node client!");
});

socket.on("message", (data) => {
    console.log("Received:", data.toString());
});

socket.on("close", () => {
    console.log("Disconnected");
});

socket.on("error", (err) => {
    console.error("WebSocket error:", err);
});
