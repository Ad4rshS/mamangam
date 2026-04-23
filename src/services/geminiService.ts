import { GoogleGenAI, Type } from "@google/genai";
import { Match, Player } from "../types";
import { FALLBACK_MATCHES, getFallbackSquad } from "./fallbackData";

// Only initialize if API key is provided
const geminiKey = process.env.GEMINI_API_KEY;
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

/**
 * Fetches match data. Uses Gemini if available, otherwise falls back to realistic simulation.
 */
export async function fetchIPLMatches(): Promise<Match[]> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `SEARCH AND RETRIEVE the official TATA IPL 2026 fixture list. 
        - Provide at least 15 upcoming matches.
        - Each match MUST have accurate team names, venue, and ISO-8601 date.
        - Set 'lineupsOut' to TRUE ONLY if the official Playing XI has been released (strictly 30 minutes before match start). Set to FALSE if lineups aren't officially confirmed yet.
        - Include official logo URLs for teams if available.
        - Map venues correctly to the fixture.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                team1: { type: Type.STRING },
                team1Logo: { type: Type.STRING },
                team2: { type: Type.STRING },
                team2Logo: { type: Type.STRING },
                date: { type: Type.STRING, description: "ISO-8601 formatted date string" },
                venue: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['upcoming', 'live', 'completed'] },
                series: { type: Type.STRING },
                lineupsOut: { type: Type.BOOLEAN }
              }
            }
          }
        }
      });

      if (response.text) {
        const matches: Match[] = JSON.parse(response.text);
        return matches.map(m => ({
          ...m,
          date: isNaN(new Date(m.date).getTime()) ? new Date().toISOString() : m.date
        }));
      }
    } catch (error) {
      console.warn("Gemini fetch failed, using realistic fallback matches.");
    }
  }

  // Final Fallback: Realistic Static Schedule
  return FALLBACK_MATCHES;
}

/**
 * Fetches squads. Uses Gemini if available, otherwise realistic fallback.
 */
export async function fetchSquads(matchId: string, team1: string, team2: string): Promise<Player[]> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search squads for IPL 2026: ${team1} vs ${team2}. Correct roles and credits.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                team: { type: Type.STRING },
                position: { type: Type.STRING, enum: ['WK', 'BAT', 'AR', 'BOWL'] },
                credits: { type: Type.NUMBER },
                playing: { type: Type.BOOLEAN }
              }
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        return data.map((p: any) => ({
          ...p,
          id: p.id || `${p.team}-${p.name}`.toLowerCase().replace(/\s+/g, '-'),
          points: Math.floor(Math.random() * 20),
          selectedBy: Math.floor(Math.random() * 50) + 10
        }));
      }
    } catch (error) {
      console.warn("Gemini squad fetch failed, using fallback.");
    }
  }

  return getFallbackSquad(team1, team2);
}

/**
 * Simulates or fetches live scores.
 */
export async function fetchLiveScore(matchId: string, team1: string, team2: string) {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Get live score for IPL 2026: ${team1} vs ${team2}.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      if (response.text) return JSON.parse(response.text);
    } catch (e) {}
  }

  // Simulated Live Score for Static Publishing
  return {
    score1: `${team1} 178/4`,
    score2: `${team2} 142/3`,
    overs: "16.4 overs",
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
