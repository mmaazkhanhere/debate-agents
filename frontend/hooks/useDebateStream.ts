import { useEffect, useState, useCallback, useRef } from 'react';
import { DebateEvent } from '@/types/debate-event';
import { buildDebateEventsUrl } from '@/actions/debate-api';
import {
    createEventSource,
    registerEventListeners,
    registerLifecycleHandlers,
    closeEventSource
} from '@/lib/sse/sse-connection';
import { parseDebateEvent, isValidDebateEvent } from '@/lib/sse/event-parser';

interface UseDebateStreamReturn {
    messages: DebateEvent[];
    isConnected: boolean;
    error: Event | null;
    close: () => void;
}

/**
 * Custom event types that the backend may send via SSE.
 * Based on LangChain/Agent patterns.
 */
const CUSTOM_EVENT_TYPES = [
    "message",
    "update",
    "agent_response",
    "data",
    "agent_done",
    "moderator_intro_done"
];

/**
 * Hook for managing a Server-Sent Events (SSE) stream for debate events.
 * 
 * @param debateId - The unique debate identifier, or null if no debate is active
 * @returns Stream state including messages, connection status, errors, and close function
 */
export function useDebateStream(debateId: string | null): UseDebateStreamReturn {
    const [messages, setMessages] = useState<DebateEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Event | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const close = useCallback(() => {
        closeEventSource(eventSourceRef.current);
        eventSourceRef.current = null;
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (!debateId) return;

        // Reset state on new debateId
        setMessages([]);
        setError(null);

        const url = buildDebateEventsUrl(debateId);
        const eventSource = createEventSource(url);
        eventSourceRef.current = eventSource;

        // Handle incoming messages
        const handleMessage = (event: MessageEvent) => {
            console.log("Received raw event:", event.type, event.data);

            const parsedEvent = parseDebateEvent(event.data, event.type);

            if (isValidDebateEvent(parsedEvent)) {
                setMessages((prev) => [...prev, parsedEvent]);
            }
        };

        // Register event listeners
        registerEventListeners(eventSource, CUSTOM_EVENT_TYPES, handleMessage);

        // Register lifecycle handlers
        registerLifecycleHandlers(
            eventSource,
            () => {
                setIsConnected(true);
                console.log('Debate stream connected');
            },
            (e) => {
                console.error('Debate stream error', e);
                setError(e);
            }
        );

        return () => {
            closeEventSource(eventSource);
        };
    }, [debateId]);

    return { messages, isConnected, error, close };
}
