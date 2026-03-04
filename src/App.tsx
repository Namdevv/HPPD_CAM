import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Camera, MessageCircle, Send, Sparkles, Star, Cake, ChevronLeft, ChevronRight, X, MapPin, Volume2, VolumeX } from 'lucide-react';

// Địa điểm tiệc — sửa địa chỉ và link Google Maps embed (lấy từ Google Maps → Chia sẻ → Nhúng bản đồ)
const PARTY_ADDRESS = '964/2 Lê Đức Anh, Tân Tạo, Bình Tân, TP.HCM';
// Lấy link embed: Google Maps → Chọn địa điểm → Chia sẻ → Nhúng bản đồ → copy src của iframe
const PARTY_MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(PARTY_ADDRESS)}&output=embed`;
import confetti from 'canvas-confetti';

// Nhạc Happy Birthday — đặt file happy-birthday.mp3 vào thư mục public/
const BIRTHDAY_MUSIC_SRC = '/atlasaudio-birthday-491022.mp3';

interface Wish {
  id: number;
  name: string;
  content: string;
  created_at: string;
}

const SUGGESTED_WISHES = [
  "Chúc bé Cam mau ăn chóng lớn, luôn ngoan ngoãn và vâng lời ông bà cha mẹ nhé!",
  "Mừng sinh nhật đầu đời của thiên thần nhỏ! Chúc con một đời an nhiên, hạnh phúc.",
  "Chúc con yêu luôn rạng rỡ như ánh mặt trời, là niềm tự hào của cả gia đình.",
  "Hay ăn chóng lớn, thông minh học giỏi con nhé. Yêu con rất nhiều!",
  "Chúc mừng sinh nhật 1 tuổi! Chúc bé Cam luôn khỏe mạnh và tràn đầy tiếng cười."
];

// Ảnh của bé — thêm URL vào đây khi có (vd: main1: '/photo1.jpg')
const MY_PHOTOS = {
  main1: undefined as string | undefined,
  main2: undefined as string | undefined,
};

const PhotoPlaceholder = ({ id, label, src }: { id: string; label: string; src?: string }) => (
  <div className="invitation-photo-placeholder group overflow-hidden rounded-2xl" aria-label={label}>
    {src ? (
      <img src={src} alt={label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    ) : (
      <div className="placeholder-inner">
        <div className="placeholder-icon-wrap">
          <Camera className="placeholder-icon" strokeWidth={1.5} />
        </div>
        <span className="placeholder-label">{label}</span>
        <span className="placeholder-hint">Thêm ảnh của bé</span>
      </div>
    )}
  </div>
);

// Album: ảnh mẫu với seed khác nhau, kích thước lẫn lộn (small | large) cho masonry
const ALBUM_ITEMS: { seed: string; size: 'small' | 'large' }[] = [
  { seed: 'baby1', size: 'large' },
  { seed: 'baby2', size: 'small' },
  { seed: 'baby3', size: 'small' },
  { seed: 'baby4', size: 'small' },
  { seed: 'baby5', size: 'large' },
  { seed: 'baby6', size: 'small' },
  { seed: 'baby7', size: 'small' },
  { seed: 'baby8', size: 'small' },
  { seed: 'baby9', size: 'large' },
  { seed: 'baby10', size: 'small' },
  { seed: 'baby11', size: 'small' },
  { seed: 'baby12', size: 'small' },
];

const AlbumPhoto = ({ seed, size, onClick }: { seed: string; size: 'small' | 'large'; onClick: () => void }) => {
  const w = size === 'large' ? 480 : 280;
  const h = size === 'large' ? 420 : 280;
  const src = `https://picsum.photos/seed/${seed}/${w}/${h}`;
  return (
    <motion.div
      className={`album-item album-item--${size}`}
      whileHover={{ scale: 1.02, rotate: size === 'small' ? (seed.length % 2 === 0 ? 1 : -1) : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="album-photo-frame cursor-pointer">
        <img src={src} alt={`Khoảnh khắc ${seed}`} className="album-photo-img" referrerPolicy="no-referrer" />
      </div>
    </motion.div>
  );
};

// URL ảnh size lớn cho lightbox
const getAlbumImageSrc = (seed: string, large = true) => {
  const size = large ? '1200/900' : '800/600';
  return `https://picsum.photos/seed/${seed}/${size}`;
};

export default function App() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState<1 | -1>(1);
  const [musicMuted, setMusicMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchWishes();
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  // Nhạc — đồng bộ trạng thái mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = musicMuted;
  }, [musicMuted]);

  // Tự phát khi vào web; nếu trình duyệt chặn thì bấm/chạm một cái là có tiếng
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;

    const tryPlay = () => {
      if (!audio.paused) return;
      audio.muted = musicMuted;
      audio.play().catch(() => {});
    };

    tryPlay();
    audio.addEventListener('canplaythrough', tryPlay);

    const onFirstInteraction = () => {
      setMusicMuted(false);
      if (audio.paused) {
        audio.muted = false;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('click', onFirstInteraction, { once: true, passive: true });
    document.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });

    return () => {
      audio.removeEventListener('canplaythrough', tryPlay);
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };
  }, []);

  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      const data = await res.json();
      setWishes(data);
    } catch (err) {
      console.error("Failed to fetch wishes", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content }),
      });

      if (res.ok) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fcd34d', '#f9a8d4', '#a5b4fc', '#86efac']
        });
        setName('');
        setContent('');
        setShowSuccess(true);
        fetchWishes();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to send wish", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSuggested = (wish: string) => {
    setContent(wish);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-pink-200 selection:text-pink-900 invitation-page">
      {/* Nhạc Happy Birthday — file public/happy-birthday.mp3 */}
      <audio ref={audioRef} src={BIRTHDAY_MUSIC_SRC} loop preload="auto" />

      {/* Nút bật/tắt nhạc (trình duyệt thường chặn autoplay, bấm để phát) */}
      <button
        type="button"
        className="music-toggle"
        onClick={() => setMusicMuted((m) => !m)}
        title={musicMuted ? 'Phát nhạc' : 'Tắt nhạc'}
        aria-label={musicMuted ? 'Phát nhạc' : 'Tắt nhạc'}
      >
        {musicMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>

      {/* Bunting / Cờ trang trí */}
      <div className="bunting" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="bunting-flag"
            style={{
              background: ['#93c5fd', '#fde047', '#f9a8d4', '#86efac', '#c4b5fd'][i % 5],
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          />
        ))}
      </div>

      {/* Trang đầu — hero thiệp mời */}
      <section className="hero-section">
        <div className="hero-bg-blobs" aria-hidden>
          <span className="hero-blob hero-blob-1" />
          <span className="hero-blob hero-blob-2" />
          <span className="hero-blob hero-blob-3" />
        </div>

        <motion.div
          className="hero-card"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="hero-layout">
            {/* Ảnh chính — thêm URL vào MY_PHOTOS.main1 khi có ảnh */}
            <motion.div
              className="hero-photo-main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <PhotoPlaceholder id="photo1" label="Ảnh bé Cam" src={MY_PHOTOS.main1} />
            </motion.div>

            <div className="hero-text-block">
              <motion.div
                className="hero-title-wrap"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45 }}
              >
                <span className="hero-cake">
                  <Cake size={28} className="text-pink-400" />
                </span>
                <h1 className="hero-title">
                  Happy Birthday! <span className="hero-age">1<sup>st</sup></span>
                </h1>
                <p className="hero-name">Baby Cam</p>
                <p className="hero-date">13.04.2026</p>
              </motion.div>

              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Nhân dịp mừng thôi nôi Baby Cam
              </motion.p>
              <motion.p
                className="hero-invite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                Trân trọng kính mời quý khách đến tham dự buổi tiệc cùng gia đình chúng tôi tại tư gia.
              </motion.p>

              {/* Ảnh phụ nhỏ — thêm MY_PHOTOS.main2 khi có */}
              <motion.div
                className="hero-photo-accent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <PhotoPlaceholder id="photo2" label="Ảnh bé" src={MY_PHOTOS.main2} />
              </motion.div>

              {/* Lời chúc cuối — giữ nguyên */}
              <motion.div
                className="hero-blessing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="hero-blessing-main">
                  Sự có mặt của quý vị là lời chúc tốt đẹp nhất dành cho bé!
                </p>
                <p className="hero-blessing-sub">mừng thôi nôi bé Cam</p>
              </motion.div>
            </div>
          </div>

          <div className="hero-balloons" aria-hidden>
            <motion.span className="balloon balloon-1" animate={{ y: [0, -10, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.span className="balloon balloon-2" animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} />
            <motion.span className="balloon balloon-3" animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-10 text-center"
        >
          <button
            type="button"
            onClick={() => document.getElementById('wishes-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-send-wish"
          >
            Gửi lời chúc cho bé <Heart size={20} className="inline-block ml-1" />
          </button>
        </motion.div>
      </section>

      {/* Địa điểm — địa chỉ + bản đồ */}
      <section className="location-section">
        <div className="location-inner">
          <div className="location-header">
            <MapPin className="location-icon" size={28} />
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              Địa điểm tổ chức
            </motion.h2>
            <p className="location-address">{PARTY_ADDRESS}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PARTY_ADDRESS)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="location-link"
            >
              Xem chỉ đường trên Google Maps →
            </a>
          </div>
          <motion.div
            className="location-map-wrap"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <iframe
              title="Bản đồ địa điểm"
              src={PARTY_MAP_EMBED_URL}
              className="location-map"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* Những khoảnh khắc đáng yêu của bé — album */}
      <section className="album-section">
        <div className="album-section-inner">
          <div className="text-center album-header">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mx-auto mb-4" />
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Những khoảnh khắc đáng yêu của bé
            </motion.h2>
            <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">Lật qua và xem từng kỷ niệm nhé ✨</p>
          </div>
          <motion.div
            className="album-masonry"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, margin: "-40px" }}
          >
            {ALBUM_ITEMS.map((item, i) => (
              <motion.div
                key={item.seed}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                viewport={{ once: true }}
              >
                <AlbumPhoto
                  seed={item.seed}
                  size={item.size}
                  onClick={() => {
                    setLightboxIndex(i);
                    setLightboxDirection(1);
                    setLightboxOpen(true);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Confetti nhỏ trang trí */}
      <div className="confetti-dots" aria-hidden>
        {[...Array(18)].map((_, i) => (
          <span
            key={i}
            className="confetti-dot"
            style={{
              left: `${5 + (i * 5.5)}%`,
              top: `${15 + (i % 4) * 20}%`,
              background: ['#fcd34d', '#f9a8d4', '#a5b4fc', '#86efac', '#c4b5fd'][i % 5],
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Khu vực gửi lời chúc */}
      <section id="wishes-section" className="wishes-section">
        <div className="wishes-inner">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="inline-block p-4 bg-white rounded-full shadow-md mb-6"
            >
              <MessageCircle size={40} className="text-pink-500" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-display text-pink-600 mb-4">Gửi Lời Chúc Yêu Thương</h2>
            <p className="text-gray-600">Hãy để lại những lời chúc tốt đẹp nhất cho bé Cam nhé!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên của bạn</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring focus:ring-pink-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lời chúc</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Viết lời chúc tại đây..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring focus:ring-pink-100 outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gợi ý lời chúc</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_WISHES.map((wish, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSuggested(wish)}
                        className="text-xs bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-2 rounded-lg transition-colors text-left"
                      >
                        {wish.substring(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Đang gửi...' : (
                    <>Gửi lời chúc <Send size={18} /></>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Cảm ơn bạn đã gửi lời chúc!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
            >
              <h3 className="text-xl font-display text-blue-600 mb-4 flex items-center gap-2">
                Lời chúc gần đây <Star size={18} fill="currentColor" />
              </h3>
              {wishes.length === 0 ? (
                <div className="text-center py-12 text-gray-400 italic">Chưa có lời chúc nào. Hãy là người đầu tiên nhé!</div>
              ) : (
                wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-pink-500">{wish.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(wish.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed italic">&quot;{wish.content}&quot;</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lightbox xem ảnh album — lật trái/phải với animation */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setLightboxOpen(false)}
                aria-label="Đóng"
              >
                <X size={28} />
              </button>

              <div className="lightbox-image-wrap">
                <AnimatePresence mode="wait" custom={lightboxDirection}>
                  <motion.div
                    key={lightboxIndex}
                    className="lightbox-image-inner"
                    custom={lightboxDirection}
                    initial={{ rotateY: lightboxDirection === 1 ? 90 : -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: lightboxDirection === 1 ? -90 : 90, opacity: 0 }}
                    transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
                  >
                    <img
                      src={getAlbumImageSrc(ALBUM_ITEMS[lightboxIndex].seed)}
                      alt={`Khoảnh khắc ${lightboxIndex + 1}`}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="lightbox-nav">
                <button
                  type="button"
                  className="lightbox-btn lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxDirection(-1);
                    setLightboxIndex((prev) => (prev <= 0 ? ALBUM_ITEMS.length - 1 : prev - 1));
                  }}
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft size={36} />
                </button>
                <span className="lightbox-counter">
                  {lightboxIndex + 1} / {ALBUM_ITEMS.length}
                </span>
                <button
                  type="button"
                  className="lightbox-btn lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxDirection(1);
                    setLightboxIndex((prev) => (prev >= ALBUM_ITEMS.length - 1 ? 0 : prev + 1));
                  }}
                  aria-label="Ảnh sau"
                >
                  <ChevronRight size={36} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer — nhắc lại lời chúc cuối */}
      <footer className="footer-invitation">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-px bg-gray-200" />
          <Heart size={24} className="text-pink-300" fill="currentColor" />
          <div className="w-12 h-px bg-gray-200" />
        </div>
        <p className="text-gray-600 text-sm font-medium">Sự có mặt của quý vị là lời chúc tốt đẹp nhất dành cho bé!</p>
        <p className="text-gray-500 text-xs mt-2">mừng thôi nôi bé Cam · 13.04.2026</p>
        <p className="text-gray-400 text-xs mt-3 italic">Made with love for Baby Cam</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fbcfe8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f9a8d4; }
      `}</style>
    </div>
  );
}
