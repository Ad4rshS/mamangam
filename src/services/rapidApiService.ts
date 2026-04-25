import { Match, Player, PlayerPosition } from "../types";
import { FALLBACK_MATCHES, getFallbackSquad } from "./fallbackData";

const getApiKey = () => {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('RAPID_API_KEY') : null;
  const envKey = import.meta.env.VITE_RAPID_API_KEY;
  return localKey || envKey || "d79ab6f4d1msh097a89b905609b3p15b02bjsn294b666a0243";
};

const getApiHost = () => {
  const envHost = import.meta.env.VITE_RAPIDAPI_HOST;
  return envHost || "cricbuzz-cricket.p.rapidapi.com";
};

const API_KEY = getApiKey();
const API_HOST = getApiHost();
const BASE_URL = `https://${API_HOST}`;

const headers = {
  "x-rapidapi-key": API_KEY,
  "x-rapidapi-host": API_HOST,
};

/**
 * Fetch upcoming matches from RapidAPI (Cricbuzz)
 */
export async function fetchRapidMatches(): Promise<Match[]> {
  try {
    const response = await fetch(`${BASE_URL}/matches/v1/upcoming`, { headers });
    if (!response.ok) throw new Error("RapidAPI Error");
    
    const data = await response.json();
    const matches: Match[] = [];
    
    if (data.typeMatches) {
      data.typeMatches.forEach((type: any) => {
        if (type.seriesMatches) {
          type.seriesMatches.forEach((series: any) => {
            if (series.seriesAdWrapper && series.seriesAdWrapper.matches) {
              series.seriesAdWrapper.matches.forEach((m: any) => {
                const matchInfo = m.matchInfo;
                if (!matchInfo) return;

                matches.push({
                  id: matchInfo.matchId.toString(),
                  team1: matchInfo.team1.teamName,
                  team1Logo: matchInfo.team1.imageId ? `https://static.cricbuzz.com/a/img/v1/100x100/i1/c${matchInfo.team1.imageId}/i.jpg` : "",
                  team2: matchInfo.team2.teamName,
                  team2Logo: matchInfo.team2.imageId ? `https://static.cricbuzz.com/a/img/v1/100x100/i1/c${matchInfo.team2.imageId}/i.jpg` : "",
                  date: new Date(parseInt(matchInfo.startDate)).toISOString(),
                  venue: matchInfo.venueInfo ? `${matchInfo.venueInfo.ground}, ${matchInfo.venueInfo.city}` : "TBA",
                  status: 'upcoming',
                  series: matchInfo.seriesName,
                  lineupsOut: false
                });
              });
            }
          });
        }
      });
    }
    
    return matches.length > 0 ? matches : FALLBACK_MATCHES;
  } catch (error) {
    console.error("RapidAPI fetch matches failed:", error);
    return FALLBACK_MATCHES;
  }
}

/**
 * Fetch squad for a specific match
 */
export async function fetchRapidSquads(matchId: string): Promise<Player[]> {
  try {
    // Try to get match info which might contain squads or at least team names
    const response = await fetch(`${BASE_URL}/mcenter/v1/${matchId}/hscard`, { headers });
    if (!response.ok) throw new Error("RapidAPI Error");
    
    const data = await response.json();
    
    // If it's a live match, we might have players in scorecard
    if (data.scorecard && data.scorecard.length > 0) {
      // Logic to parse players from scorecard
    }

    // For now, use the fallback but try to use real team names from the data if available
    const matchName = data.appindex?.seotitle || "";
    const teams = matchName.split(" vs ");
    if (teams.length >= 2) {
      return getFallbackSquad(teams[0].trim(), teams[1].trim());
    }

    return getFallbackSquad("Team 1", "Team 2");
  } catch (error) {
    console.error("RapidAPI fetch squads failed:", error);
    return getFallbackSquad("Team 1", "Team 2");
  }
}

/**
 * Fetch Live Score
 */
export async function fetchRapidLiveScore(matchId: string) {
  try {
    const response = await fetch(`${BASE_URL}/mcenter/v1/${matchId}/hscard`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.scorecard && data.scorecard.length > 0) {
       const sc = data.scorecard[0];
       return {
         score1: `${sc.batTeamName} ${sc.runs}/${sc.wickets}`,
         score2: "", // Need to parse second team if available
         overs: `${sc.overs}`,
         summary: data.status,
         batters: [],
         bowlers: []
       };
    }
    return null;
  } catch (e) {
    return null;
  }
}
