import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Camera, MessageCircle, Send, Sparkles, Star, Cake, ChevronLeft, ChevronRight, X, MapPin, Volume2, VolumeX } from 'lucide-react';
import { BirthdayStickers } from './components/BirthdayStickers';

// Địa điểm tiệc — tên/địa chỉ hiển thị giữ nguyên; map chấm đúng tọa độ dưới đây
const PARTY_ADDRESS = '964/2 Lê Đức Anh, Tân Tạo, Bình Tân, TP.HCM';
const PARTY_LAT = 10.7609;
const PARTY_LNG = 106.590565;
const PARTY_MAP_EMBED_URL = `https://www.google.com/maps?q=${PARTY_LAT},${PARTY_LNG}&z=17&output=embed`;
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
  main1: '/hppd1.jpg',
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

// Đã gộp tất cả ảnh vào chung 1 folder: public/photos/timeline
// Bạn có thể dễ dàng thay đổi, thêm hoặc bớt ảnh trực tiếp trong phần 'photos' của từng giai đoạn dưới đây.
// Tính toán mốc thời gian giả lập dựa trên lượng ảnh
// Bé sinh T4/2025, thôi nôi T4/2026.
type TimelineEvent = {
  milestone: string;
  dateStr: string;
  emoji: string;
  description: string;
  photos: string[];
};

const TIMELINE_DATA: TimelineEvent[] = [
  {
    milestone: "Lúc mới sinh",
    dateStr: "Tháng 04/2025",
    emoji: "🐣",
    description: "Chào thế giới! Những ngày đầu tiên bên ba mẹ.",
    photos: [
      // --- Ảnh giai đoạn: Lúc mới sinh ---
      '/photos/timeline/z7628598912943_1504e35436af4af293459909e131150d.jpg',
      '/photos/timeline/z7628598917040_a99f3e5e1f924b087c8599700022c907.jpg',
      '/photos/timeline/z7628598929683_764c37233c394766eece71fa9a5345fc.jpg',
      '/photos/timeline/z7628598938739_9633b4544dfb7bb6621cc70f2aa7dfe3.jpg',
      '/photos/timeline/z7628598939026_4a8f4d4ad9b3fad8cf25ebfbd3f264c6.jpg',
      '/photos/timeline/z7628598948153_3a06efff02713b0d4dda483b81692dab.jpg',
    ]
  },
  {
    milestone: "Đầy tháng",
    dateStr: "Tháng 05/2025",
    emoji: "🍼",
    description: "Con tròn 1 tháng tuổi, trộm vía ăn ngoan ngủ ngoan.",
    photos: [
      // --- Ảnh giai đoạn: Đầy tháng ---
      '/photos/timeline/z7628598955352_326ee3d6c7b22f32b731aee2e6c21ed9.jpg',
      '/photos/timeline/z7628598959968_f7f5c6e4adcd7326dbcf730fc7728616.jpg',
      '/photos/timeline/z7628598970333_0392d30407065b54743645a21219800d.jpg',
      '/photos/timeline/z7628598977950_18693ce31fb3e940ae70eb12848487f5.jpg',
      '/photos/timeline/z7628598983970_7a912799b4c6c1672330e38c1016f098.jpg',
      '/photos/timeline/z7628598994477_c3edd8632306724750419b93b666ec08.jpg',
    ]
  },
  {
    milestone: "Biết lật rồi nè",
    dateStr: "Tháng 07/2025",
    emoji: "🐛",
    description: "Con được 3 tháng tuổi, bắt đầu cứng cáp và biết hóng chuyện.",
    photos: [
      // --- Ảnh giai đoạn: Biết lật ---
      '/photos/timeline/z7628599003840_c82019d9a4265b5f8efa9b1edecc184c.jpg',
      '/photos/timeline/z7628599013057_a7f708c6e1a37ca9be624f65ae09ebba.jpg',
      '/photos/timeline/z7628599017726_1a186d8531e38ba1935d09d8b1980eda.jpg',
      '/photos/timeline/z7628599018021_32b40d5ac14700fcd8255ccfd8ddce9a.jpg',
      '/photos/timeline/z7628599044560_28bff220864ac8d8393556976fce2bcf.jpg', // ảnh chưa sử dụng ở code cũ
      '/photos/timeline/z7628599053610_d3a710ff321e7e899056d1ce7e599022.jpg', // ảnh chưa sử dụng ở code cũ
    ]
  },
  {
    milestone: "Ăn dặm",
    dateStr: "Tháng 10/2025",
    emoji: "🥣",
    description: "Tròn 6 tháng! Hành trình khám phá mùi vị bắt đầu.",
    photos: [
      // --- Ảnh giai đoạn: Ăn dặm ---
      '/photos/timeline/z7628599033797_ae828bc89b7cef2cf622cca9c88e9b89.jpg',
      '/photos/timeline/z7628579466211_743ed599102bf3693a5b671f37fb0945.jpg',
      '/photos/timeline/z7628579478688_8bf3010fb8bf06089f94ed5c67b0b980.jpg',
      '/photos/timeline/z7628599038850_4d70ba1d759a63a383bfa90674ddd64e.jpg',


    ]
  },
  {
    milestone: "Đón Tết đầu tiên",
    dateStr: "Tháng 02/2026",
    emoji: "🌸",
    description: "Mùa xuân đầu tiên của con, diện áo mới đi chúc Tết.",
    photos: [
      // --- Ảnh giai đoạn: Đón Tết đầu tiên ---
      '/photos/timeline/tetholyday1.jpg',
      '/photos/timeline/tetholyday2.jpg',
      '/photos/timeline/tetholyday3.jpg',
      '/photos/timeline/tetholyday4.jpg',
    ]
  },
  {
    milestone: "Photo Shoot 1 Tuổi",
    dateStr: "Tháng 03/2026",
    emoji: "📸",
    description: "Đi chụp ảnh concept chuẩn bị thôi nôi, quậy tưng bừng phông nền.",
    photos: [
      // --- Ảnh giai đoạn: Photo Shoot 1 Tuổi ---
      '/photos/timeline/z7628579442883_94799308899bb25ae98fe5c48b7aacb7.jpg',
      '/photos/timeline/z7628579445280_dd0b7731df144a14931437336347b687.jpg',
      '/photos/timeline/z7628579454888_368201a77720891706001cfabc632bfa.jpg',
      '/photos/timeline/z7628579460920_823d635e8b9d1adefcb94aa73729c0a5.jpg',
      '/photos/timeline/z7628579478991_98efddf59294c9808a5898563a814ef2.jpg',
      '/photos/timeline/z7628579493914_ce56d5df1b52e12b61bde4e0aa411cda.jpg',
    ]
  },
  {
    milestone: "Mừng Thôi Nôi",
    dateStr: "Tháng 04/2026",
    emoji: "🎂",
    description: "Happy 1st Birthday! Con chính thức tròn 1 tuổi.",
    photos: [
      // --- Ảnh giai đoạn: Mừng Thôi Nôi ---
      '/photos/timeline/z7628579359672_795affd31bd7b44f35db35d276e2c3aa.jpg',
      '/photos/timeline/z7628579363325_8eef57657cfb6ef34970a94fd10bbdbf.jpg',
      '/photos/timeline/z7628579376506_86ec4b5dbac12340aa4f12ec7e6e400b.jpg',
      '/photos/timeline/z7628579376699_966e3f04679fd30a18831169481f746e.jpg',
    ]
  }
];

// Flat array chứa TẤT CẢ các ảnh để dùng cho Lightbox (có thể ấn Next xuyên qua timeline)
const ALL_PHOTOS_FLAT = TIMELINE_DATA.flatMap(t => t.photos);

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
  const timelineRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollAnimationRef = useRef<number>();

  // ======= TỰ ĐỘNG CUỘN TIMELINE =======
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    let scrollInterval: NodeJS.Timeout;
    let resumeTimeout: NodeJS.Timeout;
    let isInteracting = false;

    const startScroll = () => {
      clearInterval(scrollInterval);
      // Tốc độ: 15ms cộng 1px, tương đương ~60fps
      scrollInterval = setInterval(() => {
        if (!isInteracting && el) {
          el.scrollLeft += 1;

          // Dừng nếu chạm rìa phải
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
            clearInterval(scrollInterval);
          }
        }
      }, 15);
    };

    const stopScroll = () => {
      clearInterval(scrollInterval);
    };

    const handleInteractionStart = () => {
      isInteracting = true;
      stopScroll();
      clearTimeout(resumeTimeout);
    };

    const handleInteractionEnd = () => {
      clearTimeout(resumeTimeout);
      // Tự động cuộn lại sau 2 giây
      resumeTimeout = setTimeout(() => {
        isInteracting = false;
        startScroll();
      }, 2000);
    };

    // Khi cuộn tới phần Timeline mới kích hoạt scroll
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        isInteracting = false;
        startScroll();
      } else {
        stopScroll();
      }
    }, { threshold: 0.1 });

    observer.observe(el);

    // Chuột
    el.addEventListener('mouseenter', handleInteractionStart);
    el.addEventListener('mouseleave', handleInteractionEnd);
    // Cảm ứng
    el.addEventListener('touchstart', handleInteractionStart, { passive: true });
    el.addEventListener('touchend', handleInteractionEnd);
    // Con lăn chuột
    el.addEventListener('wheel', handleInteractionStart, { passive: true });
    let wheelTimeout: NodeJS.Timeout;
    const handleWheelEnd = () => {
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(handleInteractionEnd, 300);
    };
    el.addEventListener('wheel', handleWheelEnd, { passive: true });

    return () => {
      observer.disconnect();
      stopScroll();
      clearTimeout(resumeTimeout);
      clearTimeout(wheelTimeout);
      el.removeEventListener('mouseenter', handleInteractionStart);
      el.removeEventListener('mouseleave', handleInteractionEnd);
      el.removeEventListener('touchstart', handleInteractionStart);
      el.removeEventListener('touchend', handleInteractionEnd);
      el.removeEventListener('wheel', handleInteractionStart);
      el.removeEventListener('wheel', handleWheelEnd);
    };
  }, []);
  // ======================================
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
      audio.play().catch(() => { });
    };

    tryPlay();
    audio.addEventListener('canplaythrough', tryPlay);

    const onFirstInteraction = () => {
      setMusicMuted(false);
      if (audio.paused) {
        audio.muted = false;
        audio.play().catch(() => { });
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
          <BirthdayStickers />

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
                  HAPPY BIRTHDAY! <span className="hero-age">1<sup>st</sup></span>
                </h1>
                <p className="hero-name">Phạm Trần Minh Hoàng (Cam)</p>
                <p className="hero-date">13.04.2026</p>
              </motion.div>

              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Nhân dịp mừng thôi nôi Bé Cam
              </motion.p>
              <motion.p
                className="hero-invite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                Trân trọng kính mời quý khách đến tham dự buổi tiệc cùng gia đình chúng tôi tại <span className="text-2xl font-bold uppercase">Tư gia</span>.
              </motion.p>

              {/* Ảnh phụ nhỏ — thêm MY_PHOTOS.main2 khi có
              <motion.div
                className="hero-photo-accent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <PhotoPlaceholder id="photo2" label="Ảnh bé" src={MY_PHOTOS.main2} />
              </motion.div> */}

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
          {/* <button
            type="button"
            onClick={() => document.getElementById('wishes-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-send-wish"
          >
            Gửi lời chúc cho bé <Heart size={20} className="inline-block ml-1" />
          </button> */}
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
              href={`https://www.google.com/maps/search/?api=1&query=${PARTY_LAT},${PARTY_LNG}`}
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

      <section className="timeline-section">
        <div className="text-center album-header px-4 mb-10">
          <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mx-auto mb-6" />
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-amber-700 leading-tight"
          >
            Hành trình lớn khôn của bé Cam 🌟
          </motion.h2>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl mt-3 max-w-2xl mx-auto">Cuộn ngang để xem quá trình lớn lên từng ngày ✨</p>
        </div>

        {/* Nút điều hướng cuộn timeline */}
        <div className="flex justify-center gap-4 mt-6 mb-4 px-4 sticky left-0 z-10 w-full pointer-events-none">
          <button
            onClick={() => {
              if (timelineRef.current) timelineRef.current.scrollBy({ left: -350, behavior: 'smooth' });
            }}
            className="pointer-events-auto bg-white/90 backdrop-blur border border-amber-200 text-amber-600 p-3 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all"
            aria-label="Cuộn trái"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => {
              if (timelineRef.current) timelineRef.current.scrollBy({ left: 350, behavior: 'smooth' });
            }}
            className="pointer-events-auto bg-white/90 backdrop-blur border border-amber-200 text-amber-600 p-3 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all"
            aria-label="Cuộn phải"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Vùng Timeline cuộn ngang */}
        <div className="timeline-scroll-container" ref={timelineRef}>
          <div className="timeline-track">
            {/* Đường line chạy dọc toàn bộ timeline ngang */}
            <div className="timeline-line"></div>

            {TIMELINE_DATA.map((event, eventIdx) => {
              // Tìm chỉ số cùa tấm ảnh đầu tiên trong ALL_PHOTOS_FLAT
              let cumulativeIdx = 0;
              for (let i = 0; i < eventIdx; i++) {
                cumulativeIdx += TIMELINE_DATA[i].photos.length;
              }

              return (
                <div key={eventIdx} className="timeline-milestone">
                  {/* Point trên trục thời gian */}
                  <div className="timeline-point">
                    <span className="timeline-point-emoji">{event.emoji}</span>
                  </div>

                  {/* Nội dung text mốc thời gian */}
                  <div className="timeline-content">
                    <div className="timeline-date">{event.dateStr}</div>
                    <div className="timeline-title">{event.milestone}</div>
                    <div className="timeline-desc">{event.description}</div>
                  </div>

                  {/* Grid ảnh của mốc thời gian đó */}
                  <div className={`timeline-photos grid-${Math.min(event.photos.length, 4)}`}>
                    {event.photos.map((photoSrc, pIdx) => {
                      const absoluteIdx = cumulativeIdx + pIdx;
                      return (
                        <motion.div
                          key={pIdx}
                          className="timeline-photo-card"
                          whileHover={{ scale: 1.04, rotate: (pIdx % 2 === 0 ? 1 : -1) }}
                          onClick={() => {
                            setLightboxIndex(absoluteIdx);
                            setLightboxDirection(1);
                            setLightboxOpen(true);
                          }}
                        >
                          <img src={photoSrc} alt={event.milestone} loading="lazy" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Padding mốc cuối cùng */}
            <div className="timeline-end-pad w-[100px] shrink-0"></div>
          </div>
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
                      src={ALL_PHOTOS_FLAT[lightboxIndex]}
                      alt={`Khoảnh khắc ${lightboxIndex + 1}`}
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
                    setLightboxIndex((prev) => (prev <= 0 ? ALL_PHOTOS_FLAT.length - 1 : prev - 1));
                  }}
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft size={36} />
                </button>
                <span className="lightbox-counter">
                  {lightboxIndex + 1} / {ALL_PHOTOS_FLAT.length}
                </span>
                <button
                  type="button"
                  className="lightbox-btn lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxDirection(1);
                    setLightboxIndex((prev) => (prev >= ALL_PHOTOS_FLAT.length - 1 ? 0 : prev + 1));
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
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-px bg-gray-200" />
          <Heart size={28} className="text-pink-400" fill="currentColor" />
          <div className="w-16 h-px bg-gray-200" />
        </div>
        <p className="text-gray-700 text-lg sm:text-xl font-bold px-4">Sự có mặt của quý vị là lời chúc tốt đẹp nhất dành cho bé!</p>
        <p className="text-gray-500 text-base sm:text-lg mt-3 font-medium">mừng thôi nôi bé Cam · 13.04.2026</p>
        <p className="text-gray-400 text-sm mt-4 italic">Made with love for Baby Cam</p>
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
