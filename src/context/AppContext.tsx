import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserTeam, Contest, Match, Player } from '../types';
import { fetchIPLMatches, fetchSquads } from '../services/geminiService';
import { fetchRapidMatches, fetchRapidSquads } from '../services/rapidApiService';
import { MATCHES as MOCK_MATCHES, PLAYERS as MOCK_PLAYERS } from '../constants/mockData';

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  matches: Match[];
  players: Record<string, Player[]>;
  userTeams: UserTeam[];
  saveTeam: (team: UserTeam) => void;
  contests: Contest[];
  createContest: (contest: Contest) => void;
  joinContest: (contestId: string, teamId: string) => void;
  refreshData: () => Promise<void>;
  fetchMatchSquads: (matchId: string, team1: string, team2: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [players, setPlayers] = useState<Record<string, Player[]>>(MOCK_PLAYERS);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);

  const fetchMatchSquads = async (matchId: string, team1: string, team2: string) => {
    try {
      const hasRapidKey = !!localStorage.getItem('RAPID_API_KEY');
      const squad = hasRapidKey 
        ? await fetchRapidSquads(matchId) 
        : await fetchSquads(matchId, team1, team2);
        
      if (squad && squad.length > 0) {
        setPlayers(prev => ({ ...prev, [matchId]: squad }));
      }
    } catch (err) {
      console.error("Squad fetch failed", err);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const hasRapidKey = !!localStorage.getItem('RAPID_API_KEY');
      
      console.log(`📡 MamanGam: Fetching matches via ${hasRapidKey ? 'RapidAPI' : 'Gemini'}...`);
      
      const realMatches = hasRapidKey 
        ? await fetchRapidMatches() 
        : await fetchIPLMatches();

      if (realMatches && realMatches.length > 0) {
        setMatches(realMatches);
        
        // Fetch squads for these matches concurrently
        const squadPromises = realMatches.slice(0, 3).map(match => {
          if (hasRapidKey) {
            return fetchRapidSquads(match.id).then(squad => ({ id: match.id, squad }));
          } else {
            return fetchSquads(match.id, match.team1, match.team2).then(squad => ({ id: match.id, squad }));
          }
        });
        
        const results = await Promise.all(squadPromises);
        setPlayers(prev => {
          const next = { ...prev };
          results.forEach(({ id, squad }) => {
            if (squad && squad.length > 0) next[id] = squad;
          });
          return next;
        });
      }
    } catch (err) {
      console.warn("Could not fetch real-time data, using fallback.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load from localStorage
    const savedUser = localStorage.getItem('mamangam_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Simulate anonymous user for demo
      const anonUser: UserProfile = {
        uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        name: 'Mamangam Hero',
        balance: 1000,
      };
      setUser(anonUser);
    }

    const savedTeams = localStorage.getItem('mamangam_teams');
    if (savedTeams) setUserTeams(JSON.parse(savedTeams));

    const savedContests = localStorage.getItem('mamangam_contests');
    if (savedContests) setContests(JSON.parse(savedContests));

    // Try to fetch real data
    refreshData().finally(() => setLoading(false));
  }, []);

  const saveTeam = (team: UserTeam) => {
    setUserTeams(prev => {
      const index = prev.findIndex(t => t.id === team.id);
      let updated;
      if (index !== -1) {
        updated = [...prev];
        updated[index] = team;
      } else {
        updated = [...prev, team];
      }
      localStorage.setItem('mamangam_teams', JSON.stringify(updated));
      return updated;
    });
  };

  const createContest = (contest: Contest) => {
    const updated = [...contests, contest];
    setContests(updated);
    localStorage.setItem('mamangam_contests', JSON.stringify(updated));
  };

  const joinContest = (contestId: string, teamId: string) => {
    if (!user) return;
    setContests(prev => {
      const next = prev.map(c => {
        if (c.id === contestId && !c.joinedUsers.includes(user.uid)) {
          return { 
            ...c, 
            joinedUsers: [...c.joinedUsers, user.uid],
            joinedTeamIds: { ...(c.joinedTeamIds || {}), [user.uid]: teamId }
          };
        }
        return c;
      });
      localStorage.setItem('mamangam_contests', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ user, loading, setUser, matches, players, userTeams, saveTeam, contests, createContest, joinContest, refreshData, fetchMatchSquads }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
