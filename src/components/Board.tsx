import { memo, useRef, useState, useEffect } from "react";
import { BASE_AREA, COLORS, HOME_COLUMN, SAFE_SQUARES, START_INDEX, TRACK, type Color } from "@/game/constants";
import { cellFor, legalMoves } from "@/game/engine";
import type { GameState } from "@/game/types";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { STORE_ITEMS } from "@/data/store";
import { Avatar } from "@/components/Avatar";

const SIZE = 600; // svg viewbox is 15x15, scaled here
const CELL = SIZE / 15;
const COLOR_HEX: Record<Color, string> = {
  red: "#ef4444", green: "#22c55e", yellow: "#eab308", blue: "#3b82f6",
};
const COLOR_LIGHT: Record<Color, string> = {
  red: "#fecaca", green: "#bbf7d0", yellow: "#fef08a", blue: "#bfdbfe",
};

export type VoiceProps = {
  voiceChatDisabled: true;
} | {
  voiceChatDisabled?: false;
  userId: string;
  isMicMuted: boolean;
  localRemoteMuted: Record<string, boolean>;
  globalMuted: Record<string, boolean>;
  speakingPlayers: Record<string, boolean>;
  toggleMyMic: () => void;
  toggleRemoteMute: (uid: string) => void;
};

export const Board = memo(function Board({ 
  state, 
  onTokenClick, 
  killVfx, 
  voiceProps, 
  themeId,
  tokenThemeId,
  trailThemeId,
  profiles
}: { 
  state: GameState; 
  onTokenClick?: (seat: number, tokenIdx: number) => void; 
  killVfx?: { active: boolean, position: number | null, color: string | null }; 
  voiceProps?: VoiceProps; 
  themeId?: string;
  tokenThemeId?: string | string[];
  trailThemeId?: string | string[];
  profiles?: Record<string, any>;
}) {
  const activeTheme = STORE_ITEMS.find((i) => i.id === themeId)?.boardTheme || STORE_ITEMS[0].boardTheme!;
  
  const getTokenShape = (id?: string) => STORE_ITEMS.find((i) => i.id === id)?.tokenTheme?.shape || "circle";
  const getTrailClass = (id?: string) => STORE_ITEMS.find((i) => i.id === id)?.trailTheme?.cssClass || "";
  const getTrailStyle = (id?: string) => STORE_ITEMS.find((i) => i.id === id)?.trailTheme?.style || {};

  const tokenShapes = Array.isArray(tokenThemeId) ? tokenThemeId.map(getTokenShape) : Array(4).fill(getTokenShape(tokenThemeId));
  const trailClasses = Array.isArray(trailThemeId) ? trailThemeId.map(getTrailClass) : Array(4).fill(getTrailClass(trailThemeId));
  const trailStyles = Array.isArray(trailThemeId) ? trailThemeId.map(getTrailStyle) : Array(4).fill(getTrailStyle(trailThemeId));

  // figure legal moves for current player to highlight
  const legal = state.dice && state.awaitingMove ? legalMoves(state, state.dice) : [];
  const isCurrent = (seat: number) => seat === state.turn;


  const prevPositions = useRef<Record<string, number>>({});
  const [smokeParticles, setSmokeParticles] = useState<{ id: string, cx: number, cy: number }[]>([]);

  useEffect(() => {
    const newParticles: { id: string, cx: number, cy: number }[] = [];
    
    Object.entries(state.tokens).forEach(([seatStr, playerTokens]) => {
      const seat = parseInt(seatStr);
      const trailType = trailClasses[seat];
      // Since trailClasses[seat] returns the ID or css class?
      // Wait, getTrailClass returns cssClass. We need to check if the item id is trail_glow.
      // But getTrailClass is what we use.
      // We should check the original trailThemeId!
      const currentThemeId = Array.isArray(trailThemeId) ? trailThemeId[seat] : trailThemeId;
      
      if (currentThemeId === 'trail_glow') {
        const pColor = state.players[seat].color;
        playerTokens.forEach((pos: number, ti: number) => {
          const key = `${seat}-${ti}`;
          const oldPos = prevPositions.current[key];
          
          if (oldPos !== undefined && oldPos !== pos && oldPos > 0 && oldPos < 57) {
            const cell = cellFor(pColor, oldPos);
            if (cell) {
              const [col, row] = cell;
              newParticles.push({
                id: `${key}-${Date.now()}-${Math.random()}`,
                cx: (col + 0.5) * CELL,
                cy: (row + 0.5) * CELL,
              });
            }
          }
          prevPositions.current[key] = pos;
        });
      }
    });

    if (newParticles.length > 0) {
      setSmokeParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
        setSmokeParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
      }, 1200);
    }
  }, [state.tokens, trailThemeId, state.players]);

  
  function rect(col: number, row: number, fill: string, stroke = activeTheme.gridStroke, sw: number | string = activeTheme.gridStrokeWidth, key?: string) {
    return <rect key={key} x={col * CELL} y={row * CELL} width={CELL} height={CELL} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }

  return (
    <svg 
      viewBox={`0 0 ${SIZE} ${SIZE}`} 
      className="w-full h-auto select-none" 
      style={{ maxWidth: "100%" }}
    >
      <defs>
        <filter id="smoke-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* background */}
      <rect x={0} y={0} width={SIZE} height={SIZE} fill={activeTheme.bg} rx={16} />

      {/* 4 colored bases (6x6 corners) */}
      {([
        ["red", 0, 0],
        ["green", 9, 0],
        ["yellow", 9, 9],
        ["blue", 0, 9],
      ] as const).map(([c, x, y]) => {
        const player = state.players.find(p => p.color === c);
        // y === 0 is top row (Red, Green), y === 9 is bottom row (Blue, Yellow)
        const textY = y === 0 ? (y + 0.7) * CELL : (y + 5.7) * CELL;
        return (
          <g key={c} id={`base-${c}`}>
            <rect x={x * CELL} y={y * CELL} width={6 * CELL} height={6 * CELL} fill={activeTheme.colors?.[c] || COLOR_HEX[c]} />
            <rect x={(x + 1) * CELL} y={(y + 1) * CELL} width={4 * CELL} height={4 * CELL} fill={activeTheme.bg === "#111827" ? "#ffffff" : activeTheme.bg} />
            <rect x={(x + 1.4) * CELL} y={(y + 1.4) * CELL} width={3.2 * CELL} height={3.2 * CELL} fill={COLOR_LIGHT[c]} rx={6} />
            
            {/* Draw the 4 empty resting circles */}
            {BASE_AREA[c].spots.map(([sx, sy], i) => (
              <circle key={i} cx={sx * CELL} cy={sy * CELL} r={CELL * 0.4} fill="#fff" opacity={0.6} />
            ))}

            {player && (
              <>
                <foreignObject 
                  x={x * CELL} 
                  y={y === 0 ? y * CELL : (y + 5) * CELL} 
                  width={6 * CELL} 
                  height={CELL}
                >
                  <div className="w-full h-full flex flex-row items-center justify-center gap-1.5 px-2" dir="rtl">
                    <Avatar 
                      id={profiles?.[player.userId || ""]?.photoURL || player.avatarId} 
                      size={CELL * 0.75} 
                      frameThemeId={profiles?.[player.userId || ""]?.equipped?.frame}
                    />
                    <span 
                      className="text-white font-black truncate"
                      style={{ 
                        fontSize: CELL * 0.6,
                        WebkitTextStroke: "1px black",
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                      }}
                    >
                      {player.name}
                    </span>
                  </div>
                </foreignObject>
                
                {voiceProps && player.userId && (() => {
                  // Mic control goes opposite to the name
                  const micY = y === 0 ? (y + 5.7) * CELL : (y + 0.3) * CELL;
                  
                  if (voiceProps.voiceChatDisabled) {
                    return (
                      <foreignObject x={(x + 0.5) * CELL} y={micY - CELL * 0.5} width={5 * CELL} height={CELL}>
                        <div className="w-full h-full flex items-center justify-center gap-1.5" dir="ltr">
                          <div className="p-2 rounded-full bg-black/80 border border-white/20 text-white/50 shadow-lg" title="المايكروفون مغلق من الإعدادات">
                            <MicOff size={20} />
                          </div>
                        </div>
                      </foreignObject>
                    );
                  }

                  const isMe = player.userId === voiceProps.userId;
                  const isLocalMuted = isMe ? voiceProps.isMicMuted : voiceProps.localRemoteMuted[player.userId!];
                  const globalMuted = voiceProps.globalMuted[player.userId!];
                  const isSpeaking = voiceProps.speakingPlayers[player.userId!] && !globalMuted && !isLocalMuted;

                  return (
                    <foreignObject x={(x + 0.5) * CELL} y={micY - CELL * 0.5} width={5 * CELL} height={CELL}>
                      <div className="w-full h-full flex items-center justify-center gap-1.5" dir="ltr">
                        {isMe ? (
                          <button
                            onPointerDown={(e) => { e.stopPropagation(); voiceProps.toggleMyMic(); }}
                            className={`relative p-2 rounded-full backdrop-blur-md shadow-lg transition-all border ${
                              voiceProps.isMicMuted ? "bg-red-500/80 border-red-500 text-white" : "bg-green-500/80 border-green-500 text-white"
                            } ${isSpeaking ? "ring-4 ring-green-400/50 animate-pulse" : ""}`}
                            title={voiceProps.isMicMuted ? "فتح المايك" : "إغلاق المايك"}
                          >
                            {voiceProps.isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
                          </button>
                        ) : (
                          <>
                            <button
                              onPointerDown={(e) => { e.stopPropagation(); voiceProps.toggleRemoteMute(player.userId!); }}
                              className={`relative p-2 rounded-full backdrop-blur-md shadow-lg transition-all border ${
                                voiceProps.localRemoteMuted[player.userId!] ? "bg-red-500/80 border-red-500 text-white" : "bg-blue-500/80 border-blue-500 text-white"
                              } ${isSpeaking ? "ring-4 ring-blue-400/50 animate-pulse" : ""}`}
                              title={voiceProps.localRemoteMuted[player.userId!] ? "إلغاء كتم الصوت" : "كتم الصوت لديك"}
                            >
                              {voiceProps.localRemoteMuted[player.userId!] ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            {globalMuted && (
                              <div className="p-2 rounded-full bg-black/60 border border-white/20 text-white/70 shadow-lg" title="اللاعب أغلق المايك">
                                <MicOff size={20} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </foreignObject>
                  );
                })()}

                {state.disconnected?.includes(player.seat) && (
                  <foreignObject
                    x={(x + 1) * CELL}
                    y={(y + 1.5) * CELL}
                    width={4 * CELL}
                    height={3 * CELL}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div 
                        className="border-[3px] border-red-600 text-red-600 font-black text-center uppercase tracking-wider rounded-lg shadow-sm bg-white/90 backdrop-blur-sm"
                        style={{
                          transform: "rotate(-15deg)",
                          fontSize: CELL * 0.45,
                          padding: `${CELL * 0.1}px ${CELL * 0.2}px`,
                          lineHeight: 1.1
                        }}
                      >
                        منقطع<br/>Disconnected
                      </div>
                    </div>
                  </foreignObject>
                )}
              </>
            )}
          </g>
        );
      })}

      {/* 52 track squares — draw white grid in arms */}
      {Array.from({ length: 15 }).flatMap((_, row) =>
        Array.from({ length: 15 }).map((__, col) => {
          // arms are within rows/cols 6-8
          if ((row >= 6 && row <= 8) || (col >= 6 && col <= 8)) {
            // skip center 3x3
            if (row >= 6 && row <= 8 && col >= 6 && col <= 8) return null;
            return rect(col, row, activeTheme.bg === "#111827" ? "#ffffff" : activeTheme.bg, undefined, undefined, `c-${col}-${row}`);
          }
          return null;
        })
      )}

      {/* color the home columns */}
      {COLORS.map((c) =>
        HOME_COLUMN[c].map(([col, row], i) =>
          rect(col, row, activeTheme.colors?.[c] || COLOR_HEX[c], undefined, undefined, `h-${c}-${i}`)
        )
      )}

      {/* color the start squares */}
      {COLORS.map((c) => {
        const [col, row] = TRACK[START_INDEX[c]];
        return rect(col, row, COLOR_LIGHT[c], undefined, undefined, `s-${c}`);
      })}

      {/* arrow paths into home column (color the path squares in the arm leading to color base) */}
      {/* (Visually, color the entry square + arrow.) */}

      {/* safe stars */}
      {Array.from(SAFE_SQUARES).map((idx) => {
        const [col, row] = TRACK[idx];
        return (
          <text key={`star-${idx}`} x={col * CELL + CELL / 2} y={row * CELL + CELL * 0.7} textAnchor="middle"
            fontSize={CELL * 0.7} fill="#1f2937">★</text>
        );
      })}

      {/* center triangles (4 colors meeting) */}
      <g id="board-center">
        <polygon points={`${6*CELL},${6*CELL} ${9*CELL},${6*CELL} ${7.5*CELL},${7.5*CELL}`} fill={activeTheme.colors?.green || COLOR_HEX.green} />
        <polygon points={`${9*CELL},${6*CELL} ${9*CELL},${9*CELL} ${7.5*CELL},${7.5*CELL}`} fill={activeTheme.colors?.yellow || COLOR_HEX.yellow} />
        <polygon points={`${9*CELL},${9*CELL} ${6*CELL},${9*CELL} ${7.5*CELL},${7.5*CELL}`} fill={activeTheme.colors?.blue || COLOR_HEX.blue} />
        <polygon points={`${6*CELL},${9*CELL} ${6*CELL},${6*CELL} ${7.5*CELL},${7.5*CELL}`} fill={activeTheme.colors?.red || COLOR_HEX.red} />
      </g>

      {/* Smoke particles */}
      {smokeParticles.map(p => (
        <g key={p.id} className="smoke-particle" style={{ pointerEvents: 'none' }}>
          <circle cx={p.cx - 6} cy={p.cy} r={18} fill="#ff0000" opacity={0.7} filter="url(#smoke-blur)" />
          <circle cx={p.cx + 6} cy={p.cy} r={18} fill="#00ffff" opacity={0.7} filter="url(#smoke-blur)" />
          <circle cx={p.cx} cy={p.cy - 4} r={14} fill="#ffffff" opacity={0.9} filter="url(#smoke-blur)" />
        </g>
      ))}

      {/* Tokens */}
      {state.players.map((p, seat) =>
        state.tokens[seat].map((d, ti) => {
          if (d === -1) return null;
          // location
          let cx: number, cy: number;
          let stackIndex = 0;
          let stackCount = 1;

          if (d === 0) {
            const [sx, sy] = BASE_AREA[p.color].spots[ti];
            cx = sx * CELL; cy = sy * CELL;
          } else if (d === 57) {
            // pile in center triangle of own color
            const FINISHED_CENTER: Record<string, [number, number]> = {
              red: [6.8, 7.5],
              green: [7.5, 6.8],
              yellow: [8.2, 7.5],
              blue: [7.5, 8.2],
            };
            const [fcx, fcy] = FINISHED_CENTER[p.color];
            
            // 4 spots tightly packed inside the triangle
            const angle = (ti / 4) * Math.PI * 2 + (Math.PI / 4); // offset angle slightly for better packing
            const radius = 0.22;
            cx = (fcx + Math.cos(angle) * radius) * CELL;
            cy = (fcy + Math.sin(angle) * radius) * CELL;
          } else {
            const [col, row] = cellFor(p.color, d)!;
            cx = (col + 0.5) * CELL; cy = (row + 0.5) * CELL;

            // Calculate stack index for tokens on the same square
            stackCount = 0;
            state.players.forEach((otherP, otherSeat) => {
              state.tokens[otherSeat].forEach((otherD, otherTi) => {
                if (otherD > 0 && otherD < 57) {
                  const [otherCol, otherRow] = cellFor(otherP.color, otherD)!;
                  if (otherCol === col && otherRow === row) {
                    if (otherSeat < seat || (otherSeat === seat && otherTi < ti)) {
                      stackIndex++;
                    }
                    stackCount++;
                  }
                }
              });
            });

            if (stackCount > 1) {
              const offset = (stackIndex - (stackCount - 1) / 2) * (CELL * 0.2);
              cx += offset;
              cy += offset;
            }
          }
          // tokens in same cell -> stack slightly
          const interactive = isCurrent(seat) && legal.includes(ti);
          const tokenShape = tokenShapes[seat];
          const trailClass = trailClasses[seat];
          const trailStyle = trailStyles[seat];
          return (
            <g key={`t-${seat}-${ti}`}
               onClick={interactive && onTokenClick ? () => onTokenClick(seat, ti) : undefined}
               className={trailClass}
               style={{ cursor: interactive ? "pointer" : "default", transition: "transform 0.3s ease", ...trailStyle }}
               transform={`translate(${cx}, ${cy})`}>
              {interactive && (
                <circle cx={0} cy={0} r={CELL * 0.55} fill="none" stroke="#fde68a" strokeWidth={3}>
                  <animate attributeName="r" values={`${CELL * 0.45};${CELL * 0.6};${CELL * 0.45}`} dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={0} cy={3} r={CELL * 0.35} fill="#000" opacity={0.25} />
              
              {tokenShape === "crown" && (
                <g>
                  <path d={`M${-CELL*0.25},${CELL*0.25} L${CELL*0.25},${CELL*0.25} L${CELL*0.32},${-CELL*0.2} L${CELL*0.12},${-CELL*0.02} L${0},${-CELL*0.3} L${-CELL*0.12},${-CELL*0.02} L${-CELL*0.32},${-CELL*0.2} Z`} fill={COLOR_HEX[p.color]} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
                  <circle cx={0} cy={-CELL*0.3} r={CELL * 0.06} fill="#FFD700" stroke="#fff" strokeWidth={1} />
                  <circle cx={-CELL*0.32} cy={-CELL*0.2} r={CELL * 0.06} fill="#FFD700" stroke="#fff" strokeWidth={1} />
                  <circle cx={CELL*0.32} cy={-CELL*0.2} r={CELL * 0.06} fill="#FFD700" stroke="#fff" strokeWidth={1} />
                  <rect x={-CELL*0.2} y={CELL*0.15} width={CELL*0.4} height={CELL*0.06} fill="#FFD700" rx={CELL*0.02} />
                </g>
              )}
              {tokenShape === "star" && (
                <g transform="scale(1.2)">
                  <path d={`M0,${-CELL*0.45} L${CELL*0.12},${-CELL*0.12} L${CELL*0.45},${-CELL*0.15} L${CELL*0.15},${CELL*0.1} L${CELL*0.25},${CELL*0.45} L0,${CELL*0.2} L${-CELL*0.25},${CELL*0.45} L${-CELL*0.15},${CELL*0.1} L${-CELL*0.45},${-CELL*0.15} L${-CELL*0.12},${-CELL*0.12} Z`} fill="#000" opacity={0.3} transform="translate(0, 3)" />
                  <path d={`M0,${-CELL*0.45} L${CELL*0.12},${-CELL*0.12} L${CELL*0.45},${-CELL*0.15} L${CELL*0.15},${CELL*0.1} L${CELL*0.25},${CELL*0.45} L0,${CELL*0.2} L${-CELL*0.25},${CELL*0.45} L${-CELL*0.15},${CELL*0.1} L${-CELL*0.45},${-CELL*0.15} L${-CELL*0.12},${-CELL*0.12} Z`} fill={COLOR_HEX[p.color]} stroke="#fff" strokeWidth={1} strokeLinejoin="round" />
                  
                  <path d={`M0,0 L0,${-CELL*0.45} L${-CELL*0.12},${-CELL*0.12} Z`} fill="rgba(255,255,255,0.2)" />
                  <path d={`M0,0 L${CELL*0.12},${-CELL*0.12} L${CELL*0.45},${-CELL*0.15} Z`} fill="rgba(255,255,255,0.2)" />
                  <path d={`M0,0 L${CELL*0.15},${CELL*0.1} L${CELL*0.25},${CELL*0.45} Z`} fill="rgba(255,255,255,0.2)" />
                  <path d={`M0,0 L0,${CELL*0.2} L${-CELL*0.25},${CELL*0.45} Z`} fill="rgba(255,255,255,0.2)" />
                  <path d={`M0,0 L${-CELL*0.15},${CELL*0.1} L${-CELL*0.45},${-CELL*0.15} Z`} fill="rgba(255,255,255,0.2)" />

                  <path d={`M0,0 L0,${-CELL*0.45} L${CELL*0.12},${-CELL*0.12} Z`} fill="rgba(0,0,0,0.2)" />
                  <path d={`M0,0 L${CELL*0.45},${-CELL*0.15} L${CELL*0.15},${CELL*0.1} Z`} fill="rgba(0,0,0,0.2)" />
                  <path d={`M0,0 L${CELL*0.25},${CELL*0.45} L0,${CELL*0.2} Z`} fill="rgba(0,0,0,0.2)" />
                  <path d={`M0,0 L${-CELL*0.25},${CELL*0.45} L${-CELL*0.15},${CELL*0.1} Z`} fill="rgba(0,0,0,0.2)" />
                  <path d={`M0,0 L${-CELL*0.45},${-CELL*0.15} L${-CELL*0.12},${-CELL*0.12} Z`} fill="rgba(0,0,0,0.2)" />
                </g>
              )}
              {tokenShape === "gem" && (
                <g transform="scale(1.2)">
                  <path d={`M${-CELL*0.2},${-CELL*0.3} L${CELL*0.2},${-CELL*0.3} L${CELL*0.35},${-CELL*0.05} L0,${CELL*0.4} L${-CELL*0.35},${-CELL*0.05} Z`} fill={COLOR_HEX[p.color]} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
                  <path d={`M${-CELL*0.35},${-CELL*0.05} L${CELL*0.35},${-CELL*0.05}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                  <path d={`M${-CELL*0.2},${-CELL*0.3} L${-CELL*0.15},${-CELL*0.05} L0,${CELL*0.4}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                  <path d={`M${CELL*0.2},${-CELL*0.3} L${CELL*0.15},${-CELL*0.05} L0,${CELL*0.4}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                  <path d={`M${-CELL*0.15},${-CELL*0.05} L0,${-CELL*0.3} L${CELL*0.15},${-CELL*0.05}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                  <circle cx={-CELL*0.15} cy={-CELL*0.15} r={CELL*0.04} fill="#fff" opacity={0.8} />
                </g>
              )}
              {tokenShape === "pin" && (
                <g transform="scale(1.4)">
                  <path d={`M0,${CELL*0.35} C${CELL*0.3},${CELL*0.05} ${CELL*0.35},${-CELL*0.35} 0,${-CELL*0.4} C${-CELL*0.35},${-CELL*0.35} ${-CELL*0.3},${CELL*0.05} 0,${CELL*0.35} Z`} fill="#f8fafc" stroke="#94a3b8" strokeWidth={2} strokeLinejoin="round" />
                  <circle cx={0} cy={-CELL*0.1} r={CELL * 0.18} fill={COLOR_HEX[p.color]} />
                  <circle cx={-CELL * 0.05} cy={-CELL * 0.15} r={CELL * 0.05} fill="#fff" opacity={0.8} />
                </g>
              )}
              {tokenShape === "circle" && (
                <>
                  <circle cx={0} cy={0} r={CELL * 0.36} fill={COLOR_HEX[p.color]} stroke="#fff" strokeWidth={3} />
                  <circle cx={-CELL * 0.1} cy={-CELL * 0.12} r={CELL * 0.1} fill="#fff" opacity={0.7} />
                </>
              )}
            </g>
          );
        })
      )}
      {/* Kill VFX Explosion */}
      {killVfx?.active && killVfx.position !== null && killVfx.color && (
        (() => {
          const cell = cellFor(killVfx.color as Color, killVfx.position);
          if (!cell) return null;
          const [col, row] = cell;
          const cx = (col + 0.5) * CELL;
          const cy = (row + 0.5) * CELL;
          return (
            <g transform={`translate(${cx}, ${cy})`} className="animate-kill-vfx" style={{ transformOrigin: 'center' }}>
              <circle cx={0} cy={0} r={CELL} fill="url(#explosion-grad)" opacity={0.8} />
              <text x={0} y={CELL * 0.3} fontSize={CELL * 1.5} textAnchor="middle" filter="drop-shadow(0 0 10px red)">💥</text>
            </g>
          );
        })()
      )}
      
      {/* Define explosion gradient */}
      <defs>
        <radialGradient id="explosion-grad">
          <stop offset="0%" stopColor="#ffeda6" stopOpacity="1" />
          <stop offset="40%" stopColor="#ff5722" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#e91e63" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}, (prev, next) => {
  if (prev.themeId !== next.themeId) return false;
  if (JSON.stringify(prev.tokenThemeId) !== JSON.stringify(next.tokenThemeId)) return false;
  if (JSON.stringify(prev.trailThemeId) !== JSON.stringify(next.trailThemeId)) return false;
  
  if (prev.killVfx?.active !== next.killVfx?.active) return false;
  if (prev.killVfx?.position !== next.killVfx?.position) return false;
  if (prev.killVfx?.color !== next.killVfx?.color) return false;
  
  if (JSON.stringify(prev.state) !== JSON.stringify(next.state)) return false;

  if (!prev.voiceProps && next.voiceProps) return false;
  if (prev.voiceProps && !next.voiceProps) return false;
  if (prev.voiceProps && next.voiceProps) {
    if (prev.voiceProps.voiceChatDisabled !== next.voiceProps.voiceChatDisabled) return false;
    if (!prev.voiceProps.voiceChatDisabled && !next.voiceProps.voiceChatDisabled) {
      if (prev.voiceProps.isMicMuted !== next.voiceProps.isMicMuted) return false;
      if (prev.voiceProps.userId !== next.voiceProps.userId) return false;
      
      const pMuted = prev.voiceProps.localRemoteMuted;
      const nMuted = next.voiceProps.localRemoteMuted;
      if (Object.keys(pMuted).some(k => pMuted[k] !== nMuted[k])) return false;
      
      const pGlobal = prev.voiceProps.globalMuted;
      const nGlobal = next.voiceProps.globalMuted;
      if (Object.keys(pGlobal).some(k => pGlobal[k] !== nGlobal[k])) return false;
      
      const pSpeak = prev.voiceProps.speakingPlayers;
      const nSpeak = next.voiceProps.speakingPlayers;
      if (Object.keys(pSpeak).some(k => pSpeak[k] !== nSpeak[k])) return false;
    }
  }

  return true;
});
