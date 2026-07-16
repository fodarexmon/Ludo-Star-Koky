import { useState, useEffect } from "react";
import Lottie from "lottie-react";

export function LottieEmoji({ hex, size = 64 }: { hex: string; size?: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/lottie.json`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [hex]);

  if (!data) return <div style={{ width: size, height: size }} className="animate-pulse bg-white/10 rounded-full" />;

  return <Lottie animationData={data} loop={true} style={{ width: size, height: size }} />;
}
