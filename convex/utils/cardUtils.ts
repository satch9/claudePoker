// @ts-ignore
// Déclaration rapide pour pokersolver si pas de types
// eslint-disable-next-line
// @ts-expect-error
// eslint-disable-next-line
import { Hand } from "pokersolver";
import { Card, HandRank } from "../types";

export function createDeck(): string[] {
    const suits = [
        { long: "hearts", short: "h" },
        { long: "diamonds", short: "d" },
        { long: "clubs", short: "c" },
        { long: "spades", short: "s" }
    ];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    const deck: string[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(`${rank}${suit.short}`);
        }
    }
    return shuffleDeck(deck);
}

export function shuffleDeck(deck: string[]): string[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function parseCard(cardString: string): Card {
    // Ex: "10H" => rank: "10", suit: "H"
    const match = cardString.match(/^([0-9]+|[JQKA])([hdcs])$/i);
    if (!match) throw new Error("Format de carte invalide: " + cardString);
    const [, rank, suit] = match;
    const suitMap: any = { h: "hearts", d: "diamonds", c: "clubs", s: "spades" };
    return { rank: rank as Card["rank"], suit: suitMap[suit.toLowerCase()] };
}

export function getRankValue(rank: string): number {
    const rankValues: { [key: string]: number } = {
        "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
        "J": 11, "Q": 12, "K": 13, "A": 14
    };
    return rankValues[rank] || 0;
}

function toPokerSolver(card: string): string {
    // Convertit '10H' -> 'Th', '6C' -> '6c', etc.
    return card.replace("10", "T").toLowerCase();
}

export function getBestHand(holeCards: string[], communityCards: string[]): {
    cards: string[];
    rank: string;
    value: number;
    hand: any;
} {
    // Vérification défensive
    if (!holeCards || !communityCards) throw new Error("Cartes manquantes");
    const allCards = [...holeCards, ...communityCards];
    if (allCards.length < 5) throw new Error("Pas assez de cartes pour évaluer la main : " + JSON.stringify(allCards));
    if (allCards.some(c => !c || typeof c !== "string")) {
        console.error('[POKER DEBUG] Carte invalide dans la main :', allCards);
        throw new Error("Carte invalide dans la main : " + JSON.stringify(allCards));
    }
    const pokerSolverCards = allCards.map(toPokerSolver);
    const hand = Hand.solve(pokerSolverCards);
    return {
        cards: hand.cards.map((c: any) => c.value + c.suit),
        rank: hand.name,
        value: hand.rank,
        hand
    };
}

function getCombinations<T>(arr: T[], k: number): T[][] {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];

    const combinations: T[][] = [];
    for (let i = 0; i <= arr.length - k; i++) {
        const first = arr[i];
        const rest = arr.slice(i + 1);
        const restCombinations = getCombinations(rest, k - 1);
        combinations.push(...restCombinations.map(combo => [first, ...combo]));
    }

    return combinations;
}