import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import type { GameState } from "@/game/types";
import { Avatar } from "@/components/Avatar";
import { COLOR_VAR } from "@/game/constants";
import { Button } from "@/components/ui/button";

export function Podium({ 
  game, 
  onHome, 
  room,
  onNextMatch,
  canNextMatch,
  matchCount = 1,
  onAddFriend,
  myFriends = new Set(),
  currentUserId,
  isHost,
  seriesScores,
  seriesLeaderboard,
}: { 
  game: GameState; 
  onHome: () => void; 
  room?: any;
  onNextMatch?: () => void;
  canNextMatch?: boolean;
  matchCount?: number;
  onAddFriend?: (id: string, name: string) => void;
  myFriends?: Set<string>;
  currentUserId?: string;
  isHost?: boolean;
  seriesScores?: Record<string, number>;
  seriesLeaderboard?: number[];
}) {
  const numPlayers = game.players.length;
  
  const [viewMode, setViewMode] = useState<"match" | "series">(
    matchCount >= 5 && seriesLeaderboard?.length ? "series" : "match"
  );
  
  // Calculate final ranks
  const matchBoard = [...(game.winners || [])];
  game.players.forEach((p, i) => { if (!matchBoard.includes(i) && !p.hasResigned) matchBoard.push(i); });
  game.players.forEach((p, i) => { if (!matchBoard.includes(i)) matchBoard.push(i); });

  const board = viewMode === "series" && seriesLeaderboard?.length ? seriesLeaderboard : matchBoard;

  const getPoints = (num: number, rank: number) => {
    if (num === 2) return rank === 0 ? 2 : 0;
    if (num === 3) return rank === 0 ? 3 : (rank === 1 ? 1 : 0);
    if (num === 4) return rank === 0 ? 5 : (rank === 1 ? 3 : (rank === 2 ? 1 : 0));
    return 0;
  };

  useEffect(() => {
    // Fire confetti from both sides
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ef4444", "#22c55e", "#eab308", "#3b82f6"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ef4444", "#22c55e", "#eab308", "#3b82f6"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const first = board[0];
  const second = numPlayers > 1 ? board[1] : undefined;
  const third = numPlayers > 2 ? board[2] : undefined;

  const renderFriendButton = (p: any) => {
    if (!currentUserId || !p.userId || p.userId === currentUserId || myFriends.has(p.userId)) return null;
    return (
      <button
        onClick={() => onAddFriend?.(p.userId, p.name)}
        className="mt-2 px-2 py-1 bg-sky-500/20 hover:bg-sky-500/40 text-sky-400 border border-sky-500/30 rounded text-[10px] font-bold transition-colors whitespace-nowrap"
      >
        ➕ إضافة صديق
      </button>
    );
  };

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-start bg-black/80 backdrop-blur-md animate-in fade-in duration-700 overflow-y-auto pt-8 pb-10">
      <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-10 duration-700 delay-150">
        {viewMode === "series" ? "Series Champion!" : "GAME OVER"}
      </h2>
      <div className="text-gray-300 text-lg font-medium mb-2 animate-in fade-in delay-300">
        {viewMode === "series" ? "الترتيب التراكمي النهائي للسلسلة" : `نتيجة المباراة ${matchCount} من 5`}
      </div>

      {matchCount >= 5 && seriesLeaderboard?.length && (
        <button
          onClick={() => setViewMode(v => v === "match" ? "series" : "match")}
          className="mb-4 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 transition-colors animate-in fade-in delay-500"
        >
          {viewMode === "series" ? "عرض نتيجة المباراة الأخيرة" : "عرض الترتيب النهائي للسلسلة"}
        </button>
      )}

      <div className="flex items-end gap-2 md:gap-6 h-64 mt-4">
        {/* Second Place */}
        {second !== undefined && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-24 duration-700 delay-500">
            <div className="flex flex-col items-center mb-4">
              <Avatar id={game.players[second].avatarId} size={64} ring={COLOR_VAR[game.players[second].color]} />
              <div className="text-white font-bold mt-2 truncate w-24 text-center">{game.players[second].name}</div>
              <div className="text-gray-300 text-sm">
                {viewMode === "series" ? (
                  <span className="font-bold text-yellow-300">{seriesScores?.[game.players[second].userId!] || 0} pts (إجمالي)</span>
                ) : (
                  <>
                    +{getPoints(numPlayers, 1)} pts 
                    {room?.coinsEarned && game.players[second].userId && room.coinsEarned[game.players[second].userId] > 0 && (
                      <span className="ml-1 text-yellow-400 font-bold inline-flex items-center justify-center gap-1">
                        +{room.coinsEarned[game.players[second].userId]} <img src="/coin.png" alt="coins" className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )}
              </div>
              {renderFriendButton(game.players[second])}
            </div>
            <div className="w-24 md:w-32 h-32 bg-slate-300 rounded-t-xl flex items-center justify-center border-t-4 border-slate-400 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              <span className="text-6xl font-black text-slate-500 drop-shadow-md relative z-10">2</span>
            </div>
          </div>
        )}

        {/* First Place */}
        <div className="flex flex-col items-center animate-in zoom-in-50 duration-700 delay-300 z-10">
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="absolute -top-6 -left-2 -right-2 text-center text-4xl animate-bounce">👑</div>
              <Avatar id={game.players[first].avatarId} size={80} ring={COLOR_VAR[game.players[first].color]} />
            </div>
            <div className="text-yellow-400 font-black mt-2 text-lg truncate w-28 text-center">{game.players[first].name}</div>
            <div className="text-yellow-200 text-sm font-bold flex flex-col items-center">
                {viewMode === "series" ? (
                  <span className="font-black text-yellow-400 text-base">{seriesScores?.[game.players[first].userId!] || 0} pts (إجمالي)</span>
                ) : (
                  <>
                    +{getPoints(numPlayers, 0)} pts
                    {room?.coinsEarned && game.players[first].userId && room.coinsEarned[game.players[first].userId] > 0 && (
                      <span className="text-yellow-400 font-black flex items-center gap-1 mt-0.5">
                        +{room.coinsEarned[game.players[first].userId]} <img src="/coin.png" alt="coins" className="w-5 h-5 drop-shadow-md" />
                      </span>
                    )}
                  </>
                )}
            </div>
            {renderFriendButton(game.players[first])}
          </div>
          <div className="w-28 md:w-36 h-48 bg-yellow-400 rounded-t-xl flex items-center justify-center border-t-4 border-yellow-200 shadow-[0_0_40px_rgba(250,204,21,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
            <span className="text-7xl font-black text-yellow-600 drop-shadow-md relative z-10">1</span>
          </div>
        </div>

        {/* Third Place */}
        {third !== undefined && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-24 duration-700 delay-700">
            <div className="flex flex-col items-center mb-4">
              <Avatar id={game.players[third].avatarId} size={64} ring={COLOR_VAR[game.players[third].color]} />
              <div className="text-white font-bold mt-2 truncate w-24 text-center">{game.players[third].name}</div>
              <div className="text-orange-300 text-sm">
                {viewMode === "series" ? (
                  <span className="font-bold text-yellow-300">{seriesScores?.[game.players[third].userId!] || 0} pts (إجمالي)</span>
                ) : (
                  <>
                    +{getPoints(numPlayers, 2)} pts
                    {room?.coinsEarned && game.players[third].userId && room.coinsEarned[game.players[third].userId] > 0 && (
                      <span className="ml-1 text-yellow-400 font-bold inline-flex items-center justify-center gap-1">
                        +{room.coinsEarned[game.players[third].userId]} <img src="/coin.png" alt="coins" className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )}
              </div>
              {renderFriendButton(game.players[third])}
            </div>
            <div className="w-24 md:w-32 h-24 bg-orange-700 rounded-t-xl flex items-center justify-center border-t-4 border-orange-500 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
              <span className="text-6xl font-black text-orange-900 drop-shadow-md relative z-10">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Fourth Place (if exists) */}
      {board.length > 3 && (
        <div className="mt-8 flex flex-col gap-2 animate-in fade-in delay-1000">
          {board.slice(3).map((seat, index) => {
            const p = game.players[seat];
            return (
              <div key={seat} className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-black/40 w-80">
                <div className="text-xl font-black text-gray-500 w-8">#{index + 4}</div>
                <Avatar id={p.avatarId} size={40} ring={COLOR_VAR[p.color]} />
                <div className="flex-1 text-left">
                  <div className="font-bold leading-tight">{p.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {viewMode === "series" ? (
                      <span className="text-yellow-400">{seriesScores?.[p.userId!] || 0} pts (إجمالي)</span>
                    ) : (
                      <>+{getPoints(numPlayers, index + 3)} pts</>
                    )}
                  </div>
                </div>
                {renderFriendButton(p)}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 flex flex-wrap justify-center gap-4 animate-in fade-in duration-700 delay-1000">
        <Button onClick={onHome} size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-white/20 bg-black/50 text-white hover:bg-white/10 transition-all">
          العودة للرئيسية
        </Button>
        {canNextMatch && isHost && (
          <Button onClick={onNextMatch} size="lg" className="px-12 py-6 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all hover:scale-105 border-0">
            المباراة القادمة ({matchCount + 1}/5) ⏭️
          </Button>
        )}
        {canNextMatch && !isHost && (
          <div className="flex items-center px-8 py-4 text-sm font-bold rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            ⏳ في انتظار المضيف لبدء المباراة القادمة...
          </div>
        )}
      </div>
    </div>
  );
}
