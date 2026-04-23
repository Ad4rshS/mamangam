import { GoogleGenAI } from "@google/genai";
import { Match, Player } from "../types";
import { FALLBACK_MATCHES, getFallbackSquad } from "./fallbackData";

// Support both VITE_GEMINI_API_KEY (Vite standard) and GEMINI_API_KEY
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

// Helper: extract JSON from a text response that may have markdown fences
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
 * Fetches match data using Gemini 2.0 Flash with Google Search grounding.
 * Falls back to realistic static data if API call fails.
 */
export async function fetchIPLMatches(): Promise<Match[]> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are a cricket data expert. Search and retrieve the official TATA IPL 2026 schedule.
Return a JSON array (no markdown, no explanation — raw JSON only) of at least 10 upcoming/live matches.
Each object must have exactly these fields:
- id: string (e.g. "ipl-2026-m01")
- team1: string (full team name e.g. "Chennai Super Kings")
- team1Logo: string (Wikipedia SVG URL or empty string)
- team2: string
- team2Logo: string
- date: string (ISO-8601 format)
- venue: string
- status: string — one of: "upcoming", "live", "completed"
- series: string (e.g. "TATA IPL 2026")
- lineupsOut: boolean (true ONLY if official Playing XI announced within last 30 min before match)

Return ONLY the JSON array, nothing else.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const raw = response.text ?? "";
      if (raw) {
        const cleaned = extractJSON(raw);
        const matches: Match[] = JSON.parse(cleaned);
        if (Array.isArray(matches) && matches.length > 0) {
          return matches.map(m => ({
            ...m,
            date: isNaN(new Date(m.date).getTime()) ? new Date().toISOString() : m.date
          }));
        }
      }
    } catch (error) {
      console.warn("Gemini match fetch failed, using fallback:", error);
    }
  }

  return FALLBACK_MATCHES;
}

/**
 * Fetches squad data using Gemini 2.0 Flash with Google Search grounding.
 */
export async function fetchSquads(matchId: string, team1: string, team2: string): Promise<Player[]> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are a cricket expert. Search the current IPL 2026 squads for: ${team1} vs ${team2}.
Return a JSON array (raw JSON only, no markdown) of all players from both squads (around 30 players total).
Each object must have exactly these fields:
- id: string (unique, e.g. "csk-virat-kohli")
- name: string (player full name)
- team: string (team name, same as provided)
- position: string — one of: "WK", "BAT", "AR", "BOWL"
- credits: number (between 8.0 and 12.0)
- playing: boolean (true if expected in Playing XI)

Return ONLY the JSON array.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const raw = response.text ?? "";
      if (raw) {
        const cleaned = extractJSON(raw);
        const data = JSON.parse(cleaned);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((p: any) => ({
            ...p,
            id: p.id || `${p.team}-${p.name}`.toLowerCase().replace(/\s+/g, '-'),
            points: Math.floor(Math.random() * 60) + 10,
            selectedBy: Math.floor(Math.random() * 60) + 15
          }));
        }
      }
    } catch (error) {
      console.warn("Gemini squad fetch failed, using fallback:", error);
    }
  }

  return getFallbackSquad(team1, team2);
}

/**
 * Fetches live score using Gemini 2.0 Flash with Google Search grounding.
 */
export async function fetchLiveScore(matchId: string, team1: string, team2: string) {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Search for the current live score of IPL 2026 match: ${team1} vs ${team2}.
Return a JSON object (raw JSON only) with:
- score1: string (e.g. "${team1} 178/4 (18.2 ov)")
- score2: string (e.g. "${team2} 142/3 (16.0 ov)")  
- overs: string
- summary: string (match situation in one sentence)
- batters: array of {name, runs, balls}
- bowlers: array of {name, wickets, overs}`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const raw = response.text ?? "";
      if (raw) {
        const cleaned = extractJSON(raw);
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn("Live score fetch failed:", e);
    }
  }

  // Simulated fallback
  return {
    score1: `${team1} 178/4 (18.2 ov)`,
    score2: `${team2} 142/3 (16.0 ov)`,
    overs: "16.0 overs",
    summary: `${team2} needs 37 runs in 20 balls`,
    batters: [
      { name: "S. Yadav", runs: 54, balls: 32 },
      { name: "H. Pandya", runs: 12, balls: 8 }
    ],
    bowlers: [
      { name: "R. Jadeja", wickets: 2, overs: 4 }
    ]
  };
}
