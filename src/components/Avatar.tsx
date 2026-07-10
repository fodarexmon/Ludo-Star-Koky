import React from "react";
import { AVATARS, getAvatar } from "@/data/avatars";
import { STORE_ITEMS } from "@/data/store";

export function Avatar({ id, size = 40, ring, frameThemeId }: { id: string; size?: number; ring?: string; frameThemeId?: string }) {
  const frameClass = STORE_ITEMS.find((i) => i.id === frameThemeId)?.frameTheme?.cssClass || "";
  
  let inner: React.ReactNode;
  
  if (id && id.startsWith("data:image/")) {
    inner = (
      <div
        style={{
          width: size, height: size,
          boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
        }}
        className="rounded-full overflow-hidden shrink-0 z-10"
      >
        <img src={id} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  } else {
    const a = getAvatar(id);
    inner = (
      <div
        style={{
          width: size, height: size, background: a.bg,
          boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
          fontSize: size * 0.6,
        }}
        className="grid place-items-center rounded-full select-none shrink-0 z-10"
      >
        <span>{a.emoji}</span>
      </div>
    );
  }

  if (frameClass) {
    return (
      <div className={`relative rounded-full shrink-0 flex items-center justify-center ${frameClass}`} style={{ width: size + 20, height: size + 20 }}>
        {inner}
      </div>
    );
  }

  return inner;
}

export function AvatarPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onChange(a.id)}
          className="rounded-xl p-1 transition-transform hover:scale-105"
          style={{ outline: value === a.id ? "3px solid var(--ring)" : "2px solid transparent" }}
        >
          <Avatar id={a.id} size={48} />
        </button>
      ))}
    </div>
  );
}
