/**
 * SSE Connection Management Utilities
 * 
 * Functions for managing Server-Sent Events (SSE) connections.
 */

/**
 * Event handler function type for SSE messages.
 */
export type SSEMessageHandler = (event: MessageEvent) => void;

/**
 * Event handler function type for SSE errors.
 */
export type SSEErrorHandler = (event: Event) => void;

/**
 * Event handler function type for SSE connection open.
 */
export type SSEOpenHandler = () => void;

/**
 * Creates a new EventSource instance for the given URL.
 * 
 * @param url - The SSE endpoint URL
 * @returns A new EventSource instance
 */
export function createEventSource(url: string): EventSource {
    return new EventSource(url);
}

/**
 * Registers event listeners for multiple SSE event types.
 * 
 * @param eventSource - The EventSource instance
 * @param eventTypes - Array of event type names to listen for
 * @param handler - The message handler function
 */
export function registerEventListeners(
    eventSource: EventSource,
    eventTypes: string[],
    handler: SSEMessageHandler
): void {
    // Register the standard onmessage handler
    eventSource.onmessage = handler;

    // Register listeners for specific custom events
    eventTypes.forEach(eventType => {
        eventSource.addEventListener(eventType, handler);
    });
}

/**
 * Registers connection lifecycle handlers for an EventSource.
 * 
 * @param eventSource - The EventSource instance
 * @param onOpen - Handler called when connection opens
 * @param onError - Handler called when an error occurs
 */
export function registerLifecycleHandlers(
    eventSource: EventSource,
    onOpen: SSEOpenHandler,
    onError: SSEErrorHandler
): void {
    eventSource.onopen = onOpen;
    eventSource.onerror = onError;
}

/**
 * Safely closes an EventSource connection.
 * 
 * @param eventSource - The EventSource instance to close
 */
export function closeEventSource(eventSource: EventSource | null): void {
    if (eventSource) {
        eventSource.close();
    }
}
