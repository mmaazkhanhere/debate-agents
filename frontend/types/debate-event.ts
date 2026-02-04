export interface DebateEvent {
    agent?: string;
    event?: string;
    debater?: string;
    round?: number;
    timestamp?: string;
    data?: {
        debater: string;
        argument?: {
            type: string;
            text: string;
            confidence: number;
        };
        turn_id?: string;
        agent?: string;
        topic?: string;
        output?: string;
    };
    // Legacy/Fallback fields
    turn_id?: string;
    index?: number;
    argument?: {
        type: string;
        text: string;
        confidence: number;
    };
    speaker?: string;
    text?: string;
    confidence?: number;
    step?: string;
}
