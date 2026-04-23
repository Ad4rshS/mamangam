import React from 'react';
import { Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Match } from '../types';
import MatchCard from './MatchCard';

interface MatchListProps {
  onMatchSelect: (match: Match) => void;
}

export default function MatchList({ onMatchSelect }: MatchListProps) {
  const { matches, refreshData, loading } = useApp();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Upcoming Matches</h2>
        <button 
          onClick={refreshData}
          className="text-xs text-brand-red font-medium flex items-center gap-1"
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>
      
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} onClick={() => onMatchSelect(match)} />
      ))}

      {/* Banner */}
      <div className="dream11-gradient rounded-xl p-4 mt-6 overflow-hidden relative shadow-lg">
        <div className="relative z-10">
          <h3 className="font-display font-bold text-lg mb-1 italic">FREE PRIVATE LEAGUES</h3>
          <p className="text-xs text-white/80 max-w-[200px]">Create your own league and challenge your friends for free!</p>
          <button className="mt-3 bg-white text-brand-red px-4 py-1.5 rounded-full text-xs font-bold shadow-md">CREATE NOW</button>
        </div>
        <div className="absolute right-[-20px] top-0 bottom-0 flex items-center opacity-20">
          <Trophy className="w-32 h-32 text-white" />
        </div>
      </div>
    </div>
  );
}
