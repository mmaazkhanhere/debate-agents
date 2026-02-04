import { useEffect, useState, useCallback, useRef } from "react";
import { DebateEvent } from "@/types/debate-event";
import { buildDebateEventsUrl } from "@/actions/debate-api";
import {
    createEventSource,
    registerEventListeners,
    registerLifecycleHandlers,
    closeEventSource,
} from "@/lib/sse/sse-connection";
import { parseDebateEvent, isValidDebateEvent } from "@/lib/sse/event-parser";

interface UseDebateStreamReturn {
    messages: DebateEvent[];
    isConnected: boolean;
    error: Event | null;
    close: () => void;
}

const CUSTOM_EVENT_TYPES = [
    "message",
    "update",
    "agent_response",
    "data",
    "agent_done",
    "moderator_intro_done",
    "moderator_conclusion_done",
];

export const useDebateStream = (debateId: string | null): UseDebateStreamReturn => {
    const [messages, setMessages] = useState<DebateEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Event | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const close = useCallback(() => {
        if (!eventSourceRef.current) return;
        closeEventSource(eventSourceRef.current);
        eventSourceRef.current = null;
        setIsConnected(false);
    }, []);

    useEffect(() => {
        if (!debateId) return;

        setMessages([]);
        setError(null);

        const url = buildDebateEventsUrl(debateId);
        const es = createEventSource(url);
        eventSourceRef.current = es;

        const handleMessage = (event: MessageEvent) => {
            const parsed = parseDebateEvent(event.data, event.type);
            if (isValidDebateEvent(parsed)) {
                setMessages((prev) => [...prev, parsed]);
            }
        };

        registerEventListeners(es, CUSTOM_EVENT_TYPES, handleMessage);

        registerLifecycleHandlers(
            es,
            () => setIsConnected(true),
            (e) => setError(e)
        );

        return close;
    }, [debateId, close]);

    return { messages, isConnected, error, close };
}
