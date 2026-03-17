const fs = require('fs');
const filePath = 'src/index.css';
let css = fs.readFileSync(filePath, 'utf8');

// Tìm điểm bắt đầu phần album cũ
const marker = '/* Album — Những khoảnh khắc đáng yêu (masonry + polaroid) */';
const idx = css.indexOf(marker);

if (idx !== -1) {
    css = css.substring(0, idx); // Cắt bỏ phần sau

    // Nối phần CSS timeline mới
    const timelineCss = `
/* ========== Hành Trình Khôn Lớn — Timeline Cuộn Ngang ========== */
.timeline-section {
  padding: 4rem 0 2rem;
  background: linear-gradient(180deg, rgba(254, 243, 199, 0.4) 0%, transparent 100%);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.timeline-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 1rem 0 3rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(251, 191, 36, 0.6) rgba(254, 243, 199, 0.4);
}

.timeline-scroll-container::-webkit-scrollbar {
  height: 10px;
}
.timeline-scroll-container::-webkit-scrollbar-track {
  background: rgba(254, 243, 199, 0.4);
  border-radius: 10px;
}
.timeline-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.6);
  border-radius: 10px;
  border: 2px solid rgba(254, 243, 199, 0.4);
}

.timeline-track {
  display: flex;
  align-items: flex-start;
  padding: 0 max(1rem, calc((100vw - 1160px) / 2 + 1rem));
  position: relative;
  min-width: max-content;
}

/* Đường ngang timeline */
.timeline-line {
  position: absolute;
  top: 24px;
  left: max(1rem, calc((100vw - 1160px) / 2 + 1rem));
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #fcd34d 0%, #f9a8d4 30%, #a5b4fc 60%, #86efac 100%);
  border-radius: 2px;
  z-index: 0;
}

.timeline-milestone {
  position: relative;
  width: clamp(300px, 85vw, 480px);
  padding-right: 2.5rem;
  flex-shrink: 0;
  scroll-snap-align: start;
  scroll-margin-left: max(1rem, calc((100vw - 1160px) / 2 + 1rem));
}

.timeline-point {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: white;
  border: 4px solid #fcd34d;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  margin-bottom: 1.5rem;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.timeline-milestone:hover .timeline-point {
  transform: scale(1.15) rotate(5deg);
  border-color: #f9a8d4;
}

.timeline-point-emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.timeline-content {
  padding-right: 1.5rem;
  margin-bottom: 1.5rem;
}

.timeline-date {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: #d97706;
  margin-bottom: 0.25rem;
  background: rgba(254, 243, 199, 0.8);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  display: inline-block;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.timeline-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
  color: #78350f;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}

.timeline-desc {
  font-size: 0.95rem;
  color: #57534e;
  line-height: 1.5;
}

/* Grid xếp ảnh cute */
.timeline-photos {
  display: grid;
  gap: 0.85rem;
  padding-right: 1rem;
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: repeat(2, 1fr); align-items: start; }
.grid-4 { grid-template-columns: repeat(2, 1fr); }

/* Bố cục grid-3 đặc biệt: ảnh đầu to, 2 ảnh sau nhỏ */
.grid-3 > div:first-child {
  grid-column: span 2;
}

/* Card polaroid */
.timeline-photo-card {
  background: #fff;
  padding: 6px;
  padding-bottom: 1.25rem;
  border-radius: 6px;
  box-shadow: 
    0 2px 8px rgba(139, 92, 46, 0.1),
    0 8px 24px rgba(139, 92, 46, 0.06);
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
  aspect-ratio: 1; /* Mặc định vuông vuông */
}

.grid-1 > .timeline-photo-card {
  aspect-ratio: 4/3;
  padding-bottom: 1.5rem;
}

.timeline-photo-card:hover {
  box-shadow: 
    0 10px 25px rgba(245, 158, 11, 0.2),
    0 20px 40px rgba(139, 92, 46, 0.12);
  z-index: 10;
  position: relative;
}

.timeline-photo-card::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent);
}

.timeline-photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

/* Lightbox popup tái sử dụng */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.lightbox-content {
  position: relative;
  width: 100%;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.lightbox-close {
  position: absolute;
  top: -3.5rem;
  right: 0;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.lightbox-image-wrap {
  perspective: 1200px;
  width: 100%;
  max-width: 900px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.lightbox-image-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.lightbox-image-inner img {
  max-width: 100%;
  max-height: 75vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255,255,255,0.1);
}

.lightbox-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 0.5rem 0;
}

.lightbox-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.lightbox-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.8);
}

.lightbox-counter {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.1rem;
  font-family: var(--font-sans);
  font-weight: 600;
  min-width: 5rem;
  text-align: center;
  background: rgba(0,0,0,0.5);
  padding: 0.4rem 1rem;
  border-radius: 20px;
}
`;

    fs.writeFileSync(filePath, css + timelineCss);
    console.log('CSS updated successfully!');
} else {
    console.log('Could not find marker in index.css');
}
