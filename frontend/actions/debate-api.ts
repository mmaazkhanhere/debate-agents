/**
 * Debate API Actions
 * 
 * Clean, simple functions for interacting with the debate backend API.
 * These functions are pure, testable, and have no side effects.
 */

const API_BASE_URL = "http://localhost:8000";

interface StartDebateResponse {
    debate_id: string;
}

/**
 * Initiates a new debate session with the backend.
 * 
 * @param topic - The debate topic
 * @param debater1 - Name of the first debater
 * @param debater2 - Name of the second debater
 * @returns Promise resolving to the debate ID
 * @throws Error if the request fails
 */
export async function startDebate(
    topic: string,
    debater1: string,
    debater2: string
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/debate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            topic,
            debater_1: debater1,
            debater_2: debater2,
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to start debate: ${response.statusText}`);
    }

    const data: StartDebateResponse = await response.json();
    return data.debate_id;
}

/**
 * Constructs the Server-Sent Events (SSE) endpoint URL for a debate.
 * 
 * @param debateId - The unique debate identifier
 * @returns The complete SSE endpoint URL
 */
export function buildDebateEventsUrl(debateId: string): string {
    return `${API_BASE_URL}/debate/${debateId}/events`;
}
