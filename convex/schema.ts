import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // TABLE USERS - Stocke les informations des joueurs
    users: defineTable({
        username: v.string(),           // Nom d'utilisateur unique pour l'identification
        email: v.string(),              // Email pour connexion et communication
        password: v.string(),           // Mot de passe hashé pour l'authentification
        avatar: v.optional(v.string()), // URL ou nom de fichier de l'avatar (optionnel)
        chips: v.number(),              // Nombre total de jetons possédés par le joueur (bankroll)
        gamesPlayed: v.number(),        // Compteur du nombre total de parties jouées
        gamesWon: v.number(),           // Compteur du nombre de parties gagnées
        totalWinnings: v.number(),      // Somme totale des gains/pertes du joueur
        settings: v.object({            // Préférences d'affichage du joueur
            hideLosingHand: v.boolean(),    // Masquer automatiquement les mains perdantes
            hideWinningHand: v.boolean(),   // Masquer automatiquement les mains gagnantes
            hideFoldWhenLast: v.boolean(),  // Masquer le fold quand c'est le dernier à jouer
        }),
        createdAt: v.number(),          // Timestamp de création du compte
        updatedAt: v.number(),          // Timestamp de dernière modification du profil
        lastLoginAt: v.number(),        // Timestamp de la dernière connexion
        resetToken: v.optional(v.string()),
        resetTokenCreatedAt: v.optional(v.number()),
    })
        .index("by_email", ["email"])       // Index pour recherche rapide par email (connexion)
        .index("by_username", ["username"]), // Index pour recherche rapide par username

    // TABLE GAMES - Stocke l'état des parties de poker
    games: defineTable({
        name: v.string(),               // Nom de la partie (ex: "Table VIP", "Tournoi du soir")
        maxPlayers: v.number(),         // Nombre maximum de joueurs autorisés à cette table
        status: v.union(                // État actuel de la partie
            v.literal("waiting"),           // En attente de joueurs
            v.literal("playing"),           // Partie en cours
            v.literal("finished")           // Partie terminée
        ),
        currentPlayerIndex: v.optional(v.number()), // Index du joueur qui doit jouer (null si waiting)
        dealerIndex: v.optional(v.number()),        // Index du joueur qui a le bouton dealer (null si waiting)
        pot: v.number(),                // Montant total du pot principal
        sidePots: v.array(v.object({    // Pots secondaires (quand des joueurs sont all-in)
            amount: v.number(),             // Montant de ce pot secondaire
            players: v.array(v.id("players")), // IDs des joueurs éligibles pour ce pot
        })),
        communityCards: v.array(v.string()), // Cartes communes sur la table (flop, turn, river)
        currentRound: v.union(          // Tour de mise actuel
            v.literal("preflop"),           // Avant le flop (après distribution des cartes privées)
            v.literal("flop"),              // Après le flop (3 cartes communes)
            v.literal("turn"),              // Après le turn (4ème carte commune)
            v.literal("river"),             // Après la river (5ème carte commune)
            v.literal("showdown")           // Phase de dévoilement des cartes
        ),
        deck: v.array(v.string()),      // Cartes restantes dans le paquet
        burnedCards: v.array(v.string()), // Cartes brûlées (écartées avant flop/turn/river)
        createdBy: v.id("users"),       // ID du joueur qui a créé cette partie
        createdAt: v.number(),          // Timestamp de création de la partie
        updatedAt: v.number(),          // Timestamp de dernière modification de la partie
        structureId: v.id("structures"), // Référence à la structure de blindes utilisée pour cette partie
        blindLevelIndex: v.number(),    // Index du niveau de blindes actuel
    })
        .index("by_status", ["status"])     // Index pour filtrer les parties par statut
        .index("by_creator", ["createdBy"]), // Index pour trouver les parties créées par un joueur

    // TABLE PLAYERS - Stocke l'état des joueurs dans une partie spécifique
    players: defineTable({
        gameId: v.id("games"),          // Référence à la partie
        userId: v.id("users"),          // Référence au joueur
        username: v.string(),            // Nom d'utilisateur (dénormalisé)
        avatar: v.optional(v.string()),  // Avatar du joueur (dénormalisé)
        position: v.number(),            // Position du joueur à la table (0-8 généralement)
        chips: v.number(),              // Nombre de jetons que le joueur a sur cette table
        holeCards: v.array(v.string()), // Cartes privées du joueur (ex: ["As", "Kh"])
        currentBet: v.number(),         // Montant misé par le joueur dans le tour actuel
        totalBet: v.number(),           // Total misé par le joueur dans cette main
        totalBetInGame: v.number(),     // Total misé par le joueur dans toute la partie
        isActive: v.boolean(),          // Le joueur est-il encore dans la main ?
        hasActed: v.boolean(),          // Le joueur a-t-il déjà joué dans ce tour ?
        action: v.optional(v.union(     // Dernière action effectuée par le joueur
            v.literal("fold"),              // Se coucher
            v.literal("check"),             // Checker (mise à 0)
            v.literal("call"),              // Suivre la mise
            v.literal("bet"),               // Miser
            v.literal("raise"),             // Relancer
            v.literal("all-in")             // Tapis (miser tous ses jetons)
        )),
        isAllIn: v.boolean(),           // Le joueur est-il all-in ?
        isFolded: v.boolean(),          // Le joueur s'est-il couché ?
        joinedAt: v.number(),           // Timestamp de quand le joueur a rejoint cette partie
    })
        .index("by_game", ["gameId"])           // Index pour récupérer tous les joueurs d'une partie
        .index("by_user", ["userId"])           // Index pour récupérer toutes les parties d'un joueur
        .index("by_game_user", ["gameId", "userId"]) // Index composé pour un joueur dans une partie
        .index("by_game_position", ["gameId", "position"]), // Index pour l'ordre des joueurs à table

    // TABLE CHAT - Stocke les messages de chat pendant les parties
    chat: defineTable({
        gameId: v.id("games"),          // Référence à la partie où le message a été envoyé
        userId: v.id("users"),          // Référence au joueur qui a envoyé le message
        username: v.string(),           // Nom d'utilisateur (dénormalisé pour éviter les jointures)
        message: v.string(),            // Contenu du message
        timestamp: v.number(),          // Timestamp d'envoi du message
    })
        .index("by_game", ["gameId"])       // Index pour récupérer tous les messages d'une partie
        .index("by_game_timestamp", ["gameId", "timestamp"]), // Index pour trier les messages par date

    // TABLE GAME_HISTORY - Stocke l'historique des parties terminées pour chaque joueur
    gameHistory: defineTable({
        gameId: v.id("games"),          // Référence à la partie jouée
        userId: v.id("users"),          // Référence au joueur
        startingChips: v.number(),      // Nombre de jetons au début de la partie
        endingChips: v.number(),        // Nombre de jetons à la fin de la partie
        profit: v.number(),             // Gain/perte net (endingChips - startingChips)
        handsPlayed: v.number(),        // Nombre de mains jouées dans cette partie
        finalPosition: v.number(),      // Position finale dans le classement (1er, 2ème, etc.)
        buyInAmount: v.number(),        // Montant d'entrée payé pour rejoindre la partie
        result: v.union(                // Résultat de la partie pour ce joueur
            v.literal("win"),               // Victoire
            v.literal("lose"),              // Défaite
            v.literal("draw")               // Égalité (rare au poker)
        ),
        playedAt: v.number(),           // Timestamp de fin de partie
        gameDuration: v.number(),       // Durée de la partie en minutes
    })
        .index("by_game", ["gameId"])       // Index pour récupérer tous les résultats d'une partie
        .index("by_user", ["userId"])       // Index pour l'historique d'un joueur
        .index("by_user_date", ["userId", "playedAt"]), // Index pour l'historique chronologique d'un joueur

    // TABLE HANDS - Stocke les détails de chaque main jouée
    hands: defineTable({
        gameId: v.id("games"),          // Référence à la partie
        handNumber: v.number(),         // Numéro de la main dans la partie (1, 2, 3...)
        winners: v.array(v.object({     // Gagnants de cette main (peut y en avoir plusieurs)
            userId: v.id("users"),          // ID du joueur gagnant
            amount: v.number(),             // Montant gagné par ce joueur
            handRank: v.string(),           // Force de la main ("royal flush", "pair", etc.)
        })),
        potAmount: v.number(),          // Montant total du pot principal
        sidePots: v.array(v.object({    // Pots secondaires distribués
            amount: v.number(),             // Montant de ce pot secondaire
            eligiblePlayers: v.array(v.id("users")), // Joueurs éligibles pour ce pot
            winner: v.id("users"),          // Gagnant de ce pot secondaire
        })),
        communityCards: v.array(v.string()), // Cartes communes révélées pour cette main
        playerActions: v.array(v.object({ // Historique de toutes les actions des joueurs
            userId: v.id("users"),          // Joueur qui a effectué l'action
            action: v.string(),             // Type d'action ("bet", "call", "fold", etc.)
            amount: v.number(),             // Montant misé (0 pour check/fold)
            round: v.string(),              // Tour où l'action a eu lieu ("preflop", "flop", etc.)
        })),
        createdAt: v.number(),          // Timestamp de début de la main
        completedAt: v.optional(v.number()), // Timestamp de fin de la main
    })
        .index("by_game", ["gameId"])       // Index pour récupérer toutes les mains d'une partie
        .index("by_game_hand", ["gameId", "handNumber"]), // Index pour récupérer une main spécifique

    // TABLE STRUCTURES - Stocke les structures de blindes pour les tournois
    structures: defineTable({
        name: v.string(), // Nom de la structure (ex: "normal", "turbo", "hyper")
        blindDuration: v.number(), // Durée d'un niveau de blind (en minutes ou secondes)
        blindLevels: v.array(
            v.object({
                level: v.number(),           // Numéro du niveau
                smallBlind: v.number(),      // Montant de la petite blinde
                bigBlind: v.number(),        // Montant de la grosse blinde
                ante: v.optional(v.number()),// Ante optionnel
            })
        ),
        createdAt: v.number(), // Timestamp de création de la structure
    }),
});