import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createDeck, getBestHand } from "./utils/cardUtils";
import { GameAction, Player } from "./types";

export const create = mutation({
    args: {
        name: v.string(),
        maxPlayers: v.number(),
        structureId: v.id("structures"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const gameId = await ctx.db.insert("games", {
            name: args.name,
            maxPlayers: args.maxPlayers,
            structureId: args.structureId,
            status: "waiting",
            currentPlayerIndex: 0,
            dealerIndex: 0,
            pot: 0,
            sidePots: [],
            communityCards: [],
            currentRound: "preflop",
            deck: createDeck(),
            burnedCards: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: args.userId,
            blindLevelIndex: 0,
        });
        return gameId;
    },
});

export const get = query({
    args: { gameId: v.id("games") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.gameId);
    },
});

export const joinGame = mutation({
    args: {
        gameId: v.id("games"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId);
        if (!game) throw new Error("Jeu non trouvé");

        const existingPlayer = await ctx.db
            .query("players")
            .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .first();

        if (existingPlayer) throw new Error("Joueur déjà dans la partie");

        const players = await ctx.db
            .query("players")
            .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
            .collect();

        if (players.length >= game.maxPlayers) {
            throw new Error("Partie complète");
        }

        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Utilisateur non trouvé");

        const position = players.length;

        await ctx.db.insert("players", {
            gameId: args.gameId,
            userId: args.userId,
            username: user.username,
            avatar: user.avatar,
            position,
            chips: user.chips,
            holeCards: [],
            currentBet: 0,
            totalBet: 0,
            isActive: true,
            hasActed: false,
            isAllIn: false,
            totalBetInGame: 0,
            isFolded: false,
            joinedAt: Date.now(),
        });

        return { success: true };
    },
});

export const startGame = mutation({
    args: { gameId: v.id("games") },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId);
        if (!game) throw new Error("Jeu non trouvé");

        const structure = await ctx.db.get(game.structureId);
        if (!structure) throw new Error("Structure de blindes non trouvée");
        const firstLevel = structure.blindLevels[0];
        const smallBlindValue = firstLevel.smallBlind;
        const bigBlindValue = firstLevel.bigBlind;

        const players = await ctx.db
            .query("players")
            .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
            .collect();

        if (players.length < 2) {
            throw new Error("Il faut au moins 2 joueurs pour commencer");
        }

        const deck = [...game.deck];
        const dealerIndex = Math.floor(Math.random() * players.length);

        let smallBlindIndex: number;
        let bigBlindIndex: number;

        if (players.length === 2) {
            smallBlindIndex = dealerIndex;
            bigBlindIndex = (dealerIndex + 1) % players.length;
        } else {
            smallBlindIndex = (dealerIndex + 1) % players.length;
            bigBlindIndex = (dealerIndex + 2) % players.length;
        }

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const holeCards = [deck.pop()!, deck.pop()!];

            let currentBet = 0;
            let totalBet = 0;

            if (i === smallBlindIndex) {
                currentBet = Math.min(smallBlindValue, player.chips);
                totalBet = currentBet;
            } else if (i === bigBlindIndex) {
                currentBet = Math.min(bigBlindValue, player.chips);
                totalBet = currentBet;
            }

            await ctx.db.patch(player._id, {
                holeCards,
                currentBet,
                totalBet,
                chips: player.chips - currentBet,
                hasActed: i === smallBlindIndex,
                isAllIn: (i === smallBlindIndex && currentBet === player.chips) ||
                    (i === bigBlindIndex && currentBet === player.chips),
            });
        }

        const pot = smallBlindValue + bigBlindValue;
        const currentPlayerIndex = players.length === 2 ? smallBlindIndex : (bigBlindIndex + 1) % players.length;

        await ctx.db.patch(args.gameId, {
            status: "playing",
            dealerIndex,
            currentPlayerIndex,
            pot,
            deck,
            currentRound: "preflop",
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

export const makeAction = mutation({
    args: {
        gameId: v.id("games"),
        userId: v.id("users"),
        action: v.union(
            v.literal("fold"),
            v.literal("check"),
            v.literal("call"),
            v.literal("bet"),
            v.literal("raise"),
            v.literal("all-in")
        ),
        amount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId);
        if (!game || game.status !== "playing") {
            throw new Error("Jeu non disponible");
        }

        // Récupérer la liste des joueurs AVANT action
        let players = await ctx.db
            .query("players")
            .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
            .collect();

        const currentPlayer = players.find(p => p.position === game.currentPlayerIndex);
        if (!currentPlayer || currentPlayer.userId !== args.userId) {
            throw new Error("Ce n'est pas votre tour");
        }

        if (!currentPlayer.isActive || currentPlayer.isAllIn) {
            throw new Error("Vous ne pouvez pas jouer");
        }

        const actionResult = await processPlayerAction(ctx, game, currentPlayer, players, args.action, args.amount);

        // Correction : calculer le vrai betIncrease (pour éviter les incohérences)
        const betIncrease = Math.max(0, actionResult.newBet - currentPlayer.currentBet);
        await ctx.db.patch(currentPlayer._id, {
            currentBet: actionResult.newBet,
            totalBet: currentPlayer.totalBet + betIncrease,
            chips: currentPlayer.chips - betIncrease,
            hasActed: true,
            action: args.action,
            isActive: actionResult.isActive,
            isAllIn: actionResult.isAllIn,
        });

        // Remise à zéro de hasActed pour les autres joueurs en cas de raise/bet
        if (args.action === "raise" || args.action === "bet") {
            console.log("=== État des joueurs avant checkBettingRoundComplete ===");
            for (const player of players) {
                console.log({
                    username: player.username,
                    isActive: player.isActive,
                    isAllIn: player.isAllIn,
                    hasActed: player.hasActed,
                    currentBet: player.currentBet,
                });
                if (
                    player._id !== currentPlayer._id &&
                    player.isActive &&
                    !player.isAllIn
                ) {
                    await ctx.db.patch(player._id, { hasActed: false });
                }
            }
        }

        // Correction : n'ajouter au pot que le vrai betIncrease
        await ctx.db.patch(args.gameId, {
            pot: game.pot + betIncrease,
            updatedAt: Date.now(),
        });

        // Recharger la liste des joueurs APRÈS action
        players = await ctx.db
            .query("players")
            .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
            .collect();

        // Vérifier s'il ne reste qu'un seul joueur actif
        const stillActivePlayers = players.filter(p => p.isActive && !p.isAllIn);
        if (stillActivePlayers.length === 1) {
            // Un seul joueur actif, il gagne le pot immédiatement
            const winner = stillActivePlayers[0];
            await ctx.db.patch(winner._id, {
                chips: winner.chips + game.pot,
            });
            await ctx.db.patch(args.gameId, {
                status: "finished",
                pot: 0,
                updatedAt: Date.now(),
            });
            return { success: true, winner: winner.userId };
        }

        // Vérifier si le tour d'enchères est terminé
        const bettingRoundComplete = await checkBettingRoundComplete(ctx, args.gameId, players);

        if (bettingRoundComplete) {
            await advanceGameRound(ctx, args.gameId);
        } else {
            // Déterminer le prochain joueur qui doit agir
            const nextPlayerIndex = getNextActivePlayer(players, game.currentPlayerIndex ?? 0);
            // Si personne ne doit agir, ne pas avancer le tour
            if (nextPlayerIndex !== game.currentPlayerIndex) {
                await ctx.db.patch(args.gameId, {
                    currentPlayerIndex: nextPlayerIndex,
                    updatedAt: Date.now(),
                });
            }
        }

        return { success: true };
    },
});

async function processPlayerAction(
    ctx: any,
    game: any,
    player: any,
    players: any[],
    action: GameAction,
    amount?: number
) {
    const structure = await ctx.db.get(game.structureId);
    if (!structure) throw new Error("Structure de blindes non trouvée");
    const currentLevel = structure.blindLevels[0];
    const bigBlindValue = currentLevel.bigBlind;

    const highestBet = Math.max(...players.map(p => p.currentBet));

    const result = (() => {
        switch (action) {
            case "fold":
                return {
                    newBet: player.currentBet,
                    betIncrease: 0,
                    isActive: false,
                    isAllIn: false,
                };

            case "check":
                if (player.currentBet !== highestBet) {
                    throw new Error("Vous ne pouvez pas checker");
                }
                return {
                    newBet: player.currentBet,
                    betIncrease: 0,
                    isActive: true,
                    isAllIn: false,
                };

            case "call":
                const callAmount = Math.min(highestBet - player.currentBet, player.chips);
                return {
                    newBet: player.currentBet + callAmount,
                    betIncrease: callAmount,
                    isActive: true,
                    isAllIn: callAmount === player.chips,
                };

            case "bet":
            case "raise":
                const betAmount = amount || bigBlindValue;
                const totalBet = player.currentBet + betAmount;

                if (betAmount > player.chips) {
                    throw new Error("Mise trop élevée");
                }

                if (totalBet <= highestBet) {
                    throw new Error("La relance doit être supérieure à la mise la plus élevée");
                }

                return {
                    newBet: totalBet,
                    betIncrease: betAmount,
                    isActive: true,
                    isAllIn: betAmount === player.chips,
                };

            case "all-in":
                return {
                    newBet: player.currentBet + player.chips,
                    betIncrease: player.chips,
                    isActive: true,
                    isAllIn: true,
                };

            default:
                throw new Error("Action non valide");
        }
    })();

    // Log après chaque action
    console.log('[DEBUG ACTION]', {
        action,
        joueur: player.username,
        betIncrease: result.betIncrease,
        currentBet: player.currentBet,
        totalBet: player.totalBet,
        pot: game.pot
    });
    return result;
}

async function checkBettingRoundComplete(ctx: any, gameId: string, players: any[]): Promise<boolean> {
    console.log("=== checkBettingRoundComplete ===");
    for (const p of players) {
        console.log({
            username: p.username,
            isActive: p.isActive,
            isAllIn: p.isAllIn,
            hasActed: p.hasActed,
            currentBet: p.currentBet,
        });
    }
    // Joueurs actifs et non all-in
    const playersToAct = players.filter(p => p.isActive && !p.isAllIn);

    if (playersToAct.length <= 1) {
        return true;
    }

    const highestBet = Math.max(...playersToAct.map(p => p.currentBet));

    // Le tour est fini si tous les joueurs ont agi ET ont égalisé la mise la plus haute
    console.log("Résultat checkBettingRoundComplete:", playersToAct.every(p => p.hasActed && p.currentBet === highestBet));
    return playersToAct.every(p => p.hasActed && p.currentBet === highestBet);
}

function getNextActivePlayer(players: any[], currentIndex: number): number {
    const highestBet = Math.max(...players.map(p => p.currentBet));
    // Joueurs qui doivent encore agir
    const playersToAct = players.filter(
        p =>
            p.isActive &&
            !p.isAllIn &&
            (!p.hasActed || p.currentBet !== highestBet)
    );
    if (playersToAct.length === 0) return currentIndex;

    let nextIndex = (currentIndex + 1) % players.length;
    while (nextIndex !== currentIndex) {
        const nextPlayer = players.find(p => p.position === nextIndex);
        if (
            nextPlayer &&
            nextPlayer.isActive &&
            !nextPlayer.isAllIn &&
            (!nextPlayer.hasActed || nextPlayer.currentBet !== highestBet)
        ) {
            return nextIndex;
        }
        nextIndex = (nextIndex + 1) % players.length;
    }

    return currentIndex;
}

async function advanceGameRound(ctx: any, gameId: string) {
    const game = await ctx.db.get(gameId);
    if (!game) return;

    console.log('[SERVER] advanceGameRound appelé, round actuel :', game.currentRound);

    const players = await ctx.db
        .query("players")
        .withIndex("by_game", (q: any) => q.eq("gameId", gameId))
        .collect();

    // Reset des currentBet et hasActed
    for (const player of players) {
        await ctx.db.patch(player._id, {
            currentBet: 0,
            hasActed: false,
            action: undefined,
        });
    }

    // Gestion des cas limites
    const activePlayers = players.filter((p: any) => p.isActive && !p.isAllIn);
    const stillIn = players.filter((p: any) => p.isActive);
    const allInPlayers = players.filter((p: any) => p.isActive && p.isAllIn);

    // 1. Si un seul joueur actif reste (tous les autres ont fold), il gagne le pot immédiatement
    if (activePlayers.length === 1 && stillIn.length >= 1) {
        const winner = activePlayers[0];
        await ctx.db.patch(winner._id, {
            chips: winner.chips + game.pot,
        });
        await ctx.db.patch(gameId, {
            status: "finished",
            pot: 0,
            updatedAt: Date.now(),
        });
        console.log('[SERVER] Un seul joueur actif, pot attribué à :', winner._id);
        return;
    }

    // 2. Si tous les joueurs restants sont all-in, compléter le board jusqu'à 5 cartes puis showdown
    if (activePlayers.length === 0 && allInPlayers.length > 0) {
        let newDeck = [...game.deck];
        let newCommunityCards = [...game.communityCards];
        let newBurnedCards = [...game.burnedCards];
        // Compléter le board jusqu'à 5 cartes
        while (newCommunityCards.length < 5) {
            newBurnedCards.push(newDeck.pop()!);
            newCommunityCards.push(newDeck.pop()!);
        }
        await ctx.db.patch(gameId, {
            communityCards: newCommunityCards,
            burnedCards: newBurnedCards,
            deck: newDeck,
            updatedAt: Date.now(),
        });
        console.log('[SERVER] Tous les joueurs restants sont all-in, board complété, passage direct au showdown');
        await handleShowdown(ctx, gameId, players, newCommunityCards);
        await ctx.db.patch(gameId, {
            currentRound: "showdown",
            updatedAt: Date.now(),
        });
        return;
    }

    let newRound: string;
    let newDeck = [...game.deck];
    let newCommunityCards = [...game.communityCards];
    let newBurnedCards = [...game.burnedCards];

    switch (game.currentRound) {
        case "preflop":
            newBurnedCards.push(newDeck.pop()!);
            newCommunityCards.push(newDeck.pop()!, newDeck.pop()!, newDeck.pop()!);
            newRound = "flop";
            break;

        case "flop":
            newBurnedCards.push(newDeck.pop()!);
            newCommunityCards.push(newDeck.pop()!);
            newRound = "turn";
            break;

        case "turn":
            newBurnedCards.push(newDeck.pop()!);
            newCommunityCards.push(newDeck.pop()!);
            newRound = "river";
            break;

        case "river":
            newRound = "showdown";
            // Compléter le board si besoin
            while (newCommunityCards.length < 5) {
                newBurnedCards.push(newDeck.pop()!);
                newCommunityCards.push(newDeck.pop()!);
            }
            console.log('[SERVER] Passage au showdown, appel de handleShowdown');
            await handleShowdown(ctx, gameId, players, newCommunityCards);
            await ctx.db.patch(gameId, {
                currentRound: "showdown",
                updatedAt: Date.now(),
            });
            return;

        default:
            return;
    }

    if (newRound !== "showdown") {
        // Calcul du premier joueur actif pour le nouveau round
        let firstPlayerIndex = (game.dealerIndex + 1) % players.length;
        let found = false;
        for (let i = 0; i < players.length; i++) {
            const idx = (firstPlayerIndex + i) % players.length;
            const player = players.find((p: any) => p.position === idx);
            if (player && player.isActive && !player.isAllIn) {
                firstPlayerIndex = idx;
                found = true;
                break;
            }
        }
        await ctx.db.patch(gameId, {
            currentRound: newRound,
            currentPlayerIndex: found ? firstPlayerIndex : -1,
            deck: newDeck,
            communityCards: newCommunityCards,
            burnedCards: newBurnedCards,
            updatedAt: Date.now(),
        });
        console.log('[SERVER] Nouveau round :', newRound);
    }
}

// Fonction utilitaire robuste pour calculer les side pots selon la règle du poker
function calculateSidePots(players: Player[]): { amount: number; players: string[] }[] {
    // On part des mises totales de chaque joueur (all-in inclus)
    let pots: { amount: number; players: string[] }[] = [];
    let remaining = players
        .filter((p: any) => p.isActive && p.totalBet > 0)
        .map((p: any) => ({ ...p, bet: p.totalBet }));
    while (remaining.length > 0) {
        const minBet = Math.min(...remaining.map((p: any) => p.bet));
        const potPlayers = remaining.map((p: any) => p._id);
        const potAmount = minBet * potPlayers.length;
        pots.push({ amount: potAmount, players: [...potPlayers] });
        remaining = remaining
            .map((p: any) => ({ ...p, bet: p.bet - minBet }))
            .filter((p: any) => p.bet > 0);
    }
    // Debug : affiche la structure des side pots
    console.log('[DEBUG SIDEPOTS] Structure des pots :', JSON.stringify(pots));
    return pots;
}

// Nouvelle version de handleShowdown avec gestion stricte des side pots et split pot
async function handleShowdown(ctx: any, gameId: string, players: any[], communityCards: string[]) {
    // Compléter le board si besoin
    let game = await ctx.db.get(gameId);
    let newDeck = [...game.deck];
    let newCommunityCards = [...communityCards];
    let newBurnedCards = [...game.burnedCards];
    while (newCommunityCards.length < 5) {
        newBurnedCards.push(newDeck.pop()!);
        newCommunityCards.push(newDeck.pop()!);
    }
    if (newCommunityCards.length !== game.communityCards.length) {
        await ctx.db.patch(gameId, {
            communityCards: newCommunityCards,
            burnedCards: newBurnedCards,
            deck: newDeck,
            updatedAt: Date.now(),
        });
    }
    console.log('[SERVER] handleShowdown appelé, joueurs actifs :', players.filter((p: any) => p.isActive).map((p: any) => p._id));
    const activePlayers = players.filter((p: any) => p.isActive);

    if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        game = await ctx.db.get(gameId);
        await ctx.db.patch(winner._id, {
            chips: winner.chips + game.pot,
        });
        await ctx.db.patch(gameId, {
            status: "finished",
            pot: 0,
            updatedAt: Date.now(),
        });
        console.log('[SERVER] Un seul joueur actif, pot attribué à :', winner._id);
        return;
    }

    // Calcul des side pots à partir des mises totales
    game = await ctx.db.get(gameId);
    const allPlayers: any[] = await ctx.db
        .query("players")
        .withIndex("by_game", (q: any) => q.eq("gameId", gameId))
        .collect();
    const pots = calculateSidePots(allPlayers);

    // Évaluation des mains pour tous les joueurs actifs
    const handRanks: { [id: string]: any } = {};
    for (const p of allPlayers) {
        if (p.isActive) {
            const best = getBestHand(p.holeCards, newCommunityCards);
            handRanks[p._id] = best;
            console.log('[SHOWDOWN DEBUG]', p.username, 'Cartes:', p.holeCards, 'Main:', best.rank, 'Valeur:', best.value, 'Communes:', newCommunityCards);
        }
    }

    // Pour chaque pot (main pot puis side pots)
    for (const pot of pots) {
        // Les joueurs éligibles à ce pot sont ceux listés dans pot.players ET encore actifs
        const eligible: any[] = pot.players
            .map((id: string) => allPlayers.find((p: any) => p._id === id))
            .filter((p: any) => p && p.isActive);
        if (eligible.length === 0) continue;
        // Trouver la meilleure main parmi les joueurs éligibles
        let bestValue = Math.max(...eligible.map((p: any) => handRanks[p._id]?.value ?? 0));
        let winners: any[] = eligible.filter((p: any) => (handRanks[p._id]?.value ?? 0) === bestValue);
        // Debug : affiche la composition du pot
        console.log("[SERVER] Pot:", pot.amount, "Joueurs:", eligible.map(p => p.username), "Gagnants:", winners.map(w => w.username), "Part:", Math.floor(pot.amount / winners.length), "Reste:", pot.amount - Math.floor(pot.amount / winners.length) * winners.length);
        // Partage équitable du pot
        const share = Math.floor(pot.amount / winners.length);
        let reste = pot.amount - share * winners.length;
        for (const w of winners) {
            await ctx.db.patch(w._id, {
                chips: w.chips + share + (reste > 0 ? 1 : 0),
            });
            if (reste > 0) reste--;
        }
    }

    // On termine la main : pot distribué
    await ctx.db.patch(gameId, {
        pot: 0,
        updatedAt: Date.now(),
        // Correction : ne pas changer status ici, laisser "playing" pour permettre au front de démarrer la main suivante
    });
    console.log('[SERVER] Fin de handleShowdown, pot distribué');
}

// Handler pur pour startNewHand
export async function startNewHandHandler(ctx: any, args: { gameId: string }) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Jeu non trouvé");

    const players = await ctx.db
        .query("players")
        .withIndex("by_game", (q: any) => q.eq("gameId", args.gameId))
        .collect();

    const activePlayers = players.filter((p: any) => p.chips > 0);

    if (activePlayers.length < 2) {
        throw new Error("Pas assez de joueurs pour continuer");
    }

    const newDealerIndex = ((game.dealerIndex ?? 0) + 1) % activePlayers.length;

    const newDeck = createDeck();

    await ctx.db.patch(args.gameId, {
        status: "playing",
        dealerIndex: newDealerIndex,
        currentPlayerIndex: 0,
        pot: 0,
        sidePots: [],
        communityCards: [],
        currentRound: "preflop",
        deck: newDeck,
        burnedCards: [],
        updatedAt: Date.now(), // On ne touche qu'à la main, pas au chrono global
    });

    for (const player of players) {
        await ctx.db.patch(player._id, {
            holeCards: [],
            currentBet: 0,
            totalBet: 0,
            isActive: player.chips > 0,
            hasActed: false,
            action: undefined,
            isAllIn: false,
        });
    }

    return { success: true };
}

export const startNewHand = mutation({
    args: { gameId: v.id("games") },
    handler: startNewHandHandler,
});

// Handler pur pour nextBlindLevel
export async function nextBlindLevelHandler(ctx: any, args: { gameId: string }) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Jeu non trouvé");

    const structure = await ctx.db.get(game.structureId);
    if (!structure) throw new Error("Structure de blindes non trouvée");

    const currentIndex = game.blindLevelIndex || 0;
    if (currentIndex < structure.blindLevels.length - 1) {
        await ctx.db.patch(args.gameId, {
            blindLevelIndex: currentIndex + 1,
            updatedAt: Date.now(),
        });
        return { success: true, newLevel: currentIndex + 1 };
    } else {
        // Déjà au dernier niveau
        return { success: false, message: "Dernier niveau atteint" };
    }
}

export const nextBlindLevel = mutation({
    args: { gameId: v.id("games") },
    handler: nextBlindLevelHandler,
});

// Handler pur pour leaveGame
export async function leaveGameHandler(ctx: any, args: { gameId: string, userId: string }) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Jeu non trouvé");

    const players = await ctx.db
        .query("players")
        .withIndex("by_game", (q: any) => q.eq("gameId", args.gameId))
        .collect();

    const playerToLeave = players.find((p: any) => p.userId === args.userId);
    if (!playerToLeave) throw new Error("Joueur non trouvé");

    await ctx.db.patch(playerToLeave._id, {
        isActive: false,
        hasActed: false,
        action: undefined,
        isAllIn: false,
    });

    return { success: true };
}

export const leaveGame = mutation({
    args: { gameId: v.id("games"), userId: v.id("users") },
    handler: leaveGameHandler,
});

export const listGames = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("games")
            .order("desc")
            .collect();
    },
});

export { processPlayerAction, checkBettingRoundComplete, getNextActivePlayer, advanceGameRound, handleShowdown, calculateSidePots };