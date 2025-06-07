import { Id } from "./_generated/dataModel";

export type Card = {
    rank: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
    suit: "hearts" | "diamonds" | "clubs" | "spades";
};

export type HandRank =
    | "high-card"
    | "pair"
    | "two-pair"
    | "three-of-a-kind"
    | "straight"
    | "flush"
    | "full-house"
    | "four-of-a-kind"
    | "straight-flush"
    | "royal-flush";

export type GameAction = "fold" | "check" | "call" | "bet" | "raise" | "all-in";

export type GameRound = "preflop" | "flop" | "turn" | "river" | "showdown";

export type Player = {
    gameId: Id<"games">;
    userId: Id<"users">;
    username: string;
    avatar: string;
    position: number;
    chips: number;
    holeCards: Card[];
    currentBet: number;
    totalBet: number;
    totalBetInGame: number;
    isActive: boolean;
    hasActed: boolean;
    action: GameAction;
    isAllIn: boolean;
    isFolded: boolean;
    joinedAt: number;
    createdAt: number;
    updatedAt: number;
};
