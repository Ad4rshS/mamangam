import { Match, Player } from "../types";
import { FALLBACK_MATCHES, getFallbackSquad } from "./fallbackData";

const getApiKey = () => {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
  return localKey || import.meta.env.VITE_GEMINI_API_KEY;
};

const API_KEY = getApiKey();
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

if (API_KEY) {
  console.log(`🚀 MamanGam: API Key detected (${API_KEY.startsWith('AIza') ? 'Real' : 'Custom'}). Fetching live data...`);
} else {
  console.error("⚠️ MamanGam: No API Key found. Using fallback data.");
}

// Helper: Sleep to avoid rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Extract JSON from Gemini response
function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const cleaned = text.replace(/```json\s*|\s*```|```\s*/g, "").trim();
  
  // Find the first [ or { and the last ] or }
  const startIdx = Math.min(
    cleaned.indexOf("[") === -1 ? Infinity : cleaned.indexOf("["),
    cleaned.indexOf("{") === -1 ? Infinity : cleaned.indexOf("{")
  );
  const endIdx = Math.max(
    cleaned.lastIndexOf("]"),
    cleaned.lastIndexOf("}")
  );

  if (startIdx !== Infinity && endIdx !== -1) {
    return cleaned.slice(startIdx, endIdx + 1);
  }
  return cleaned;
}

/**
 * Direct Fetch call to Gemini API
 */
async function callGemini(prompt: string) {
  if (!API_KEY) return null;

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Gemini API Error");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function fetchIPLMatches(): Promise<Match[]> {
  try {
    const prompt = `You are an IPL 2026 expert. Provide a JSON array of 8 upcoming matches for TATA IPL 2026.
    Return ONLY a raw JSON array of objects with:
    - id, team1, team1Logo, team2, team2Logo, date (ISO-8601), venue, status: "upcoming", series: "TATA IPL 2026", lineupsOut: false`;
    
    const text = await callGemini(prompt);
    if (text) return JSON.parse(extractJSON(text));
  } catch (error) {
    console.warn("Match fetch failed:", error);
  }
  return FALLBACK_MATCHES;
}

export async function fetchSquads(matchId: string, team1: string, team2: string): Promise<Player[]> {
  try {
    await sleep(1500); // Rate limit protection
    const prompt = `List the expected playing XI squads for IPL 2026: ${team1} vs ${team2}.
    Return ONLY a raw JSON array of objects with:
    - id, name, team, position: "WK"|"BAT"|"AR"|"BOWL", credits (8-12), playing: true`;
    
    const text = await callGemini(prompt);
    if (text) {
      const data = JSON.parse(extractJSON(text));
      return data.map((p: any) => ({
        ...p,
        points: Math.floor(Math.random() * 60),
        selectedBy: Math.floor(Math.random() * 70) + 10
      }));
    }
  } catch (error) {
    console.warn("Squad fetch failed:", error);
  }
  return getFallbackSquad(team1, team2);
}

export async function fetchLiveScore(matchId: string, team1: string, team2: string) {
  try {
    await sleep(500);
    const prompt = `Generate a realistic live score for ${team1} vs ${team2} in IPL 2026. 
    Return ONLY raw JSON: { "score1", "score2", "overs", "summary", "batters": [], "bowlers": [] }`;
    
    const text = await callGemini(prompt);
    if (text) return JSON.parse(extractJSON(text));
  } catch (e) {}
  return {
    score1: `${team1} ${140 + Math.floor(Math.random() * 60)}/${2 + Math.floor(Math.random() * 5)}`,
    score2: `${team2} ${120 + Math.floor(Math.random() * 60)}/${3 + Math.floor(Math.random() * 4)}`,
    overs: `${15 + Math.floor(Math.random() * 4)}.${Math.floor(Math.random() * 6)} overs`,
    summary: `${team2} needs ${20 + Math.floor(Math.random() * 30)} runs in ${18 + Math.floor(Math.random() * 12)} balls`,
    batters: [
      { name: "Top Batter", runs: 40 + Math.floor(Math.random() * 30), balls: 25 + Math.floor(Math.random() * 15) },
      { name: "Middle Order", runs: 10 + Math.floor(Math.random() * 20), balls: 8 + Math.floor(Math.random() * 10) }
    ],
    bowlers: [{ name: "Lead Bowler", wickets: Math.floor(Math.random() * 3), overs: 4 }]
  };
}
