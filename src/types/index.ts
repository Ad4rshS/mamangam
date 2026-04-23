export type PlayerPosition = 'WK' | 'BAT' | 'AR' | 'BOWL';

export interface Player {
  id: string;
  name: string;
  team: string;
  position: PlayerPosition;
  credits: number;
  points: number;
  selectedBy: number; // percentage
  image?: string;
  playing?: boolean; // confirmed XI
}

export interface Match {
  id: string;
  team1: string;
  team1Logo: string;
  team2: string;
  team2Logo: string;
  date: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  series: string;
  pitchReport?: string;
  weather?: string;
  lineupsOut?: boolean;
}

export interface UserTeam {
  id: string;
  matchId: string;
  userId: string;
  name: string;
  players: string[]; // player IDs
  captainId: string;
  viceCaptainId: string;
  createdAt: number;
}

export interface Contest {
  id: string;
  matchId: string;
  creatorId: string;
  name: string;
  entryFee: number;
  capacity: number;
  joinedUsers: string[];
  joinedTeamIds?: Record<string, string>; // userId -> teamId
}

export interface UserProfile {
  uid: string;
  name: string;
  photoURL?: string;
  whatsapp?: string;
  balance: number;
}
