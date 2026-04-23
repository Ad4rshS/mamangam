import React from 'react';
import { motion } from 'motion/react';
import { X, User } from 'lucide-react';
import { Player, PlayerPosition } from '../types';
import { cn } from '../lib/utils';

interface TeamPreviewProps {
  players: Player[];
  captainId: string | null;
  viceCaptainId: string | null;
  onClose: () => void;
  team1: string;
  team2: string;
}

const PositionGroup: React.FC<{ 
  players: Player[], 
  label: string, 
  captainId: string | null, 
  viceCaptainId: string | null 
}> = ({ players, label, captainId, viceCaptainId }) => {
  if (players.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 w-full px-2">
        {players.map((player) => (
          <div key={player.id} className="flex flex-col items-center gap-1 w-16 relative">
            {/* Player Avatar */}
            <div className="relative">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg overflow-hidden",
                player.team === 'CSK' || player.team === 'MI' ? "bg-white" : "bg-dark-card",
                player.team === 'CSK' ? "border-yellow-500" : player.team === 'MI' ? "border-blue-600" : "border-brand-red"
              )}>
                {player.image ? (
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Roles (C/VC) */}
              {player.id === captainId && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border border-white flex items-center justify-center text-[8px] font-black text-white shadow-lg z-10">C</div>
              )}
              {player.id === viceCaptainId && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-black flex items-center justify-center text-[8px] font-black text-black shadow-lg z-10">VC</div>
              )}
              {/* Playing XI Indicator */}
              {player.playing && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-green-500 rounded-full border border-dark-bg z-10" />
              )}
            </div>

            {/* Name Label */}
            <div className={cn(
              "px-1.5 py-0.5 rounded text-[8px] font-bold text-center whitespace-nowrap min-w-[50px] shadow-sm truncate",
              player.team === 'CSK' ? "bg-yellow-500 text-black" : "bg-black text-white"
            )}>
              {player.name.split(' ').pop()}
            </div>
            
            {/* Points/Credits if needed */}
            <div className="text-[7px] text-white/80 font-bold opacity-80">{player.credits} Cr</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TeamPreview({ players, captainId, viceCaptainId, onClose, team1, team2 }: TeamPreviewProps) {
  const wk = players.filter(p => p.position === 'WK');
  const bat = players.filter(p => p.position === 'BAT');
  const ar = players.filter(p => p.position === 'AR');
  const bowl = players.filter(p => p.position === 'BOWL');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 flex flex-col"
    >
      <header className="p-4 flex items-center justify-between text-white border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-bold text-sm uppercase tracking-tight">Team Preview</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{team1} vs {team2}</p>
          </div>
        </div>
      </header>

      {/* Cricket Field Layout */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Field Background */}
        <div className="absolute inset-0 bg-[#1e4a1e]">
          {/* Pitch */}
          <div className="absolute inset-x-12 inset-y-8 border-2 border-white/20 rounded-[100px]" />
          <div className="absolute inset-x-24 inset-y-16 border-2 border-white/10 rounded-[100px]" />
          
          {/* Grass Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)' 
            }} 
          />
          
          {/* Center Pitch */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-32 bg-[#d4b08c] rotate-90 opacity-40 rounded-sm" />
        </div>

        {/* Player Positions */}
        <div className="relative z-10 flex-1 flex flex-col justify-around py-8 overflow-y-auto">
          <PositionGroup players={wk} label="WK" captainId={captainId} viceCaptainId={viceCaptainId} />
          <PositionGroup players={bat} label="BAT" captainId={captainId} viceCaptainId={viceCaptainId} />
          <PositionGroup players={ar} label="AR" captainId={captainId} viceCaptainId={viceCaptainId} />
          <PositionGroup players={bowl} label="BOWL" captainId={captainId} viceCaptainId={viceCaptainId} />
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span className="text-[9px] font-bold text-white uppercase">{team1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-black rounded-sm border border-white/20" />
              <span className="text-[9px] font-bold text-white uppercase">{team2}</span>
            </div>
          </div>
          <div className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">Mamangam Preview</div>
        </div>
      </div>
    </motion.div>
  );
}
