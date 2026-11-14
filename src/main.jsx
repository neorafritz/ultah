import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/dm-serif-display/latin-400.css';
import opening from './assets/story/01-opening.webp';
import path from './assets/story/02-path.webp';
import wishes from './assets/story/03-wishes.webp';
import flowers from './assets/story/04-flowers.webp';
import secret from './assets/story/05-secret.webp';
import finale from './assets/story/06-finale.webp';
import closedGift from './assets/objects/gift-closed.png';
import openGift from './assets/objects/gift-open.png';
import {chapters, personalize, personalization} from './data/story.js';
import './style.css';

const illustrations = [opening, path, wishes, flowers, secret, finale];
const confettiColors = ['#7de8ff', '#b4f5ff', '#ffda8a', '#ff91bb', '#ffffff'];

function App() {
  const [scene, setScene] = useState(0);
  const [direction, setDirection] = useState(1);
  const [giftIsOpen, setGiftIsOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const activeScene = useRef(0);
  const cooldown = useRef(0);
  const touchStart = useRef(null);
  const dialog = useRef(null);
  const celebrationTimer = useRef(null);

  const goToScene = useCallback((next) => {
    const target = Math.max(0, Math.min(chapters.length - 1, next));
    if (target === activeScene.current || performance.now() < cooldown.current) return;
    setDirection(target > activeScene.current ? 1 : -1);
    activeScene.current = target;
    cooldown.current = performance.now() + 720;
    setLetterOpen(false);
    setScene(target);
  }, []);

  const openPresent = useCallback(() => {
    setGiftIsOpen(true);
    setLetterOpen(true);
    setCelebrating(true);
    clearTimeout(celebrationTimer.current);
    celebrationTimer.current = setTimeout(() => setCelebrating(false), 4200);
  }, []);

  const closeLetter = useCallback(() => setLetterOpen(false), []);

  useEffect(() => {
    illustrations.concat([closedGift, openGift]).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
    return () => clearTimeout(celebrationTimer.current);
  }, []);

  useEffect(() => {
    const onWheel = (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (letterOpen) return;
      if (Math.abs(event.deltaY) > 28) goToScene(activeScene.current + Math.sign(event.deltaY));
    };
    const onKeyDown = (event) => {
      if (letterOpen || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('button,[role="button"],input,textarea,select')) return;
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault();
        goToScene(activeScene.current + 1);
      }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        goToScene(activeScene.current - 1);
      }
      if (event.key === 'Home') goToScene(0);
      if (event.key === 'End') goToScene(chapters.length - 1);
    };
    window.addEventListener('wheel', onWheel, {passive: false});
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goToScene, letterOpen]);

  useEffect(() => {
    if (!letterOpen) return undefined;
    const previousFocus = document.activeElement;
    dialog.current?.focus();
    const onDialogKey = (event) => {
      if (event.key === 'Escape') closeLetter();
    };
    window.addEventListener('keydown', onDialogKey);
    return () => {
      window.removeEventListener('keydown', onDialogKey);
      previousFocus?.focus?.();
    };
  }, [letterOpen, closeLetter]);

  const onTouchStart = (event) => {
    if (event.target.closest('[role="button"],button,[role="dialog"]')) {
      touchStart.current = null;
      return;
    }
    touchStart.current = {x: event.touches[0].clientX, y: event.touches[0].clientY};
  };

  const onTouchEnd = (event) => {
    if (!touchStart.current || letterOpen) return;
    const deltaY = touchStart.current.y - event.changedTouches[0].clientY;
    const deltaX = touchStart.current.x - event.changedTouches[0].clientX;
    if (Math.abs(deltaY) > 48 && Math.abs(deltaY) > Math.abs(deltaX)) {
      goToScene(activeScene.current + Math.sign(deltaY));
    } else if (Math.abs(deltaX) > 66 && Math.abs(deltaX) > Math.abs(deltaY)) {
      goToScene(activeScene.current + Math.sign(deltaX));
    }
    touchStart.current = null;
  };

  const openWithKeyboard = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPresent();
    }
  };

  const chapter = chapters[scene];

  return (
    <div className={'birthday-template scene-' + scene} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="scene-backdrop" key={'backdrop-' + scene} aria-hidden="true">
        <img src={illustrations[scene]} alt="" fetchPriority={scene === 0 ? 'high' : 'auto'} />
      </div>
      <div className="scene-veil" aria-hidden="true" />
      <div className="floating-petals" aria-hidden="true">
        {Array.from({length: 9}, (_, index) => (
          <i key={index} style={{'--petal-x': (index * 19 + 7) % 100 + '%', '--petal-delay': (index % 6) * -1.1 + 's', '--petal-speed': 10 + index % 5 * 2 + 's'}} />
        ))}
      </div>

      <header className="template-header">
        <div className="brand-lockup" aria-label="Bluehour birthday story template">
          <span className="brand-mark">b<span>.</span></span>
          <span className="brand-type"><strong>bluehour</strong><small>A BIRTHDAY STORY</small></span>
        </div>
        <span className="template-edition">AN EDITABLE LITTLE FILM</span>
        <div className="chapter-count"><strong>{String(scene + 1).padStart(2, '0')}</strong><i />06</div>
      </header>

      <main className="story-stage" aria-label="Cerita ulang tahun">
        <section className={'story-copy ' + (direction < 0 ? 'copy-reverse' : '')} key={'copy-' + scene} aria-labelledby={'chapter-title-' + scene}>
          <p className="chapter-kicker"><i />{chapter.kicker}</p>
          <h1 id={'chapter-title-' + scene}>
            {personalize(chapter.title[0])}<br />
            <em>{personalize(chapter.title[1])}</em>
          </h1>
          <p className="chapter-message">{personalize(chapter.message)}</p>
          {scene === 4 && <p className="object-hint"><span>✧</span> Sentuh kotak hadiah biru di samping ini</p>}
          {scene === 5 && <p className="chapter-signoff">{personalize('[Nama Pacarmu]')}, kamu pantas dirayakan.</p>}
        </section>

        {scene === 4 && (
          <div className="gift-stage">
            <span className="gift-aura" aria-hidden="true" />
            <img
              className={'interactive-gift ' + (giftIsOpen ? 'gift-open-state' : '')}
              src={giftIsOpen ? openGift : closedGift}
              alt={giftIsOpen ? 'Hadiah terbuka, sentuh untuk membaca pesan' : 'Kotak hadiah biru, sentuh untuk membuka pesan ulang tahun'}
              role="button"
              aria-label={giftIsOpen ? 'Buka kembali pesan ulang tahun' : 'Sentuh kotak hadiah untuk membuka pesan ulang tahun'}
              aria-pressed={letterOpen}
              tabIndex={0}
              onClick={openPresent}
              onKeyDown={openWithKeyboard}
            />
            <span className="gift-caption">SENTUH UNTUK MEMBUKA</span>
          </div>
        )}
      </main>

      <nav className="chapter-rail" aria-label="Navigasi bab cerita">
        {chapters.map((item, index) => (
          <button
            key={item.kicker}
            className={'rail-dot ' + (scene === index ? 'is-current' : '')}
            aria-label={'Bab ' + (index + 1) + ': ' + item.kicker}
            aria-current={scene === index ? 'step' : undefined}
            onClick={() => goToScene(index)}
          ><span /></button>
        ))}
      </nav>

      <footer className="story-footer">
        <span className="scroll-instruction"><i /> GULIR, SWIPE, ATAU GESER UNTUK MENJELAJAH</span>
        <div className="progress-track" aria-hidden="true"><i style={{width: ((scene + 1) / chapters.length * 100) + '%'}} /></div>
        <span className="footer-signature">MADE FOR <b>{personalize(personalization.recipient)}</b></span>
      </footer>

      <span className="screen-reader-status" aria-live="polite">Bab {scene + 1} dari {chapters.length}: {personalize(chapter.kicker)}</span>

      {letterOpen && (
        <div className="letter-overlay" onClick={closeLetter}>
          <section ref={dialog} className="birthday-letter" role="dialog" aria-modal="true" aria-labelledby="letter-title" tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <span className="letter-spark" aria-hidden="true">✦</span>
            <p className="letter-kicker">A NOTE FROM SOMEONE WHO LOVES YOU</p>
            <h2 id="letter-title">Untuk <em>{personalize(personalization.recipient)}</em>,</h2>
            <p className="letter-message">Selamat ulang tahun ke-{personalize(personalization.age)}. Semoga semua yang kamu doakan pelan-pelan menemukan jalannya. Terima kasih sudah membuat hari-hariku terasa lebih hangat. Aku akan selalu mendukung setiap mimpi yang ingin kamu kejar.</p>
            <p className="letter-signature">Dengan sayang, <em>{personalize(personalization.sender)}</em></p>
            <span className="letter-dismiss">SENTUH AREA KOSONG UNTUK KEMBALI</span>
          </section>
        </div>
      )}

      {celebrating && <div className="celebration-particles" aria-hidden="true">
        {Array.from({length: 52}, (_, index) => (
          <i key={index} style={{left: (index * 37 % 100) + '%', backgroundColor: confettiColors[index % confettiColors.length], animationDelay: (index % 8) * 0.09 + 's'}} />
        ))}
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
