import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Gift, Camera, MessageCircle, Send, Sparkles, Star, Cake, Rabbit, Cat, Dog, Bird, Ghost } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Wish {
  id: number;
  name: string;
  content: string;
  created_at: string;
}

const SUGGESTED_WISHES = [
  "Chúc bé mau ăn chóng lớn, luôn ngoan ngoãn và vâng lời ông bà cha mẹ nhé!",
  "Mừng sinh nhật đầu đời của thiên thần nhỏ! Chúc con một đời an nhiên, hạnh phúc.",
  "Chúc con yêu luôn rạng rỡ như ánh mặt trời, là niềm tự hào của cả gia đình.",
  "Hay ăn chóng lớn, thông minh học giỏi con nhé. Yêu con rất nhiều!",
  "Chúc mừng sinh nhật 1 tuổi! Chúc con luôn khỏe mạnh và tràn đầy tiếng cười."
];

const JumpingAnimal = ({ icon: Icon, color, className = "", delay = 0 }: { icon: any, color: string, className?: string, delay?: number }) => (
  <motion.div
    animate={{ 
      y: [0, -40, 0],
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ 
      duration: 1.2, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
    className={`inline-block ${className}`}
  >
    <Icon size={48} className={color} fill="currentColor" fillOpacity={0.2} />
  </motion.div>
);

export default function App() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchWishes();
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
          colors: ['#ff9a9e', '#fad0c4', '#a1c4fd', '#c2e9fb']
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
    <div className="min-h-screen font-sans selection:bg-pink-200 selection:text-pink-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden birthday-gradient">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="absolute top-10 left-10 text-pink-300"
          >
            <Star size={48} fill="currentColor" className="animate-float" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="absolute bottom-20 right-10 text-blue-300"
          >
            <Star size={64} fill="currentColor" className="animate-float-delayed" />
          </motion.div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-pink-200 rounded-full blur-3xl opacity-30 animate-pulse" />
          
          {/* Floating Animals in Hero */}
          <div className="absolute top-1/3 left-[15%] hidden md:block">
            <JumpingAnimal icon={Rabbit} color="text-pink-400" delay={0} />
          </div>
          <div className="absolute bottom-1/4 right-[15%] hidden md:block">
            <JumpingAnimal icon={Cat} color="text-blue-400" delay={0.5} />
          </div>
        </div>

        <div className="container mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white shadow-2xl overflow-hidden mx-auto bg-white">
                <img 
                  src="https://picsum.photos/seed/baby1/600/600" 
                  alt="Bé Mỡ" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-4 -right-4 bg-yellow-400 text-white p-4 rounded-full shadow-lg"
              >
                <Cake size={32} />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl font-display text-pink-500 mb-4 drop-shadow-sm"
          >
            Mừng Bé Mỡ Tròn 1 Tuổi!
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light"
          >
            Hành trình 365 ngày đầu đời đầy ắp tiếng cười và những kỷ niệm vô giá.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12"
          >
            <button 
              onClick={() => document.getElementById('wishes-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto group"
            >
              Gửi lời chúc cho bé <Heart size={20} className="group-hover:scale-125 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-blue-500 mb-4">Những Khoảnh Khắc Đáng Yêu</h2>
            <div className="w-24 h-1 bg-blue-200 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Lúc mới chào đời", img: "https://picsum.photos/seed/baby-newborn/400/500", desc: "Thiên thần nhỏ đến với thế giới." },
              { title: "Biết lẫy rồi nè", img: "https://picsum.photos/seed/baby-crawl/400/500", desc: "Những nỗ lực đầu tiên của con." },
              { title: "Chiếc răng đầu tiên", img: "https://picsum.photos/seed/baby-smile/400/500", desc: "Nụ cười tỏa nắng của bé yêu." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <img src={item.img} alt={item.title} className="w-full h-72 object-cover" referrerPolicy="no-referrer" />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Party Friends Section */}
      <section className="py-20 bg-pink-50/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display text-pink-500 mb-2">Những Người Bạn Nhỏ Đến Chúc Mừng</h2>
            <p className="text-gray-500 italic">Các bạn ấy đang nhảy múa vui vẻ cùng bé Mỡ nè!</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-end py-10">
            <div className="text-center group cursor-pointer" onClick={() => confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } })}>
              <JumpingAnimal icon={Rabbit} color="text-pink-400" delay={0.1} />
              <p className="mt-4 font-display text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">Bạn Thỏ</p>
            </div>
            <div className="text-center group cursor-pointer" onClick={() => confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } })}>
              <JumpingAnimal icon={Cat} color="text-orange-400" delay={0.3} />
              <p className="mt-4 font-display text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">Bạn Mèo</p>
            </div>
            <div className="text-center group cursor-pointer" onClick={() => confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } })}>
              <JumpingAnimal icon={Dog} color="text-blue-400" delay={0.5} />
              <p className="mt-4 font-display text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Bạn Cún</p>
            </div>
            <div className="text-center group cursor-pointer" onClick={() => confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } })}>
              <JumpingAnimal icon={Bird} color="text-yellow-400" delay={0.7} />
              <p className="mt-4 font-display text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">Bạn Chim</p>
            </div>
            <div className="text-center group cursor-pointer" onClick={() => confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } })}>
              <JumpingAnimal icon={Ghost} color="text-purple-400" delay={0.9} />
              <p className="mt-4 font-display text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Bạn Rồng Nhỏ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Wishes Section */}
      <section id="wishes-section" className="py-24 birthday-gradient">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="inline-block p-4 bg-white rounded-full shadow-md mb-6"
            >
              <MessageCircle size={40} className="text-pink-500" />
            </motion.div>
            <h2 className="text-4xl font-display text-pink-600 mb-4">Gửi Lời Chúc Yêu Thương</h2>
            <p className="text-gray-600">Hãy để lại những lời chúc tốt đẹp nhất cho hành trình tương lai của bé nhé!</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
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
                        {wish.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Đang gửi..." : (
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

            {/* List of wishes */}
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
                    <p className="text-gray-700 text-sm leading-relaxed italic">"{wish.content}"</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-12 h-px bg-gray-200" />
          <Heart size={24} className="text-pink-300" fill="currentColor" />
          <div className="w-12 h-px bg-gray-200" />
        </div>
        <p className="text-gray-400 text-sm">© 2026 - Mừng Bé Mỡ Tròn 1 Tuổi</p>
        <p className="text-gray-300 text-xs mt-2 italic">Made with love for our little angel</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fbcfe8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f9a8d4;
        }
      `}</style>
    </div>
  );
}
