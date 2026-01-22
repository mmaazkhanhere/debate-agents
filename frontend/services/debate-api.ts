
export interface DebateEvent {
    agent: string;
    turn_id?: string;
    debater?: string;
    index?: number;
    argument?: {
        type: string;
        text: string;
        confidence: number;
    };
    speaker?: string;
    text?: string;
    confidence?: number;
    step?: string; // For intermediate steps if any
}

// Ensure the response type matches what we expect from the backend start endpoint
interface StartDebateResponse {
    debate_id: string;
}

const API_BASE_URL = "http://localhost:8000";

export const debateApi = {
    /**
     * Starts a new debate with the given topic and debaters.
     * @returns The debate_id to subscribe to events.
     */
    startDebate: async (topic: string, debater1: string, debater2: string): Promise<string> => {
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
    },

    /**
     * Returns the EventSource URL for a given debate ID.
     */
    getEventsUrl: (debateId: string): string => {
        return `${API_BASE_URL}/debate/${debateId}/events`;
    }
};
