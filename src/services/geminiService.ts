import { GoogleGenAI } from "@google/genai";
import { Match, Player } from "../types";
import { FALLBACK_MATCHES, getFallbackSquad } from "./fallbackData";

// Support both VITE_GEMINI_API_KEY (Vite standard) and GEMINI_API_KEY
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai: any = geminiKey ? new GoogleGenAI(geminiKey) : null;

if (ai) {
  console.log("🚀 MamanGam: Gemini AI Service initialized.");
}

// Helper: Sleep to avoid rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: extract JSON from a text response
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  const objStart = text.indexOf('{');
  const objEnd = text.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1) return text.slice(objStart, objEnd + 1);
  return text.trim();
}

/**
 * Fetches match data using Gemini 2.0 Flash (Free Tier Optimized).
 */
export async function fetchIPLMatches(): Promise<Match[]> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are an IPL 2026 expert. Provide a JSON array of 8 upcoming matches for TATA IPL 2026.
Return ONLY a raw JSON array of objects with these fields:
- id: string (unique)
- team1: string (full name)
- team1Logo: string (Wikipedia SVG URL)
- team2: string
- team2Logo: string
- date: string (ISO-8601, use dates in April/May 2026)
- venue: string
- status: "upcoming"
- series: "TATA IPL 2026"
- lineupsOut: false`
      });

      const raw = response.text ?? "";
      if (raw) {
        const cleaned = extractJSON(raw);
        const matches: Match[] = JSON.parse(cleaned);
        return matches;
      }
    } catch (error) {
      console.warn("Gemini match fetch failed:", error);
    }
  }
  return FALLBACK_MATCHES;
}

/**
 * Fetches squad data with rate-limit protection.
 */
export async function fetchSquads(matchId: string, team1: string, team2: string): Promise<Player[]> {
  if (ai) {
    try {
      // Small delay to prevent 429
      await sleep(1500); 

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `List the expected playing XI squads for IPL 2026 match: ${team1} vs ${team2}.
Return ONLY a raw JSON array of objects with:
- id: string (unique)
- name: string
- team: string
- position: "WK" | "BAT" | "AR" | "BOWL"
- credits: number (8-12)
- playing: true`
      });

      const raw = response.text ?? "";
      if (raw) {
        const cleaned = extractJSON(raw);
        const data = JSON.parse(cleaned);
        return data.map((p: any) => ({
          ...p,
          points: Math.floor(Math.random() * 60),
          selectedBy: Math.floor(Math.random() * 70) + 10
        }));
      }
    } catch (error) {
      console.warn("Gemini squad fetch failed:", error);
    }
  }
  return getFallbackSquad(team1, team2);
}

/**
 * Fetches live score.
 */
export async function fetchLiveScore(matchId: string, team1: string, team2: string) {
  if (ai) {
    try {
      await sleep(500);
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate a realistic live score for ${team1} vs ${team2} as if it's currently happening. 
Return ONLY raw JSON: { "score1": "...", "score2": "...", "overs": "...", "summary": "...", "batters": [...], "bowlers": [...] }`
      });
      const raw = response.text ?? "";
      if (raw) return JSON.parse(extractJSON(raw));
    } catch (e) {}
  }
  return {
    score1: `${team1} 178/4`,
    score2: `${team2} 142/3`,
    overs: "16.4 overs",
    summary: `${team2} needs 37 runs in 20 balls`,
    batters: [{ name: "S. Yadav", runs: 54, balls: 32 }, { name: "H. Pandya", runs: 12, balls: 8 }],
    bowlers: [{ name: "R. Jadeja", wickets: 2, overs: 4 }]
  };
}
