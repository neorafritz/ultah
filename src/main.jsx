import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Heart, Sparkles, Volume2, VolumeX, X} from 'lucide-react';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import apart from './assets/story/01-apart.webp';
import dream from './assets/story/02-dream.webp';
import reunion from './assets/story/03-reunion.webp';
import gift from './assets/story/04-gift.webp';
import cake from './assets/story/05-cake.webp';
import waking from './assets/story/06-waking.webp';
import InteractiveBouquet from './components/InteractiveBouquet.jsx';
import './style.css';

const chapters=['Happy Birthday','Mimpi','Bertemu','Hadiah','Harapan','Terbangun'];
const images=[apart,dream,reunion,gift,cake,waking];
function useMusic(){
 const [playing,setPlaying]=useState(false),[unavailable,setUnavailable]=useState(false);
 const audio=useRef(null),timer=useRef(null);
 useEffect(()=>()=>{clearTimeout(timer.current);audio.current?.close()},[]);
 const toggle=async()=>{try{
  clearTimeout(timer.current);
  if(playing){await audio.current?.suspend();setPlaying(false);return}
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC){setUnavailable(true);return}
  if(audio.current?.currentTime>45){await audio.current.close();audio.current=null}
  if(!audio.current){const ctx=new AC();audio.current=ctx;const notes=[261.63,329.63,392,523.25,440,392,329.63,293.66];for(let i=0;i<64;i++){const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+i*.72;osc.type='sine';osc.frequency.value=notes[i%notes.length];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.04,t+.05);gain.gain.exponentialRampToValueAtTime(.001,t+1.5);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+1.6)}}
  await audio.current.resume();setPlaying(true);timer.current=setTimeout(()=>setPlaying(false),Math.max(0,(46-audio.current.currentTime)*1000));
 }catch{setPlaying(false);setUnavailable(true)}};
 return{playing,unavailable,toggle};
}
function LoveOverlay({onClose}){
 const close=useRef(null);
 useEffect(()=>{const old=document.activeElement;close.current?.focus();const key=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){e.preventDefault();close.current?.focus()}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);old?.focus()}},[onClose]);
 return <div className="love-overlay" onClick={onClose}>
  <div className="love-note" role="dialog" aria-modal="true" aria-labelledby="love-title" onClick={e=>e.stopPropagation()}>
   <button ref={close} className="love-close" onClick={onClose} aria-label="Tutup pesan cinta"><X size={20}/></button>
   <Heart className="love-heart" size={30} strokeWidth={1.3}/>
   <span className="love-kicker">SATU PESAN KECIL, DARI HATIKU</span>
   <h2 id="love-title">Di antara semua mimpiku,<br/><em>memilikimu yang paling indah.</em></h2>
   <p>Selamat ulang tahun, Fadilla. Semoga bahagiamu panjang—<br/>dan semoga aku selalu boleh jadi bagian dari ceritamu.</p>
   <span className="love-signature">Dengan seluruh sayangku <Heart size={14}/></span>
  </div>
 </div>;
}
function App(){
 const [scene,setScene]=useState(0),[direction,setDirection]=useState(1),[candlesOut,setCandlesOut]=useState(false),[loveOpen,setLoveOpen]=useState(false),[confetti,setConfetti]=useState(false),[bouquetOpen,setBouquetOpen]=useState(false),[bouquetMade,setBouquetMade]=useState(false);
 const{playing,unavailable,toggle}=useMusic();
 const active=useRef(0),cooldown=useRef(0),touch=useRef(null),celebrationTimer=useRef(null);
 const closeLove=useCallback(()=>setLoveOpen(false),[]);
 const closeBouquet=useCallback(()=>setBouquetOpen(false),[]);
 const completeBouquet=useCallback(()=>{setBouquetMade(true);setBouquetOpen(false)},[]);
 const go=useCallback(next=>{const n=Math.max(0,Math.min(chapters.length-1,next));if(n===active.current||performance.now()<cooldown.current)return;setDirection(n>active.current?1:-1);active.current=n;cooldown.current=performance.now()+800;setScene(n)},[]);
 useEffect(()=>{images.forEach(src=>{const pre=new Image();pre.src=src})},[]);
 useEffect(()=>{
  let delta=0,last=0;
  const wheel=e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||bouquetOpen||loveOpen)return;e.preventDefault();const now=performance.now();if(now<cooldown.current){delta=0;last=now;return}if(now-last>180||Math.sign(delta)!==Math.sign(e.deltaY))delta=0;last=now;delta+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(delta)>=45){go(active.current+Math.sign(delta));delta=0}};
  const key=e=>{if(bouquetOpen||loveOpen||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a,input,textarea,select,[role="tab"]'))return;if(['ArrowDown','ArrowRight','PageDown',' ','ArrowUp','ArrowLeft','PageUp','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home')go(0);else if(e.key==='End')go(5);else go(active.current+(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:1))}};
  window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);return()=>{window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key)};
 },[go,loveOpen,bouquetOpen]);
 useEffect(()=>()=>clearTimeout(celebrationTimer.current),[]);
 const touchStart=e=>{if(!e.target.closest('button,a,[role="dialog"]'))touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch.current=null};
 const touchEnd=e=>{if(!touch.current||loveOpen||bouquetOpen)return;const dy=touch.current.y-e.changedTouches[0].clientY,dx=touch.current.x-e.changedTouches[0].clientX;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx))go(active.current+Math.sign(dy));else if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy))go(active.current+Math.sign(dx));touch.current=null};
 const blowCandles=()=>{setCandlesOut(true);setLoveOpen(true);setConfetti(true);clearTimeout(celebrationTimer.current);celebrationTimer.current=setTimeout(()=>setConfetti(false),4800)};
 const navTo=[0,2,4];
 return <div className={`birthday-site scene-${scene}`} onTouchStart={touchStart} onTouchEnd={touchEnd}>
  <div className="scene-art" key={`image-${scene}`} aria-hidden="true"><img src={images[scene]} alt="" fetchPriority={scene===0?'high':'auto'}/></div>
  <div className="scene-wash" aria-hidden="true"/>
  <header className="topbar">
   <button className="monogram" onClick={()=>go(0)} aria-label="Kembali ke awal">f<span>♡</span></button>
   <span className="occasion">A LITTLE STORY <i>FOR FADILLA</i></span>
   <nav aria-label="Navigasi cerita">{['Home','Story','Wish'].map((label,i)=><button key={label} className={((i===0&&scene===0)||(i===1&&(scene===1||scene===2||scene===3))||(i===2&&scene>=4))?'current':''} onClick={()=>go(navTo[i])}>{label}</button>)}</nav>
   <button className="sound-toggle" onClick={toggle} aria-label={playing?'Matikan musik':'Putar musik'}>{playing?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{unavailable?'':'Music'}</span></button>
  </header>
  <main className={`story-area ${direction<0?'reverse':''}`} aria-label="Kisah ulang tahun Fadilla">
   <section className={`story-scene story-${scene}`} key={`story-${scene}`} aria-labelledby={`story-title-${scene}`}>
    {scene===0&&<>
     <span className="story-kicker"><i/> A STORY FOR YOUR 23RD BIRTHDAY</span>
     <h1 id="story-title-0">Happy <em>23rd</em><br/>Birthday<span className="pink-dot">!</span></h1>
     <p className="scene-subtitle">Fadilla Fitri Azzahra</p>
     <p className="scene-copy">Malam ini, ada kisah kecil tentang<br/>dua hati yang saling mencari.</p>
     <button className="story-cta" onClick={()=>go(1)}>Mulai cerita kita <ArrowRight size={17}/></button>
    </>}
    {scene===1&&<>
     <span className="story-kicker"><Heart size={14}/> EVEN APART, YOU'RE CLOSE</span>
     <h2 id="story-title-1" className="story-heading">Jauh di mata,<br/><em>dekat di mimpi.</em></h2>
     <p className="scene-copy">Malam memisahkan kita oleh dinding dan jarak.<br/>Tapi saat mata terpejam, aku selalu menemukanmu.</p>
     <button className="story-cta" onClick={()=>go(2)}>Ikuti mimpi kita <Sparkles size={16}/></button>
    </>}
    {scene===2&&<>
     <span className="story-kicker"><Sparkles size={14}/> AND THEN, THE WORLD TURNED PINK</span>
     <h2 id="story-title-2" className="story-heading">Mimpi yang<br/><em>hanya milik kita.</em></h2>
     <p className="scene-copy">Di bawah langit biru dan bunga yang beterbangan,<br/>akhirnya kita bertemu di tempat paling indah.</p>
     <button className="story-cta" onClick={()=>go(3)}>Temukan aku <ArrowRight size={17}/></button>
    </>}
    {scene===3&&<>
     <span className="story-kicker"><Heart size={14}/> AT LAST, TOGETHER</span>
     <h2 id="story-title-3" className="story-heading">Akhirnya,<br/><em>aku menemukanmu.</em></h2>
     <p className="scene-copy">Pelukan yang terasa seperti pulang.<br/>Genggaman tangan yang tak ingin kulepaskan.</p>
     <button className="story-cta" onClick={()=>go(4)}>Ada kejutan untukmu <ArrowRight size={17}/></button>
    </>}
    {scene===4&&<>
     <span className="story-kicker"><Sparkles size={14}/> A LITTLE SURPRISE, JUST FOR YOU</span>
     <h2 id="story-title-4" className="story-heading">Bunga untukmu,<br/><em>dan satu harapan.</em></h2>
     <p className="scene-copy">Rangkai bunga pilihanmu jadi buket kecil<br/>sebelum kita meniup lilin bersama.</p>
     <div className="story-actions">
      <button className="story-cta" onClick={()=>setBouquetOpen(true)}>{bouquetMade?'Lihat buketmu lagi':'Rangkai buket untukmu'} <ArrowRight size={17}/></button>
      <button className="story-cta story-cta-secondary" onClick={()=>{if(!candlesOut)blowCandles();else setLoveOpen(true)}}>{candlesOut?'Baca lagi pesanku':'Tiup lilinnya, sayang'} <Sparkles size={16}/></button>
     </div>
    </>}
    {scene===5&&<>
     <span className="story-kicker"><Sparkles size={14}/> WAKE UP, MY SLEEPYHEAD</span>
     <h2 id="story-title-5" className="story-heading">Yah, hampir<br/><em>jadi kenyataan!</em></h2>
     <p className="scene-copy">Belum sempat ciuman, kita malah terbangun—<br/>rambut acak-acakan, masih sama-sama ngiler!<br/>Untung ulang tahunmu bukan mimpi. ♡</p>
     <p className="scene-subtitle waking-signoff">Selamat ulang tahun, Fadilla. Aku sayang kamu.</p>
     <button className="story-cta" onClick={()=>{setCandlesOut(false);setLoveOpen(false);go(0)}}>Putar lagi mimpi kita <ArrowUp size={17}/></button>
    </>}
   </section>
   {scene===4&&<div className={`candle-flames ${candlesOut?'flames-out':''}`} aria-hidden="true"><i/><i/><i/><span/></div>}
  </main>
  {scene===4&&<div className={`cake-vignette ${candlesOut?'out':''}`} aria-hidden="true"/>}
  <div className="story-nav" role="group" aria-label="Pilih bagian cerita">{chapters.map((name,i)=><button aria-label={`Bagian ${i+1}: ${name}`} aria-current={scene===i?'step':undefined} onClick={()=>go(i)} key={name}><span>{name}</span><i/></button>)}</div>
  <footer className="bottom-bar">
   <span className="counter"><strong>0{scene+1}</strong><i/>0{chapters.length}</span>
   <span className="scroll-guide"><ArrowDown size={13}/> SCROLL TO FOLLOW OUR STORY</span>
   <div className="stepper"><button disabled={scene===0} aria-label="Bagian sebelumnya" onClick={()=>go(scene-1)}><ArrowLeft size={16}/></button><button disabled={scene===5} aria-label="Bagian berikutnya" onClick={()=>go(scene+1)}><ArrowRight size={16}/></button></div>
  </footer>
  <span className="screenreader-status" aria-live="polite">Bagian {scene+1} dari 6: {chapters[scene]}</span>
  {bouquetOpen&&<InteractiveBouquet onClose={closeBouquet} onComplete={completeBouquet} recipient="Fadilla"/>}
  {loveOpen&&<LoveOverlay onClose={closeLove}/>}
  {confetti&&<div className="confetti" aria-hidden="true">{Array.from({length:65},(_,i)=><i key={i} style={{left:`${i*37%100}%`,animationDelay:`${i%7*.11}s`,background:['#ff55a2','#ffb2d1','#ffe2ed','#fff'][i%4]}}/>)}</div>}
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
