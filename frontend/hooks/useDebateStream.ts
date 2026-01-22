import { useEffect, useState, useCallback, useRef } from 'react';
import { debateApi, DebateEvent } from '../services/debate-api';

interface UseDebateStreamReturn {
    messages: DebateEvent[];
    isConnected: boolean;
    error: Event | null;
    close: () => void;
}

export function useDebateStream(debateId: string | null): UseDebateStreamReturn {
    const [messages, setMessages] = useState<DebateEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Event | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const close = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        if (!debateId) return;

        // Reset state on new debateId
        setMessages([]);
        setError(null);

        const url = debateApi.getEventsUrl(debateId);
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('Debate stream connected');
        };

        const handleMessage = (event: MessageEvent) => {
            console.log("Received raw event:", event.type, event.data);
            try {
                const parsedData: DebateEvent = JSON.parse(event.data);
                // Filter out heartbeats or empty
                if (parsedData.agent || parsedData.argument || parsedData.text) {
                    setMessages((prev) => [...prev, parsedData]);
                }
            } catch (e) {
                console.error("Failed to parse SSE message", e);
            }
        };

        // Standard message listener
        eventSource.onmessage = handleMessage;

        // Listen for specific custom events that the backend might be sending
        // Based on common LangChain/Agent patterns
        eventSource.addEventListener("message", handleMessage);
        eventSource.addEventListener("update", handleMessage);
        eventSource.addEventListener("agent_response", handleMessage);
        eventSource.addEventListener("data", handleMessage);
        eventSource.addEventListener("agent_done", handleMessage);

        eventSource.onerror = (e) => {
            console.error('Debate stream error', e);
            setError(e);
        };

        return () => {
            eventSource.close();
        };
    }, [debateId, close]);

    return { messages, isConnected, error, close };
}
