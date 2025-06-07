import { Hand } from 'pokersolver';
import { Player, SidePot } from '../types/game';
import { Id } from '../../convex/_generated/dataModel';

export const createDeck = (): string[] => {
    const suits = ['h', 'd', 'c', 's']; // hearts, diamonds, clubs, spades
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

    const deck: string[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(rank + suit);
        }
    }

    return shuffleDeck(deck);
};

export const shuffleDeck = (deck: string[]): string[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const evaluateHand = (holeCards: string[], communityCards: string[]): Hand => {
    const allCards = [...holeCards, ...communityCards];
    return Hand.solve(allCards);
};

export const findWinners = (players: Player[], communityCards: string[]): Player[] => {
    const activePlayers = players.filter(p => p.isActive && !p.action?.includes('fold'));

    if (activePlayers.length === 1) {
        return activePlayers;
    }

    const handsWithPlayers = activePlayers.map(player => ({
        player,
        hand: evaluateHand(player.holeCards, communityCards)
    }));

    handsWithPlayers.sort((a, b) => b.hand.rank - a.hand.rank);

    const winningRank = handsWithPlayers[0].hand.rank;
    const winners = handsWithPlayers
        .filter(hwp => hwp.hand.rank === winningRank)
        .map(hwp => hwp.player);

    return winners;
};

export const calculateSidePots = (players: Player[]): SidePot[] => {
    const sidePots: SidePot[] = [];
    const sortedPlayers = [...players].sort((a, b) => a.totalBet - b.totalBet);

    let lastBetAmount = 0;

    for (let i = 0; i < sortedPlayers.length; i++) {
        const currentBetAmount = sortedPlayers[i].totalBet;

        if (currentBetAmount > lastBetAmount) {
            const potAmount = (currentBetAmount - lastBetAmount) * (sortedPlayers.length - i);
            const eligiblePlayers = sortedPlayers.slice(i).map(p => p._id);

            sidePots.push({
                amount: potAmount,
                players: eligiblePlayers
            });

            lastBetAmount = currentBetAmount;
        }
    }

    return sidePots;
};

export const getNextActivePlayer = (
    players: Player[],
    currentIndex: number,
    direction: 1 | -1 = 1
): number => {
    let nextIndex = currentIndex;
    let attempts = 0;

    do {
        nextIndex = (nextIndex + direction + players.length) % players.length;
        attempts++;
    } while (
        attempts < players.length &&
        (!players[nextIndex].isActive || players[nextIndex].isAllIn)
    );

    return nextIndex;
};

export const formatChips = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount?.toString();
};

export const getCardImage = (card: string): string => {
    return `/cards/${card}.svg`;
};

export const getHandStrength = (hand: Hand): string => {
    const handNames = {
        'Straight Flush': 'Quinte Flush',
        'Four of a Kind': 'Carré',
        'Full House': 'Full House',
        'Flush': 'Couleur',
        'Straight': 'Quinte',
        'Three of a Kind': 'Brelan',
        'Two Pair': 'Double Paire',
        'Pair': 'Paire',
        'High Card': 'Carte Haute'
    };

    return handNames[hand.name as keyof typeof handNames] || hand.name;
};