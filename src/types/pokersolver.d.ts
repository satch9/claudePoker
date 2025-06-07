declare module 'pokersolver' {
    export class Hand {
        static solve(cards: string[]): Hand;
        static winners(hands: Hand[]): Hand[];
        name: string;
        rank: number;
        descr: string;
        cards: { value: number; rank: string; suit: string }[];
        // Ajoutez d'autres propriétés/méthodes si besoin
    }
}
