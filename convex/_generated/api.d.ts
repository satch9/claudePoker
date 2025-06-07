/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as chat from "../chat.js";
import type * as files from "../files.js";
import type * as gamehistory from "../gamehistory.js";
import type * as games from "../games.js";
import type * as hands from "../hands.js";
import type * as players from "../players.js";
import type * as structures from "../structures.js";
import type * as types from "../types.js";
import type * as users from "../users.js";
import type * as utils_cardUtils from "../utils/cardUtils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authActions: typeof authActions;
  chat: typeof chat;
  files: typeof files;
  gamehistory: typeof gamehistory;
  games: typeof games;
  hands: typeof hands;
  players: typeof players;
  structures: typeof structures;
  types: typeof types;
  users: typeof users;
  "utils/cardUtils": typeof utils_cardUtils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
