/**
 * SSE Event Parser Utilities
 * 
 * Functions for parsing and validating Server-Sent Events (SSE) data.
 */

import { DebateEvent } from "@/types/debate-event";

/**
 * Parses raw SSE message data into a DebateEvent object.
 * 
 * @param rawEventData - The raw event data string from SSE
 * @param eventType - The SSE event type
 * @returns Parsed DebateEvent object or null if parsing fails
 */
export function parseDebateEvent(
    rawEventData: string,
    eventType: string
): DebateEvent | null {
    try {
        const parsedData: DebateEvent = JSON.parse(rawEventData);
        // Attach the event type from SSE
        parsedData.event = eventType;
        return parsedData;
    } catch (error) {
        console.error("Failed to parse SSE message", error);
        return null;
    }
}

/**
 * Determines if a debate event contains meaningful data.
 * Filters out heartbeats and empty events.
 * 
 * @param event - The parsed DebateEvent to validate
 * @returns true if the event is valid and should be processed
 */
export function isValidDebateEvent(event: DebateEvent | null): event is DebateEvent {
    if (!event) return false;

    // Filter out heartbeats or empty events
    return !!(
        event.debater ||
        event.data ||
        event.agent ||
        event.argument ||
        event.text ||
        event.event !== 'message'
    );
}
