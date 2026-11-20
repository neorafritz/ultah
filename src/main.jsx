import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft, ArrowRight, BookOpen, Cake, Flower2, Heart, Mail, Music2, RotateCcw, RotateCw, VolumeX, X} from 'lucide-react';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import InteractiveBouquet from './components/InteractiveBouquet.jsx';
import bloom from './assets/bouquet/rose.png';
import floret from './assets/bouquet/filler.png';
import {chapters} from './chapters.js';
import {useMusic} from './useMusic.js';
import './style.css';

const number = index => String(index + 1).padStart(2, '0');

function ArtCard({chapter, index}) {
  const [flipped, setFlipped] = useState(false);
  const card = useRef(null);
  const tilt = event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    card.current.style.setProperty('--tilt', ((event.clientX - rect.left) / rect.width * 3 - 1.5) + 'deg');
    card.current.style.setProperty('--lift', (1.5 - (event.clientY - rect.top) / rect.height * 3) + 'deg');
  };
  const reset = () => {
    card.current.style.removeProperty('--tilt');
    card.current.style.removeProperty('--lift');
  };
  return <div className="art-desk" onPointerMove={tilt} onPointerLeave={reset}>
    <div className="postcard-stack" ref={card}>
      <button className={'postcard' + (flipped ? ' turned' : '')} aria-pressed={flipped} aria-describedby={flipped ? 'postcard-note' : 'postcard-art'}
        aria-label={flipped ? 'Lihat ilustrasi lagi' : 'Balik kartu untuk membaca catatan'} onClick={() => setFlipped(!flipped)}>
        <span className="card-side card-front" aria-hidden={flipped}>
          <span className="art-window">
            <img id="postcard-art" src={chapter.image} alt={chapter.alt} fetchPriority={index === 0 ? 'high' : 'auto'}/>
            {index < 3 && <span aria-hidden="true" className={'scene-motes motes-' + index}>{[0,1,2,3].map(i =>
              <i key={i} style={{'--n':i}}>{index === 2 ? <img alt="" src={floret}/> : '✦'}</i>)}</span>}
          </span>
          <span className="card-caption"><span>{chapter.caption}</span><span className="flip-hint"><RotateCw size={15}/> Balik kartu</span></span>
        </span>
        <span className="card-side card-back" aria-hidden={!flipped}>
          <span className="back-top">Kartu pos <span>{number(index)} / 06</span></span>
          <span className="back-to">Untuk Fadilla,</span>
          <span id="postcard-note" className="back-message">{chapter.note}</span>
          <span className="back-bottom"><Heart size={19}/><span className="flip-hint"><RotateCcw size={15}/> Lihat ilustrasi</span></span>
        </span>
      </button>
    </div>
  </div>;
}

function BirthdayLetter({alreadyRead, onRead, onClose, onNext}) {
  const dialog = useRef(null);
  const firstOpening = useRef(!alreadyRead);
  const [opened, setOpened] = useState(alreadyRead);
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current;
    node.showModal();
    return () => { node.close(); previous?.focus?.({preventScroll:true}); };
  }, []);
  const reveal = () => { setOpened(true); onRead(); };
  return <dialog ref={dialog} className="letter-dialog" aria-labelledby="letter-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <article className={'letter-sheet' + (opened ? ' opened' : '')}>
      <button className="round-action close-letter" aria-label="Tutup surat" onClick={onClose}><X size={18}/></button>
      <span className="letter-symbol" aria-hidden="true">{opened ? <Mail/> : <span className="birthday-candle"><i/></span>}</span>
      <div key={String(opened)} className="letter-content" aria-live="polite">
        <span className="microtype">{opened ? 'Surat untuk Fadilla' : 'Lilin ulang tahunmu'}</span>
        <h2 id="letter-title">{opened ? <>Di antara semua mimpiku,<br/><em>memilikimu yang paling indah.</em></> : <>Pejamkan mata,<br/><em>buat satu harapan.</em></>}</h2>
        <p>{opened ? 'Selamat ulang tahun, Fadilla. Semoga bahagiamu panjang, dan semoga aku selalu boleh jadi bagian dari ceritamu.' : 'Simpan harapan itu untuk dirimu sendiri. Kalau sudah siap, padamkan lilinnya.'}</p>
        {opened && <span className="letter-sign">Dengan seluruh sayangku ♡</span>}
        <button className="primary-action" onClick={opened ? onNext : reveal}>{opened ? 'Lanjut ke pagi' : 'Tiup lilinnya'} <ArrowRight size={17}/></button>
      </div>
      {opened && firstOpening.current && <div className="letter-sparks" aria-hidden="true">{Array.from({length:12}, (_, i) => <i key={i} style={{'--i':i}}>{i % 2 ? '✦' : '♡'}</i>)}</div>}
    </article>
  </dialog>;
}

function AlbumIndex({scene, go}) {
  const strip = useRef(null);
  useEffect(() => {
    const rail = strip.current;
    const selected = rail.children[scene];
    if (rail.scrollWidth > rail.clientWidth) {
      rail.scrollTo({left: selected.offsetLeft - (rail.clientWidth - selected.offsetWidth) / 2,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
  }, [scene]);
  return <footer className="album-index" aria-label="Isi album">
    <div className="index-heading"><span className="microtype"><BookOpen size={14}/> Isi album</span>
    </div>
    <nav className="chapter-strip" ref={strip} aria-label="Pilih bagian cerita">{chapters.map((item,i) =>
      <button key={item.name} onClick={() => go(i)} aria-current={i === scene ? 'step' : undefined} aria-label={'Bagian ' + (i+1) + ': ' + item.name}>
        <img src={item.thumbnail} alt="" loading={i === 0 ? 'eager' : 'lazy'}/>
        <span><small>{number(i)}</small><strong>{item.name}</strong></span>
      </button>
    )}</nav>
  </footer>;
}

function App() {
  const [scene, setScene] = useState(0);
  const [overlay, setOverlay] = useState(null);
  const [candlesOut, setCandlesOut] = useState(false);
  const [bouquetMade, setBouquetMade] = useState(() => {
    try { return localStorage.getItem('ultah.bouquet-finished') === 'yes'; } catch { return false; }
  });
  const {state:music, toggle} = useMusic();
  const chapter = chapters[scene];
  const story = useRef(null);
  const focusNewChapter = useRef(false);
  const touch = useRef(null);
  const go = useCallback(next => {
    if (next < 0 || next >= chapters.length) return;
    focusNewChapter.current = !!story.current?.contains(document.activeElement);
    setScene(next);
    window.scrollTo({top:0, behavior:'instant'});
  }, []);
  useEffect(() => {
    if (focusNewChapter.current) {
      story.current?.querySelector('h1,h2')?.focus({preventScroll:true});
      focusNewChapter.current = false;
    }
  }, [scene]);
  const closeOverlay = useCallback(() => setOverlay(null), []);
  const completeBouquet = useCallback(() => {
    setBouquetMade(true);
    try { localStorage.setItem('ultah.bouquet-finished','yes'); } catch {}
    setOverlay('letter');
  }, []);

  useEffect(() => {
    if (!overlay) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, [overlay]);
  useEffect(() => {
    if (overlay) return;
    const keys = event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
          event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
      const backwards = ['ArrowLeft','PageUp','ArrowUp'].includes(event.key);
      const forwards = ['ArrowRight','PageDown','ArrowDown'].includes(event.key);
      if (!backwards && !forwards && !['Home','End'].includes(event.key)) return;
      if (['ArrowUp','ArrowDown','PageDown','PageUp'].includes(event.key) && document.documentElement.scrollHeight > innerHeight + 2) return;
      event.preventDefault();
      if (event.key === 'Home') go(0);
      else if (event.key === 'End') go(chapters.length-1);
      else go(scene + (backwards ? -1 : 1));
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [scene,overlay,go]);
  useEffect(() => {
    if (overlay) return;
    let sum = 0, previous = 0, lockedUntil = 0;
    const wheel = event => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.documentElement.scrollHeight > innerHeight + 2 || event.target.closest?.('.chapter-strip')) return;
      const now = performance.now();
      if (now - previous > 240 || Math.sign(event.deltaY) !== Math.sign(sum)) sum = 0;
      previous = now;
      if (now < lockedUntil) return;
      sum += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(sum) >= 65) {
        const step = Math.sign(sum);
        setScene(current => Math.max(0, Math.min(chapters.length - 1, current + step)));
        sum = 0; lockedUntil = now + 900;
      }
    };
    window.addEventListener('wheel', wheel, {passive:true});
    return () => window.removeEventListener('wheel', wheel);
  }, [overlay]);
  function swipeEnd(event) {
    if (!touch.current || event.changedTouches.length !== 1) return;
    const {clientX, clientY} = event.changedTouches[0];
    const dx = clientX - touch.current.x, dy = clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > 1.5 * Math.abs(dy)) go(scene + (dx < 0 ? 1 : -1));
  }
  const startBouquet = () => { go(4); setOverlay('bouquet'); };
  function primaryAction() {
    if (scene === 4) startBouquet();
    else if (scene === 5) { setCandlesOut(false); go(0); }
    else go(scene + 1);
  }

  return <div className="birthday-site" style={{'--accent':chapter.color,'--paper':chapter.paper}}>
    <div className="album-shell" inert={overlay ? true : undefined}>
      <header className="album-header">
        <button className="wordmark" onClick={() => go(0)} aria-label="Untuk Fadilla, kembali ke awal"><span className="brand-stamp"><img src={bloom} alt=""/></span><span>Untuk Fadilla<span className="brand-period">.</span></span></button>
        <nav className="top-nav" aria-label="Navigasi utama">
          <button className={scene !== 4 ? 'active' : ''} onClick={() => go(0)}>Album</button>
          <button className={scene === 4 ? 'active' : ''} onClick={() => go(4)}>Wish</button>
          <button onClick={startBouquet}>Buket <Flower2 size={14}/></button>
        </nav>
        <button className="music-toggle" onClick={toggle} aria-pressed={music === 'on'} disabled={music === 'unavailable'}
          aria-label={music === 'on' ? 'Matikan musik' : music === 'unavailable' ? 'Musik tidak tersedia' : 'Putar musik'}>
          {music === 'on' ? <Music2 size={17}/> : <VolumeX size={17}/>}<span>{music === 'on' ? 'Musik aktif' : music === 'unavailable' ? 'Audio tidak tersedia' : 'Musik'}</span>
        </button>
      </header>
      <main className="album-main" aria-label="Kisah ulang tahun Fadilla">
        <section ref={story} key={scene} className={'spread spread-' + scene} aria-labelledby="spread-title"
          onTouchStart={event => {touch.current = event.touches.length === 1 ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;}}
          onTouchCancel={() => {touch.current = null;}} onTouchEnd={swipeEnd}>
          <div className="story-heading">
            <div className="chapter-label"><i/> {chapter.section}</div>
            {React.createElement(scene === 0 ? 'h1' : 'h2', {id:'spread-title',tabIndex:-1}, chapter.title, ' ', <em>{chapter.accent}</em>)}
            {scene === 0 && <p className="recipient">Fadilla Fitri Azzahra</p>}
          </div>
          <ArtCard chapter={chapter} index={scene}/>
          <div className="story-body">
            <p>{chapter.copy}</p>
            <div className="story-actions">
              <button className="primary-action" onClick={primaryAction}>{scene === 4 && bouquetMade ? 'Lihat buketmu lagi' : chapter.action} {scene === 4 ? <Flower2 size={17}/> : scene === 5 ? <RotateCcw size={16}/> : <ArrowRight size={17}/>}</button>
              {scene === 4 && <button className="text-action" onClick={() => setOverlay('letter')}>{candlesOut ? <Mail size={16}/> : <Cake size={17}/>} {candlesOut ? 'Baca lagi pesanku' : 'Tiup lilinnya'}</button>}
            </div>
          </div>
        </section>
        <div className="page-turns">
          <span>{chapter.name} <i/> <b>{number(scene)}</b> / 06</span>
          <button className="round-action" aria-label="Bagian sebelumnya" disabled={scene === 0} onClick={() => go(scene-1)}><ArrowLeft size={17}/></button>
          <button className="round-action" aria-label="Bagian berikutnya" disabled={scene === chapters.length-1} onClick={() => go(scene+1)}><ArrowRight size={17}/></button>
        </div>
      </main>
      <AlbumIndex scene={scene} go={go}/>
      <span aria-live="polite" className="screenreader-status">Bagian {scene+1} dari 6. {chapter.name}.</span>
    </div>
    {overlay === 'bouquet' && <InteractiveBouquet onClose={closeOverlay} onComplete={completeBouquet} recipient="Fadilla"/>}
    {overlay === 'letter' && <BirthdayLetter alreadyRead={candlesOut} onRead={() => setCandlesOut(true)} onClose={closeOverlay} onNext={() => {closeOverlay();go(5);}}/>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
