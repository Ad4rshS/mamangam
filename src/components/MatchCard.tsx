import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Info } from 'lucide-react';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const formatMatchDate = (dateStr: string) => {
    if (!dateStr) return "TBD";
    const matchDate = new Date(dateStr);
    
    if (isNaN(matchDate.getTime())) {
      // Try parsing common formats if simple New Date fails
      return "Upcoming";
    }

    const now = new Date();
    const isToday = matchDate.toDateString() === now.toDateString();
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();
    
    const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    
    return matchDate.toLocaleDateString([], { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
  };

  const getTimeLeft = (dateStr: string) => {
    if (!dateStr) return "Scheduled";
    const matchTime = new Date(dateStr).getTime();
    if (isNaN(matchTime)) return "Scheduled";

    const diff = matchTime - new Date().getTime();
    if (diff <= 0) return 'Live Now';
    
    const totalMins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m left`;
  };

  const matchDate = formatMatchDate(match.date);
  const timeLeft = getTimeLeft(match.date);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-dark-card border border-dark-border rounded-xl overflow-hidden card-shadow cursor-pointer hover:border-brand-red/50 transition-colors"
    >
      {/* Match Header */}
      <div className="px-4 py-2 bg-white/5 border-b border-dark-border flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{match.series}</span>
        <Info className="w-3.5 h-3.5 text-gray-500" />
      </div>

      {/* Match Body */}
      <div className="p-4 py-6 flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
             {match.team1Logo ? <img src={match.team1Logo} alt={match.team1} className="w-10 h-10 object-contain" /> : <span className="font-bold text-lg">{match.team1}</span>}
          </div>
          <span className="font-bold text-sm">{match.team1}</span>
        </div>

        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <span className="text-brand-red font-bold text-xs uppercase bg-brand-red/10 px-2 rounded-full mb-1">Upcoming</span>
          <span className="text-white text-[10px] font-black uppercase tracking-tighter text-center">{matchDate}</span>
          <span className="text-gray-500 text-[10px] font-medium tracking-tighter uppercase whitespace-nowrap">In {timeLeft}</span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
           <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
             {match.team2Logo ? <img src={match.team2Logo} alt={match.team2} className="w-10 h-10 object-contain" /> : <span className="font-bold text-lg">{match.team2}</span>}
          </div>
          <span className="font-bold text-sm">{match.team2}</span>
        </div>
      </div>

      {/* Match Footer */}
      <div className="px-4 py-2.5 bg-black/20 flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{match.venue.split(',')[0]}</span>
        </div>
        <div className="flex items-center gap-4">
          {match.lineupsOut && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 font-bold uppercase tracking-tighter">Lineups Out</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchCard;
