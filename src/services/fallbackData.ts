import { Match, Player } from "../types";

export const FALLBACK_MATCHES: Match[] = [
  {
    id: "ipl-2026-01",
    team1: "CSK",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png",
    team2: "MI",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png",
    date: new Date().toISOString(),
    venue: "MA Chidambaram Stadium, Chennai",
    status: "live",
    series: "TATA IPL 2026",
    lineupsOut: true
  },
  {
    id: "ipl-2026-02",
    team1: "RCB",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Royal_Challengers_Bangalore_Logo.svg/1200px-Royal_Challengers_Bangalore_Logo.svg.png",
    team2: "KKR",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png",
    date: new Date(Date.now() + 86400000).toISOString(),
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    status: "upcoming",
    series: "TATA IPL 2026",
    lineupsOut: false
  },
  {
    id: "ipl-2026-03",
    team1: "GT",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png",
    team2: "RR",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/1200px-Rajasthan_Royals_Logo.svg.png",
    date: new Date(Date.now() + 172800000).toISOString(),
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "upcoming",
    series: "TATA IPL 2026",
    lineupsOut: false
  }
];

export const getFallbackSquad = (team1: string, team2: string): Player[] => {
  const players: Player[] = [];
  const teams = [team1, team2];
  
  teams.forEach(team => {
    const isCSK = team === 'CSK';
    const isMI = team === 'MI';
    
    // Add some realistic players if it's CSK or MI
    if (isCSK) {
       players.push(
         { id: 'csk-1', name: 'Ruturaj Gaikwad', team: 'CSK', position: 'BAT', credits: 10.5, playing: true, points: 45, selectedBy: 85 },
         { id: 'csk-2', name: 'MS Dhoni', team: 'CSK', position: 'WK', credits: 9.0, playing: true, points: 20, selectedBy: 92 },
         { id: 'csk-3', name: 'Ravindra Jadeja', team: 'CSK', position: 'AR', credits: 10.0, playing: true, points: 60, selectedBy: 88 },
         { id: 'csk-4', name: 'Matheesha Pathirana', team: 'CSK', position: 'BOWL', credits: 9.5, playing: true, points: 30, selectedBy: 75 },
         { id: 'csk-5', name: 'Shivam Dube', team: 'CSK', position: 'BAT', credits: 9.0, playing: true, points: 40, selectedBy: 70 }
       );
    } else if (isMI) {
        players.push(
          { id: 'mi-1', name: 'Hardik Pandya', team: 'MI', position: 'AR', credits: 10.5, playing: true, points: 50, selectedBy: 80 },
          { id: 'mi-2', name: 'Rohit Sharma', team: 'MI', position: 'BAT', credits: 10.0, playing: true, points: 35, selectedBy: 85 },
          { id: 'mi-3', name: 'Jasprit Bumrah', team: 'MI', position: 'BOWL', credits: 11.0, playing: true, points: 70, selectedBy: 95 },
          { id: 'mi-4', name: 'Suryakumar Yadav', team: 'MI', position: 'BAT', credits: 10.5, playing: true, points: 55, selectedBy: 90 },
          { id: 'mi-5', name: 'Ishan Kishan', team: 'MI', position: 'WK', credits: 9.0, playing: true, points: 25, selectedBy: 65 }
        );
    }
    
    // Fill the rest with generic high quality names for the demo
    const roles: ('WK' | 'BAT' | 'AR' | 'BOWL')[] = ['WK', 'BAT', 'BAT', 'BAT', 'AR', 'AR', 'BOWL', 'BOWL', 'BOWL', 'BOWL', 'BOWL'];
    roles.forEach((role, i) => {
       if (players.filter(p => p.team === team).length < 11) {
          players.push({
            id: `${team.toLowerCase()}-p-${i}`,
            name: `${team} Player ${i + 1}`,
            team: team,
            position: role,
            credits: 8.0 + Math.random() * 2,
            playing: Math.random() > 0.3,
            points: Math.floor(Math.random() * 50),
            selectedBy: Math.floor(Math.random() * 40) + 10
          });
       }
    });
  });
  
  return players;
};
