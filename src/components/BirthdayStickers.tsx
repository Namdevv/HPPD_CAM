import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Sparkles, Star, Heart } from 'lucide-react';

// Sticker Lottie quanh thiệp mời
// - Mặc định sẽ cố load 2 file JSON từ thư mục public:
//   /lottie/birthday-balloons.json và /lottie/birthday-confetti.json
// - Nếu chưa có file JSON, component sẽ tự động fallback về icon tĩnh (Sparkles / Star / Heart)

const useLottieFromUrl = (url: string) => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // im lặng nếu không tải được
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return data;
};

export const BirthdayStickers: React.FC = () => {
  const balloonsData = useLottieFromUrl('/public/lottie/Pin-with-horn.json');
  const confettiData = useLottieFromUrl('/lottie/birthday-confetti.json');

  const hasLottie = !!balloonsData || !!confettiData;

  if (!hasLottie) {
    // Fallback: dùng icon cũ nếu chưa có file Lottie
    return (
      <>
        <div className="hero-sticker hero-sticker--top-left" aria-hidden>
          <Sparkles size={22} />
        </div>
        <div className="hero-sticker hero-sticker--top-right" aria-hidden>
          <Star size={20} />
        </div>
        <div className="hero-sticker hero-sticker--bottom-right" aria-hidden>
          <Heart size={20} />
        </div>
      </>
    );
  }

  return (
    <>
      {balloonsData && (
        <div className="lottie-sticker lottie-sticker--top-left" aria-hidden>
          <Lottie animationData={balloonsData} loop autoplay />
        </div>
      )}
      {confettiData && (
        <div className="lottie-sticker lottie-sticker--top-right" aria-hidden>
          <Lottie animationData={confettiData} loop autoplay />
        </div>
      )}
    </>
  );
}

