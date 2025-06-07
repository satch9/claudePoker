import { Id } from "../../convex/_generated/dataModel";

export type Card = string; // Ex: 'Ah', 'Ks'

export interface User {
    _id: Id<"users">;
    username: string;
    email: string;
    avatar?: string;
    chips: number;
    gamesPlayed: number;
    gamesWon: number;
    totalWinnings: number;
    settings: UserSettings;
}

export interface Player {
    _id: Id<"players">;
    userId: Id<"users">;
    username: string;
    avatar?: string;
    position: number;
    chips: number;
    holeCards: Card[];
    currentBet: number;
    totalBet: number;
    totalBetInGame: number;
    isActive: boolean;
    hasActed: boolean;
    action?: GameAction;
    isAllIn: boolean;
    isFolded: boolean;
    joinedAt: number;
}

export interface SidePot {
    amount: number;
    players: Id<"players">[];
}

export interface Game {
    _id: Id<"games">;
    name: string;
    maxPlayers: number;
    structureId: Id<"structures">;
    blindLevelIndex: number;
    status: 'waiting' | 'playing' | 'finished';
    currentPlayerIndex: number;
    dealerIndex: number;
    pot: number;
    sidePots: SidePot[];
    communityCards: Card[];
    currentRound: GameRound;
    createdAt: number;
    updatedAt: number;
}

export interface Structure {
    _id: Id<"structures">;
    name: string;
    blindDuration: number;
    blindLevels: {
        level: number;
        smallBlind: number;
        bigBlind: number;
        ante?: number;
    }[];
    createdAt: number;
}

export type GameAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
export type GameRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface UserSettings {
    hideLosingHand: boolean;
    hideWinningHand: boolean;
    hideFoldWhenLast: boolean;
}

export interface ChatMessage {
    _id: Id<"chat">;
    gameId: Id<"games">;
    userId: Id<"users">;
    username: string;
    message: string;
    timestamp: number;
    type: "chat" | "quickMessage";
}


