import { CardType } from "@/types/type_d";

export interface Debater {
    id: 'left' | 'right';
    name: string;
    title: string;
    avatar: string;
    ideology: string;
}

export interface DebateArgument {
    debaterId: 'left' | 'right';
    text: string;
    crowdReaction: 'positive' | 'negative' | 'neutral';
    cardType?: CardType;
    confidence?: number;
}

export interface Judge {
    id: number;
    name: string;
    title: string;
    vote: 'left' | 'right';
    reasoning: string;
    quotedLine: string;
}

export interface DebateData {
    topic: string;
    presenter: {
        name: string;
        introText: string;
        closingText: string;
    };
    debaters: {
        left: Debater;
        right: Debater;
    };
    arguments: DebateArgument[];
    judges: Judge[];
    timeLimit: number;
    totalRounds?: number;
}

export const mockDebate: DebateData = {
    topic: "Should Artificial Intelligence Be Regulated by Governments?",
    presenter: {
        name: "The Arena",
        introText: "Welcome to The Clash Arena! Tonight's clash: Should AI be regulated by governments? Two titans enter. Only one leaves victorious. Let the cards fall where they may!",
        closingText: "The cards have been played, the arguments made. Time for judgment!"
    },
    debaters: {
        left: {
            id: 'left',
            name: "Elon Musk",
            title: "Tech Entrepreneur",
            avatar: "🚀",
            ideology: "Cautious Innovation"
        },
        right: {
            id: 'right',
            name: "Jordan Peterson",
            title: "Clinical Psychologist",
            avatar: "🦞",
            ideology: "Individual Freedom"
        }
    },
    arguments: [
        {
            debaterId: 'left',
            text: "AI is the most dangerous technology humanity has ever created. We need regulatory oversight before we accidentally create something we can't control. I've seen the code. It's terrifying.",
            crowdReaction: 'positive',
            cardType: 'attack'
        },
        {
            debaterId: 'right',
            text: "Well, that's a bloody catastrophizing way to look at it. The free market has always been the best regulator of innovation. Government bureaucrats couldn't code their way out of a paper bag.",
            crowdReaction: 'positive',
            cardType: 'counter'
        },
        {
            debaterId: 'left',
            text: "The free market gave us social media algorithms that are literally melting children's brains. We need guardrails. I'm literally building AI and I'm telling you - we need rules.",
            crowdReaction: 'positive',
            cardType: 'evidence'
        },
        {
            debaterId: 'right',
            text: "And who gets to make these rules? The same ideologically possessed universities that can't define what a woman is? That's a recipe for totalitarian control of human thought itself.",
            crowdReaction: 'neutral',
            cardType: 'rhetoric'
        },
        {
            debaterId: 'left',
            text: "This isn't about ideology, it's about existential risk. When an AI can write better code than humans, manipulate elections, or crash markets - that's not a left or right issue.",
            crowdReaction: 'positive',
            cardType: 'defense'
        },
        {
            debaterId: 'right',
            text: "The proper response to chaos is not more order imposed from above. It's the cultivation of responsible individuals. You don't make people moral through legislation, bucko.",
            crowdReaction: 'negative',
            cardType: 'attack'
        }
    ],
    judges: [
        {
            id: 1,
            name: "Justice Amara Obi",
            title: "Former Supreme Court Justice",
            vote: 'left',
            reasoning: "The existential risk argument was compelling and well-evidenced.",
            quotedLine: "When an AI can write better code than humans..."
        },
        {
            id: 2,
            name: "Prof. Kenji Nakamura",
            title: "MIT AI Lab Director",
            vote: 'right',
            reasoning: "The innovation freedom argument aligns with historical tech progress.",
            quotedLine: "The free market has always been the best regulator"
        },
        {
            id: 3,
            name: "Dr. Sarah Mitchell",
            title: "Public Policy Expert",
            vote: 'left',
            reasoning: "The social media example demonstrated clear market failure.",
            quotedLine: "Social media algorithms that are literally melting children's brains"
        }
    ],
    timeLimit: 180,
    totalRounds: 2
};
