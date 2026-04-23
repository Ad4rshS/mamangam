import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Share2, Info, Trophy, Users, Plus, Zap } from 'lucide-react';
import { Match, UserTeam, Contest } from '../types';
import { useApp } from '../context/AppContext';
import { fetchLiveScore } from '../services/geminiService';
import { cn } from '../lib/utils';

interface MatchDetailsProps {
  match: Match;
  onBack: () => void;
  onCreateTeam: () => void;
  onCreateContest: () => void;
  onEditTeam: (team: UserTeam) => void;
}

export default function MatchDetails({ match, onBack, onCreateTeam, onCreateContest, onEditTeam }: MatchDetailsProps) {
  const { contests, userTeams, user, joinContest, players } = useApp();
  const [activeTab, setActiveTab] = useState<'contests' | 'my contests' | 'my teams' | 'stats'>('contests');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const matchContests = contests.filter(c => c.matchId === match.id);
  const myContests = matchContests.filter(c => c.joinedUsers.includes(user?.uid || ''));
  const myTeams = userTeams.filter(t => t.matchId === match.id);
  const [liveScore, setLiveScore] = useState<any>(null);

  useEffect(() => {
    if (match.status === 'live') {
      const getScore = async () => {
        const score = await fetchLiveScore(match.id, match.team1, match.team2);
        if (score) setLiveScore(score);
      };
      getScore();
      const interval = setInterval(getScore, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [match]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contests':
        return (
          <div className="space-y-4">
            {/* Action Button Section */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button onClick={onCreateTeam} className="bg-white/5 border border-white/10 hover:border-brand-red/50 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                <div className="w-10 h-10 rounded-full dream11-gradient flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Create Team</span>
              </button>
              <button onClick={onCreateContest} className="bg-white/5 border border-white/10 hover:border-brand-red/50 p-4 rounded-xl flex flex-col items-center gap-2 transition-all">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Create Contest</span>
              </button>
            </div>

            {/* Private Contests Header */}
            <div className="flex items-center justify-between pt-2">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Available Contests</h3>
            </div>

            {matchContests.length === 0 ? (
              <div className="bg-dark-card border border-dashed border-dark-border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 opacity-80">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <Trophy className="w-8 h-8 text-gray-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">No Private Contests Yet</h4>
                  <p className="text-[11px] text-gray-500 max-w-[200px]">Create a contest and invite your friends to start competing!</p>
                </div>
                <button onClick={onCreateContest} className="bg-brand-red text-white text-[11px] font-bold px-6 py-2 rounded-full shadow-lg shadow-brand-red/20 uppercase tracking-wider mt-2">
                  CREATE CONTEST
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {matchContests.map(c => (
                  <div key={c.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                    <div className="flex items-center justify-between">
                       <h4 className="font-bold text-xs text-white uppercase tracking-tight">{c.name}</h4>
                       <div className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded text-[9px] font-black uppercase">Free</div>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-bold uppercase">Prize Pool</span>
                          <span className="text-[10px] font-bold text-white tracking-widest">BRAGGING RIGHTS</span>
                       </div>
                       <div className="flex flex-col text-right">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Spots</span>
                          <span className="text-[10px] font-bold text-white">{c.joinedUsers.length} / {c.capacity}</span>
                       </div>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-red" style={{ width: `${(c.joinedUsers.length / c.capacity) * 100}%` }} />
                    </div>
                    {user && c.joinedUsers.includes(user.uid) ? (
                      <button disabled className="w-full border border-green-500/30 bg-green-500/10 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-green-500">
                        Joined
                      </button>
                    ) : (
                      <button 
                        onClick={() => joinContest(c.id)}
                        className="w-full border border-white/10 hover:border-brand-red bg-white/5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Join with Team
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'my contests':
        return (
          <div className="space-y-4">
            {myContests.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center flex flex-col items-center gap-3">
                 <Trophy className="w-10 h-10 text-gray-700" />
                 <p className="text-sm font-bold text-white">No joined contests</p>
                 <p className="text-[10px] text-gray-500 mb-2">Join a contest to see it here!</p>
                 <button onClick={() => setActiveTab('contests')} className="dream11-gradient px-6 py-2 rounded-full text-[10px] font-bold uppercase">View Contests</button>
              </div>
            ) : (
              myContests.map(c => (
                <div key={c.id} 
                  onClick={() => setSelectedContest(c)}
                  className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-lg flex flex-col gap-2 cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">{c.name}</span>
                    <span className="text-[9px] bg-green-500/20 text-green-500 px-1.5 rounded uppercase font-black tracking-tighter">Joined</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500 font-bold uppercase italic">Leaderboard Rank</span>
                    <span className="font-bold text-white tracking-widest">#1</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-1">
                    <div className="h-full bg-brand-red w-full" />
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'my teams':
        return (
          <div className="space-y-4">
            {myTeams.length === 0 ? (
              <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center flex flex-col items-center gap-3">
                 <Plus className="w-10 h-10 text-gray-700" />
                 <p className="text-sm font-bold text-white">No teams created</p>
                 <p className="text-[10px] text-gray-500 mb-2">Create a team to participate in contents!</p>
                 <button onClick={onCreateTeam} className="dream11-gradient px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-brand-red/20">Create Team</button>
              </div>
            ) : (
              myTeams.map(t => (
                <div key={t.id} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg group active:scale-[0.99] transition-transform">
                  <div className="p-4 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex flex-col gap-1">
                       <h4 className="font-bold text-xs uppercase tracking-tight">{t.name}</h4>
                       <span className="text-[9px] text-gray-500 font-black tracking-widest">Created at {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-brand-orange/20 border-2 border-dark-bg flex items-center justify-center text-[10px] font-bold">C</div>
                      <div className="w-7 h-7 rounded-full bg-brand-red/20 border-2 border-dark-bg flex items-center justify-center text-[10px] font-bold">VC</div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-white/[0.05] flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase italic">Players in squad: {t.players.length}</span>
                    <button 
                      onClick={() => onEditTeam(t)}
                      className="text-[9px] font-black text-brand-red uppercase tracking-widest hover:underline px-2 py-1"
                    >
                      View/Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-4 pb-12">
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 bg-white/5 border-b border-dark-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Player Statistics</span>
                <span className="text-[9px] text-brand-red font-black uppercase">Live Updates</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { name: 'Ruturaj Gaikwad', team: 'CSK', points: 124, selected: '92%' },
                  { name: 'Suryakumar Yadav', team: 'MI', points: 98, selected: '95%' },
                  { name: 'Jasprit Bumrah', team: 'MI', points: 76, selected: '98%' },
                  { name: 'Ravindra Jadeja', team: 'CSK', points: 85, selected: '88%' },
                ].map((s, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{s.name}</span>
                      <span className="text-[9px] text-gray-500 font-bold">{s.team}</span>
                    </div>
                    <div className="flex gap-8 text-right">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-bold uppercase">Points</span>
                          <span className="text-xs font-black italic">{s.points}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-bold uppercase">Sel %</span>
                          <span className="text-xs font-bold text-white">{s.selected}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {/* Sticky Header */}
      <header className="p-4 px-3 flex items-center justify-between bg-dark-bg border-b border-dark-border">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-bold text-sm leading-tight uppercase tracking-tight">{match.team1} <span className="text-gray-600 font-medium italic">vs</span> {match.team2}</h2>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase opacity-70">
              {match.status === 'live' ? 'Live Match' : 'Today, 7:30 PM'} • {match.venue.split(',')[0]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Info className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      {/* Lineup Notification Banner */}
      {match.lineupsOut && match.status !== 'completed' && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-green-600 px-4 py-2 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Official Lineups are out! Verify your team.</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[8px] font-bold text-white uppercase">Live XI</span>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-dark-border bg-dark-bg sticky top-0 z-10">
        {(['Contests', 'My Contests', 'My Teams', 'Stats'] as const).map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab.toLowerCase() as any)}
            className={cn(
              "flex-1 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all relative border-b-2",
              activeTab === tab.toLowerCase() ? "text-brand-red border-brand-red" : "text-gray-500 border-transparent opacity-60"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {/* Live Scoreboard (if live) */}
        {match.status === 'live' && (
          <div className="bg-dark-card border border-brand-red/30 rounded-2xl overflow-hidden shadow-xl shadow-brand-red/5">
            <div className="bg-brand-red px-3 py-1 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white animate-pulse">Live Match</span>
              <span className="text-[9px] font-bold text-white/80 uppercase">Over {liveScore?.overs || '...'}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-display font-black italic">
                   {liveScore ? (liveScore.score1 || liveScore.score2) : `${match.team1} vs ${match.team2}`}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{match.team1} Inning</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-xs font-bold text-gray-400">{liveScore?.summary || 'Match in progress'}</span>
              </div>
            </div>
            {liveScore?.batters && (
              <div className="px-4 pb-4 flex gap-4 overflow-x-auto">
                 {liveScore.batters.map((b: any, i: number) => (
                    <div key={i} className="min-w-[120px] bg-white/5 p-2 rounded-lg border border-white/5">
                       <span className="text-[8px] text-gray-500 font-bold uppercase block italic">On Strike</span>
                       <p className="text-[10px] font-black">{b.name} <span className="text-brand-red">{b.runs}</span><span className="text-gray-500">({b.balls})</span></p>
                    </div>
                 ))}
              </div>
            )}
          </div>
        )}
        
        {/* Pitch & Weather Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-4 divide-x divide-white/10 shadow-sm">
          <div className="flex-1">
            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1 opacity-70">Pitch Pattern</span>
            <p className="text-[10px] font-bold leading-relaxed">{match.pitchReport || 'Balanced track, good for pace.'}</p>
          </div>
          <div className="pl-4 min-w-[80px]">
            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1 opacity-70">Weather</span>
            <p className="text-[10px] font-bold leading-relaxed">{match.weather || 'Mostly Clear, 30°C'}</p>
          </div>
        </div>

        {renderTabContent()}
      </div>

      {/* Contest Details Overlay */}
      <AnimatePresence>
        {selectedContest && (
          <div className="fixed inset-0 z-[150] bg-dark-bg flex flex-col">
            <header className="p-4 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedContest(null)} className="p-1"><ChevronLeft className="w-6 h-6" /></button>
                <h2 className="font-bold text-sm uppercase">{selectedContest.name}</h2>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white/5 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-2">
                  <span>Leaderboard</span>
                  <span>{selectedContest.joinedUsers.length} Teams</span>
                </div>
                <div className="space-y-3">
                  {selectedContest.joinedUsers.map((uid, idx) => (
                    <div key={uid} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black italic text-brand-red w-4">#{idx + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-xs font-bold">{uid === user?.uid ? 'You' : `Player ${uid.substr(0, 4)}`}</span>
                      </div>
                      <span className="text-xs font-black">0 Pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="p-4 sticky bottom-0 bg-gradient-to-t from-dark-bg via-dark-bg to-transparent">
        {activeTab === 'my contests' ? (
          <button 
            onClick={onCreateContest}
            className="w-full bg-green-600 border border-green-500/30 py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest shadow-2xl shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 fill-current" />
            CREATE CONTEST NOW
          </button>
        ) : (
          <button 
            onClick={onCreateTeam}
            className="w-full dream11-gradient py-4 rounded-xl font-display font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-red/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            CREATE TEAM NOW
          </button>
        )}
      </div>
    </div>
  );
}
