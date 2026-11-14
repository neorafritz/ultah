import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUp, ArrowUpRight, ArrowLeft, ArrowRight, Heart, Sparkles, X, Volume2, VolumeX } from 'lucide-react';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import birthdayImage from './assets/birthday-editorial.png';
import './style.css';

const chapters = ['Untukmu', 'Dari hati', 'Doa baik', 'Make a wish'];
const wishes = [
  {title:'Hati yang bahagia', text:'Semoga hatimu selalu punya tempat untuk tenang. Semoga kamu dikelilingi cinta yang tulus, dan selalu menemukan alasan kecil untuk tersenyum.'},
  {title:'Mimpi yang jadi nyata', text:'Semoga langkahmu semakin dekat dengan hal-hal yang kamu impikan. Jangan takut untuk mencoba, sayang. Aku akan selalu bangga melihatmu tumbuh.'},
  {title:'Hari yang penuh cinta', text:'Semoga lebih banyak tawa, pelukan hangat, dan kabar baik datang ke hidupmu. Kamu pantas dicintai dengan indah, hari ini dan setiap hari.'},
];
const letterPages = [
  ['Selamat ulang tahun, sayang.', 'Dua puluh tiga tahun dunia punya kamu. Dan dari semua hal indah yang pernah terjadi, mengenalmu adalah salah satu yang paling kusyukuri.', 'Terima kasih untuk tawamu, perhatian kecilmu, dan caramu membuat hari yang biasa terasa begitu istimewa.'],
  ['Aku bangga padamu.', 'Pada dirimu hari ini, pada langkah kecil yang terus kamu usahakan, dan pada semua mimpi yang masih kamu simpan.', 'Kamu tidak harus selalu kuat, Fadilla. Di hari yang berat, ada aku yang ingin mendengarkan ceritamu dan menemani langkahmu.'],
  ['Tetap jadi kamu, ya.', 'Semoga di usia barumu, kamu semakin berani memilih bahagia dan semakin lembut pada diri sendiri. Semoga yang kamu doakan menemukan jalannya.', 'Selamat membuka babak baru, Fadilla Fitri Azzahra. Aku ingin terus ada, untuk merayakan bahagiamu.'],
];

function useMusic() {
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const context = useRef(null);
  const timeout = useRef(null);
  useEffect(() => () => { clearTimeout(timeout.current); context.current?.close(); }, []);
  async function toggle() {
    try {
      clearTimeout(timeout.current);
      if (playing) { await context.current.suspend(); setPlaying(false); return; }
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { setUnavailable(true); return; }
      if (context.current?.currentTime > 50) { await context.current.close(); context.current = null; }
      if (!context.current) {
        const ctx = new Audio(); context.current = ctx;
        const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66];
        for (let i = 0; i < 72; i++) {
          const osc = ctx.createOscillator(), gain = ctx.createGain(), t = ctx.currentTime + i * .7;
          osc.frequency.value = notes[i % notes.length]; osc.type = 'sine';
          gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.055, t + .04);
          gain.gain.exponentialRampToValueAtTime(.001, t + 1.5);
          osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 1.6);
        }
      }
      await context.current.resume(); setPlaying(true);
      timeout.current = setTimeout(() => setPlaying(false), Math.max(0, (51.5 - context.current.currentTime) * 1000));
    } catch { setPlaying(false); setUnavailable(true); }
  }
  return {playing, unavailable, toggle};
}

function Letter({onClose}) {
  const [page, setPage] = useState(0);
  const close = useRef(null);
  useEffect(() => {
    const previous = document.activeElement; close.current.focus();
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const controls = [...document.querySelectorAll('.letter-dialog button:not(:disabled)')];
        if (e.shiftKey && document.activeElement === controls[0]) { e.preventDefault(); controls.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === controls.at(-1)) { e.preventDefault(); controls[0].focus(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {window.removeEventListener('keydown', handler); previous?.focus();};
  }, [onClose]);
  return <div className="letter-backdrop" onClick={onClose}>
    <section className="letter-dialog" role="dialog" aria-modal="true" aria-labelledby="letter-title" onClick={e=>e.stopPropagation()}>
      <button ref={close} className="close-letter" aria-label="Tutup surat" onClick={onClose}><X size={21}/></button>
      <span className="eyebrow">A LITTLE LOVE LETTER · {page + 1} / 3</span>
      <div className="letter-page" key={page}>
        <h2 id="letter-title">{letterPages[page][0]}</h2>
        <p>{letterPages[page][1]}</p><p>{letterPages[page][2]}</p>
      </div>
      <div className="letter-sign">Dengan seluruh sayangku,<br/><em>orang yang selalu memilihmu.</em><Heart size={18}/></div>
      <div className="letter-pagination"><button disabled={page===0} aria-label="Halaman surat sebelumnya" onClick={()=>setPage(page-1)}><ArrowLeft size={18}/></button><span>UNTUK FADILLA, SELALU.</span><button disabled={page===2} aria-label="Halaman surat berikutnya" onClick={()=>setPage(page+1)}><ArrowRight size={18}/></button></div>
    </section>
  </div>;
}

function App() {
  const [scene, setScene] = useState(0);
  const [direction, setDirection] = useState(1);
  const [letter, setLetter] = useState(false);
  const [wish, setWish] = useState(0);
  const [blown, setBlown] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const {playing, unavailable, toggle} = useMusic();
  const sceneRef = useRef(0), lock = useRef(0), touch = useRef(null), celebrationTimer = useRef(null);
  const closeLetter = useCallback(()=>setLetter(false), []);
  const go = useCallback((next) => {
    const bounded = Math.max(0, Math.min(chapters.length-1, next));
    if (bounded === sceneRef.current || performance.now() < lock.current) return;
    setDirection(bounded > sceneRef.current ? 1 : -1);
    sceneRef.current = bounded; lock.current = performance.now() + 850;
    setScene(bounded);
  }, []);
  useEffect(() => {
    let amount = 0, lastEvent = 0;
    const wheel = e => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (letter) return;
      const now = performance.now();
      if (now < lock.current) { amount = 0; lastEvent = now; return; }
      if (now - lastEvent > 180 || Math.sign(amount) !== Math.sign(e.deltaY)) amount = 0;
      lastEvent = now; amount += e.deltaY * (e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
      if (Math.abs(amount) >= 45) { go(sceneRef.current + Math.sign(amount)); amount=0; }
    };
    const keyboard = e => {
      if (letter || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('button, a, input, textarea, select')) return;
      if (['ArrowDown','ArrowRight','PageDown',' ','ArrowUp','ArrowLeft','PageUp','Home','End'].includes(e.key)) {
        e.preventDefault();
        if (e.key==='Home') go(0);
        else if(e.key==='End') go(3);
        else go(sceneRef.current + (['ArrowUp','ArrowLeft','PageUp'].includes(e.key) ? -1 : 1));
      }
    };
    window.addEventListener('wheel', wheel, {passive:false}); window.addEventListener('keydown',keyboard);
    return () => {window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',keyboard);};
  }, [go, letter]);
  useEffect(()=>()=>clearTimeout(celebrationTimer.current), []);
  const blow = () => {setBlown(true);setConfetti(true);clearTimeout(celebrationTimer.current);celebrationTimer.current=setTimeout(()=>setConfetti(false),5000);};
  const onTouchStart = e => { if(!e.target.closest('button, a, [role="dialog"]')) touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}; else touch.current=null; };
  const onTouchEnd = e => {
    if (!touch.current || letter) return;
    const dy=touch.current.y-e.changedTouches[0].clientY, dx=touch.current.x-e.changedTouches[0].clientX;
    if (Math.abs(dy)>45 && Math.abs(dy)>Math.abs(dx)) go(sceneRef.current+Math.sign(dy));
    touch.current=null;
  };
  return <div className={`experience chapter-${scene}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="visual" aria-hidden="true"><img className={`photo photo-${scene}`} src={birthdayImage} alt=""/><div className="image-shade"/></div>
    <div className="ambient-glow"/>
    <header className="header">
      <button className="brand" aria-label="Kembali ke pembuka" onClick={()=>go(0)}>f<span>.</span></button>
      <span className="header-label">A CELEBRATION OF <strong>YOU.</strong></span>
      <button className={`music ${playing?'playing':''}`} onClick={toggle} aria-label={playing?'Matikan musik':'Putar musik lembut'}>{playing?<Volume2 size={15}/>:<VolumeX size={15}/>}<span>{unavailable?'Musik tidak tersedia':playing?'Musik menyala':'Putar musik'}</span><i className="music-bars"><b/><b/><b/></i></button>
    </header>
    <main className={`stage ${direction<0?'backward':''}`} aria-label="Cerita ulang tahun Fadilla">
      <section key={scene} className={`scene scene-${scene}`} aria-labelledby={`title-${scene}`}>
        {scene===0 && <>
          <div className="eyebrow"><span className="live-dot"/> HAPPY BIRTHDAY, MY LOVE</div>
          <h1 id="title-0">Dua puluh<br/><em>tiga.</em><Sparkles className="title-flower" strokeWidth={1.2} aria-hidden="true"/></h1>
          <div className="name-line"><span/> FADILLA FITRI AZZAHRA</div>
          <p className="description">Dunia jadi lebih indah sejak ada kamu.<br/>Hari ini, semua yang manis adalah tentangmu.</p>
          <button className="primary" onClick={()=>go(1)}>Ada sesuatu untukmu <ArrowUpRight size={18}/></button>
          <span className="handwritten">this little world is yours. ♡</span>
        </>}
        {scene===1 && <>
          <div className="eyebrow"><Heart size={13}/> A LETTER TO MY FAVORITE PERSON</div>
          <h2 id="title-1">Kalau hati<br/>bisa <em>menulis.</em></h2>
          <p className="description">Mungkin tidak semua bisa kuucapkan.<br/>Tapi satu hal yang pasti: aku bersyukur,<br/>karena di hidup ini, aku bertemu kamu.</p>
          <button className="primary" onClick={()=>setLetter(true)}>Buka surat dariku <ArrowUpRight size={18}/></button>
          <span className="handwritten">a few words. a whole lot of love.</span>
        </>}
        {scene===2 && <>
          <div className="eyebrow"><Sparkles size={13}/> ALL THE GOOD THINGS, FOR YOU</div>
          <h2 id="title-2">Semoga semesta<br/>memelukmu <em>erat.</em></h2>
          <div className="wish-tabs" role="tablist" aria-label="Doa untuk Fadilla">{wishes.map((w,i)=><button key={w.title} id={`wish-tab-${i}`} role="tab" aria-selected={wish===i} aria-controls="wish-panel" onClick={()=>setWish(i)} tabIndex={wish===i?0:-1} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.stopPropagation();e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(wish+(e.key==='ArrowRight'?1:2))%3;setWish(n);document.getElementById(`wish-tab-${n}`).focus()}}}>0{i+1}<span>{['Hati','Mimpi','Hari-hari'][i]}</span></button>)}</div>
          <div className="wish-content" id="wish-panel" role="tabpanel" aria-labelledby={`wish-tab-${wish}`} tabIndex={0}><div key={wish}><h3>{wishes[wish].title}</h3><p>{wishes[wish].text}</p></div></div>
          <span className="handwritten">you deserve every beautiful thing.</span>
        </>}
        {scene===3 && <>
          <div className="eyebrow"><Sparkles size={13}/> A NEW CHAPTER. A LITTLE MAGIC.</div>
          <h2 id="title-3">Make a wish,<br/><em>sayang.</em></h2>
          <p className="description" aria-live="polite">{blown?<>Satu harapan sudah terbang ke semesta.<br/>Semoga semua yang baik menemukanmu. ♡</>:<>Pejamkan mata. Simpan satu harapan.<br/>Lalu tiup lilinnya, ini waktumu bersinar.</>}</p>
          <div className={`candle-token ${blown?'blown':''}`} aria-hidden="true"><span>2<i/></span><span>3<i/></span><div className="candle-rule"/></div>
          <button className="primary" onClick={blown?()=>{setBlown(false);setConfetti(false);clearTimeout(celebrationTimer.current)}:blow}>{blown?<><Heart size={16}/> Satu harapan lagi</>:<><Sparkles size={16}/> Tiup lilinnya</>}</button>
          <span className="handwritten">here’s to you. and all your tomorrows.</span>
        </>}
      </section>
    </main>
    <div className="photo-caption" aria-hidden="true"><span>FOR YOU,</span><em>always in bloom.</em><span className="caption-rule"/></div>
    <nav className="chapter-nav" aria-label="Pilih adegan">{chapters.map((name,i)=><button key={name} aria-label={`Adegan ${i+1}: ${name}`} aria-current={scene===i?'step':undefined} onClick={()=>go(i)}><span>{name}</span><i/></button>)}</nav>
    <footer className="footer"><div className="scene-counter"><strong>0{scene+1}</strong><span className="counter-line"/><span>04</span></div><div className="scroll-hint"><span className="scroll-mouse"><i/></span><span>{scene===3?'SETIAP AKHIR, AWAL YANG BARU':'SCROLL / SWIPE UNTUK LANJUT'}</span></div><div className="arrow-controls"><button aria-label="Adegan sebelumnya" onClick={()=>go(scene-1)} disabled={scene===0}><ArrowUp size={16}/></button><button aria-label={scene===3?'Ulangi dari awal':'Adegan berikutnya'} onClick={()=>go(scene===3?0:scene+1)}><ArrowDown size={16}/></button></div></footer>
    <div className="chapter-status" role="status" aria-live="polite">Adegan {scene+1} dari 4: {chapters[scene]}</div>
    {letter&&<Letter onClose={closeLetter}/>}
    {confetti&&<div className="confetti" aria-hidden="true">{Array.from({length:70},(_,i)=><i key={i} style={{left:`${i*37%100}%`,animationDelay:`${i%7*.1}s`,background:['#ff2d8d','#ff83be','#ffd9e9','#fff6f9'][i%4]}}/>)}</div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
