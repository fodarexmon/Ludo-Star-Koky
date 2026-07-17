import { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";

const lottieCache: Record<string, any> = {};
const inflightPromises: Record<string, Promise<any>> = {};

export function LottieEmoji({ hex, size = 64, autoplay = true }: { hex: string; size?: number; autoplay?: boolean }) {
  const [data, setData] = useState<any>(lottieCache[hex] || null);
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieCache[hex]) {
      setData(lottieCache[hex]);
      return;
    }

    if (!inflightPromises[hex]) {
      inflightPromises[hex] = fetch(`https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/lottie.json`)
        .then(res => res.json())
        .then(json => {
          lottieCache[hex] = json;
          return json;
        })
        .catch(err => {
          console.error(err);
          delete inflightPromises[hex];
        });
    }

    inflightPromises[hex].then(json => {
      if (json) setData(json);
    });
  }, [hex]);

  useEffect(() => {
    if (data && lottieRef.current) {
      if (autoplay) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [autoplay, data]);

  if (!data) return <div style={{ width: size, height: size }} className="animate-pulse bg-white/10 rounded-full" />;

  return <Lottie lottieRef={lottieRef} animationData={data} loop={true} autoplay={autoplay} style={{ width: size, height: size }} />;
}
