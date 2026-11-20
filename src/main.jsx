import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowDown, ArrowRight, ArrowUp, Cake, Flower2, Mail, Music2, RotateCcw, VolumeX, X} from 'lucide-react';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import InteractiveBouquet from './components/InteractiveBouquet.jsx';
import bloom from './assets/bouquet/rose.png';
import skyBackdrop from './assets/story/v2/story-sky-flat.jpg';
import {chapters} from './chapters.js';
import {useMusic} from './useMusic.js';
import './style.css';

const number = value => String(value).padStart(2, '0');

function ArtCard({chapter, index}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const noteId = 'scene-note-' + index;
  return <figure className="scene-art">
    <div className="scene-art-window">
      <img
        src={chapter.image}
        alt={chapter.alt}
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'auto'}
      />
    </div>
    <figcaption className="scene-art-caption">
      <span>{chapter.caption}</span>
      <button type="button" className="note-trigger" aria-expanded={noteOpen} aria-controls={noteId} onClick={() => setNoteOpen(!noteOpen)}>
        <Mail size={14}/><span>{noteOpen ? 'Tutup catatan' : 'Baca catatan'}</span>
      </button>
    </figcaption>
    <blockquote id={noteId} className="scene-note" hidden={!noteOpen}>
      <span>Untuk Fadilla,</span>
      <p>{chapter.note}</p>
    </blockquote>
  </figure>;
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

function App() {
  const [scene, setScene] = useState(0);
  const [sceneDirection, setSceneDirection] = useState('down');
  const [visitedScenes, setVisitedScenes] = useState(() => new Set([0]));
  const [overlay, setOverlay] = useState(null);
  const [candlesOut, setCandlesOut] = useState(false);
  const [bouquetMade, setBouquetMade] = useState(() => {
    try { return localStorage.getItem('ultah.bouquet-finished') === 'yes'; } catch { return false; }
  });
  const {state:music, toggle} = useMusic();
  const storyViewport = useRef(null);
  const sceneNodes = useRef([]);
  const lastObservedScene = useRef(0);
  const pendingFocus = useRef(null);
  const chapter = chapters[scene];

  useEffect(() => {
    const root = storyViewport.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      const index = Number(current.target.dataset.sceneIndex);
      if (index !== lastObservedScene.current) {
        setSceneDirection(index > lastObservedScene.current ? 'down' : 'up');
        lastObservedScene.current = index;
      }
      setScene(index);
      setVisitedScenes(previous => previous.has(index) ? previous : new Set([...previous,index]));
      if (pendingFocus.current === index) {
        current.target.querySelector('h1,h2')?.focus({preventScroll:true});
        pendingFocus.current = null;
      }
    }, {root, threshold:[.42,.62,.78]});
    sceneNodes.current.forEach(node => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const go = useCallback((next, focus = false) => {
    if (next < 0 || next >= chapters.length) return;
    if (focus) pendingFocus.current = next;
    const target = sceneNodes.current[next];
    if (!target) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'start'});
    if (focus && reducedMotion) {
      target.querySelector('h1,h2')?.focus({preventScroll:true});
      pendingFocus.current = null;
    }
  }, []);

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

  const startBouquet = () => { go(4); setOverlay('bouquet'); };
  const openChapterAction = index => {
    if (index === 4) startBouquet();
    else if (index === 5) { setCandlesOut(false); go(0); }
    else go(index + 1);
  };

  return <div className="birthday-site">
    <div className="album-shell" inert={overlay ? true : undefined}>
      <header className="album-header">
        <button className="wordmark" onClick={() => go(0)} aria-label="Untuk Fadilla, kembali ke awal cerita">
          <span className="brand-stamp"><img src={bloom} alt=""/></span><span>Untuk Fadilla<span className="brand-period">.</span></span>
        </button>
        <nav className="top-nav" aria-label="Navigasi cerita">
          <button className={scene !== 4 ? 'active' : ''} aria-current={scene !== 4 ? 'page' : undefined} onClick={() => go(0)}>Cerita</button>
          <button className={scene === 4 ? 'active' : ''} aria-current={scene === 4 ? 'page' : undefined} onClick={() => go(4)}>Harapan</button>
          <button onClick={startBouquet}>Buket <Flower2 size={15}/></button>
        </nav>
        <button className="music-toggle" onClick={toggle} aria-pressed={music === 'on'} disabled={music === 'unavailable'}
          aria-label={music === 'on' ? 'Matikan musik' : music === 'unavailable' ? 'Musik tidak tersedia' : 'Putar musik'}>
          {music === 'on' ? <Music2 size={17}/> : <VolumeX size={17}/>}<span>{music === 'on' ? 'Musik aktif' : music === 'unavailable' ? 'Audio tidak tersedia' : 'Musik'}</span>
        </button>
      </header>
      <main className="story-journey" ref={storyViewport} aria-label="Kisah ulang tahun Fadilla" style={{'--story-sky': `url(${skyBackdrop})`}}>
        {chapters.map((item,index) => <section
          key={item.name}
          ref={node => { sceneNodes.current[index] = node; }}
          data-scene-index={index}
          data-direction={sceneDirection}
          className={'spread spread-' + index + (scene === index ? ' is-active' : '') + (visitedScenes.has(index) ? ' is-seen' : '')}
          aria-labelledby={'spread-title-' + index}
          aria-current={scene === index ? 'step' : undefined}
          style={{'--scene-progress':(((index + 1) / chapters.length) * 100) + '%'}}>
          <div className="story-heading">
            <div className="chapter-label">{item.section}</div>
            {React.createElement(index === 0 ? 'h1' : 'h2', {id:'spread-title-' + index,tabIndex:-1}, item.title, ' ', <em>{item.accent}</em>)}
            {index === 0 && <p className="recipient">Fadilla Fitri Azzahra</p>}
          </div>
          <ArtCard chapter={item} index={index}/>
          <div className="story-body">
            <p>{item.copy}</p>
            <div className="story-actions">
              <button className="primary-action" onClick={() => openChapterAction(index)}>
                {index === 4 && bouquetMade ? 'Lihat buketmu lagi' : item.action}
                {index === 4 ? <Flower2 size={17}/> : index === 5 ? <RotateCcw size={16}/> : <ArrowDown size={17}/>}
              </button>
              {index === 4 && <button className="text-action" onClick={() => setOverlay('letter')}>
                {candlesOut ? <Mail size={16}/> : <Cake size={17}/>}{candlesOut ? 'Baca lagi pesanku' : 'Tiup lilinnya'}
              </button>}
            </div>
            <div className="page-turns">
              <div className="page-turn-copy"><span>{item.name}</span><b>{number(index + 1)} <i/> {number(chapters.length)}</b></div>
              <div className="page-progress" aria-hidden="true"><span/></div>
              <div className="page-turn-actions">
                <button className="round-action" aria-label="Adegan sebelumnya" disabled={index === 0} onClick={() => go(index - 1,true)}><ArrowUp size={17}/></button>
                <button className="round-action" aria-label="Adegan berikutnya" disabled={index === chapters.length - 1} onClick={() => go(index + 1,true)}><ArrowDown size={17}/></button>
              </div>
            </div>
          </div>
        </section>)}
      </main>
      <span aria-live="polite" className="screenreader-status">Bagian {scene+1} dari {chapters.length}: {chapter.name}.</span>
    </div>
    {overlay === 'bouquet' && <InteractiveBouquet onClose={closeOverlay} onComplete={completeBouquet} recipient="Fadilla"/>}
    {overlay === 'letter' && <BirthdayLetter alreadyRead={candlesOut} onRead={() => setCandlesOut(true)} onClose={closeOverlay} onNext={() => {closeOverlay();go(5);}}/>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
