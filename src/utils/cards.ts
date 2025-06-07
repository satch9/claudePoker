// src/utils/cards.ts
export function normalizeCardCode(code: string): string {
    if (code.includes("_")) {
        const [rank, suit] = code.split("_");
        const suitMap: Record<string, string> = {
            diamond: "d",
            spade: "s",
            heart: "h",
            club: "c",
        };
        return rank + (suitMap[suit] || "?");
    }
    return code;
}
