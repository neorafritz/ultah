import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Heart, Sparkles, Volume2, VolumeX} from 'lucide-react';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import birthday from './assets/scenes/birthday.webp';
import letter from './assets/scenes/letter.webp';
import wishesImage from './assets/scenes/wishes.webp';
import finale from './assets/scenes/finale.webp';
import './style.css';

const chapters=['Home','Gallery','Wish','Make a wish'];
const backgrounds=[birthday,letter,wishesImage,finale];
const wishes=[
  {title:'Hati yang selalu bahagia.',text:'Semoga hatimu selalu punya ruang untuk tenang. Semoga kamu dikelilingi cinta yang tulus, dan selalu punya alasan kecil untuk tersenyum.'},
  {title:'Semua mimpimu jadi nyata.',text:'Semoga langkahmu membawamu semakin dekat ke hal-hal yang kamu impikan. Jangan pernah ragu untuk bersinar; aku akan selalu jadi orang yang paling bangga padamu.'},
  {title:'Hari-hari penuh cinta.',text:'Semoga ada lebih banyak tawa, pelukan hangat, bunga-bunga, dan kabar baik yang datang. Kamu pantas mendapatkan semua hal indah itu.'},
];
const letterPages=[
  {heading:'My dearest, Fadilla.',paragraphs:['Happy 23rd birthday, sayang. Hari ini dunia sedang merayakan seseorang yang begitu istimewa. Dan aku bersyukur, dari semua orang di dunia, akulah yang boleh mengenalmu sedekat ini.','Terima kasih untuk senyummu, perhatian kecilmu, dan caramu mengubah hari biasa jadi terasa jauh lebih indah.']},
  {heading:'Aku bangga padamu.',paragraphs:['Pada dirimu hari ini, langkah kecil yang terus kamu usahakan, dan semua mimpi yang masih kamu simpan.','Kamu tidak harus selalu kuat, ya. Di hari yang berat, ada aku yang selalu ingin mendengarkan ceritamu, menemani langkahmu, dan mengingatkan betapa hebat dirimu.']},
  {heading:'Semoga bahagiamu panjang.',paragraphs:['Semoga umur dua puluh tiga membawamu pada lebih banyak tawa, hari-hari yang menenangkan, dan hal-hal baik yang pantas kamu dapatkan.','Teruslah jadi Fadilla yang lembut, kuat, dan penuh cahaya. Aku sayang kamu—hari ini, besok, dan di setiap bab berikutnya.']},
];
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
 return {playing,unavailable,toggle};
}
function LetterContent({onStep}){
 const [page,setPage]=useState(0);
 return <>
  <div className="script-kicker"><Heart size={15}/> A LITTLE LOVE LETTER, JUST FOR YOU</div>
  <h2 className="story-heading" id="scene-title-1">Words from<br/><em>my heart.</em></h2>
  <article className="letter-copy" aria-live="polite" key={page}>
   <h3>{letterPages[page].heading}</h3>
   {letterPages[page].paragraphs.map(p=><p key={p}>{p}</p>)}
   <span className="letter-signoff">Dengan seluruh sayangku,<br/><em>orang yang selalu memilihmu.</em> <Heart size={15}/></span>
  </article>
  <div className="letter-controls" aria-label="Halaman surat">
   <button disabled={page===0} aria-label="Surat sebelumnya" onClick={()=>setPage(page-1)}><ArrowLeft size={16}/></button>
   <span>{page+1} <i/> {letterPages.length}</span>
   <button aria-label={page===letterPages.length-1?'Lanjut ke doa': 'Surat selanjutnya'} onClick={()=>page===letterPages.length-1?onStep():setPage(page+1)}>{page===letterPages.length-1?<ArrowRight size={16}/>:<ArrowRight size={16}/>}</button>
  </div>
 </>;
}
function App(){
 const [scene,setScene]=useState(0),[direction,setDirection]=useState(1),[wish,setWish]=useState(0),[wished,setWished]=useState(false),[sparkle,setSparkle]=useState(false);
 const {playing,unavailable,toggle}=useMusic();
 const index=useRef(0),cooldown=useRef(0),touch=useRef(null),sparkleTimer=useRef(null);
 const go=useCallback(next=>{const n=Math.max(0,Math.min(chapters.length-1,next));if(n===index.current||performance.now()<cooldown.current)return;setDirection(n>index.current?1:-1);index.current=n;cooldown.current=performance.now()+760;setScene(n)},[]);
 useEffect(()=>{backgrounds.forEach(src=>{const preload=new Image();preload.src=src})},[]);
 useEffect(()=>{let delta=0,last=0;const wheel=e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();const now=performance.now();if(now<cooldown.current){delta=0;last=now;return}if(now-last>180||Math.sign(delta)!==Math.sign(e.deltaY))delta=0;last=now;delta+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(delta)>=45){go(index.current+Math.sign(delta));delta=0}};const key=e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a,input,textarea,select,[role="tab"]'))return;if(['ArrowDown','ArrowRight','PageDown',' ','ArrowUp','ArrowLeft','PageUp','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home')go(0);else if(e.key==='End')go(3);else go(index.current+(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:1))}};window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('keydown',key);return()=>{window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key)}},[go]);
 useEffect(()=>()=>clearTimeout(sparkleTimer.current),[]);
 const startTouch=e=>{if(!e.target.closest('button,a,[role="tab"]'))touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch.current=null};
 const endTouch=e=>{if(!touch.current)return;const dy=touch.current.y-e.changedTouches[0].clientY,dx=touch.current.x-e.changedTouches[0].clientX;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx))go(index.current+Math.sign(dy));else if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy))go(index.current+Math.sign(dx));touch.current=null};
 const makeWish=()=>{setWished(true);setSparkle(true);clearTimeout(sparkleTimer.current);sparkleTimer.current=setTimeout(()=>setSparkle(false),4500)};
 return <div className={`birthday-site scene-${scene}`} onTouchStart={startTouch} onTouchEnd={endTouch}>
  <div className="scene-art" key={`art-${scene}`} aria-hidden="true"><img src={backgrounds[scene]} alt="" fetchPriority={scene===0?'high':'auto'}/></div>
  <div className="art-wash" aria-hidden="true"/>
  <header className="topbar">
   <button className="monogram" onClick={()=>go(0)} aria-label="Kembali ke Home">f<span>♡</span></button>
   <span className="occasion">A LITTLE BIRTHDAY SURPRISE <i>FOR FADILLA</i></span>
   <nav aria-label="Navigasi cerita">{chapters.slice(0,3).map((label,i)=><button key={label} className={((i===0&&scene===0)||(i===1&&(scene===1||scene===2))||(i===2&&scene===3))?'current':''} onClick={()=>go([0,1,3][i])}>{label}</button>)}</nav>
   <button className="sound-toggle" onClick={toggle} aria-label={playing?'Matikan musik':'Putar musik'}>{playing?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{unavailable?'':'Music'}</span></button>
  </header>
  <main className={`story-area ${direction<0?'reverse':''}`}>
   <section className="story-scene" key={scene} aria-labelledby={`scene-title-${scene}`}>
    {scene===0&&<>
     <span className="script-kicker"><i className="tiny-heart">♥</i> THIS DAY IS ALL ABOUT YOU</span>
     <h1 id="scene-title-0">Happy <em>23rd</em><br/>Birthday<span className="pink-dot">.</span></h1>
     <p className="subtitle">Untuk perempuan kesayanganku,</p>
     <p className="intro-copy">Fadilla Fitri Azzahra.<br/>Semoga hari ini seindah dirimu.<br/><span>Selamat ulang tahun, sayang ♡</span></p>
     <button className="wish-button" onClick={()=>go(1)}>Buka surat dariku <ArrowRight size={16}/></button>
    </>}
    {scene===1&&<>
     <LetterContent onStep={()=>go(2)}/>
    </>}
    {scene===2&&<>
     <span className="script-kicker"><Sparkles size={14}/> ALL MY WISHES, FOR YOU</span>
     <h2 className="story-heading" id="scene-title-2">Semoga semesta<br/><em>memelukmu erat.</em></h2>
     <div className="wish-tabs" role="tablist" aria-label="Pilih doa ulang tahun">{wishes.map((w,i)=><button role="tab" id={`wish-${i}`} aria-selected={wish===i} aria-controls="wish-message" tabIndex={wish===i?0:-1} key={w.title} onClick={()=>setWish(i)} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();const n=e.key==='Home'?0:e.key==='End'?2:(wish+(e.key==='ArrowRight'?1:2))%3;setWish(n);document.getElementById(`wish-${n}`).focus()}}}><span>0{i+1}</span>{['Hati','Mimpi','Bahagia'][i]}</button>)}</div>
     <div className="wish-message" id="wish-message" role="tabpanel" aria-labelledby={`wish-${wish}`} tabIndex={0} key={wish}><h3>{wishes[wish].title}</h3><p>{wishes[wish].text}</p></div>
     <button className="text-link" onClick={()=>go(3)}>Ada satu harapan lagi <ArrowRight size={16}/></button>
    </>}
    {scene===3&&<>
     <span className="script-kicker"><Sparkles size={14}/> THE WISH IS YOURS TO MAKE</span>
     <h2 className="story-heading" id="scene-title-3">Make a wish,<br/><em>my love.</em></h2>
     <p className="final-note" aria-live="polite">{wished?'Semoga semua harapan baik menemukan jalannya. ♡':'Pejamkan mata. Simpan satu harapan di hati.'}</p>
     <div className={`birthday-sparkles ${sparkle?'sparkling':''}`} aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
     <button className="wish-button" onClick={makeWish}>{wished?'Rayakan sekali lagi':'Aku sudah membuat harapan'} <Sparkles size={16}/></button>
     <span className="closing-script">Here’s to you — and every beautiful tomorrow.</span>
    </>}
   </section>
  </main>
  <div className="story-nav" aria-label="Pilih adegan">{chapters.map((name,i)=><button aria-label={`${i+1}. ${name}`} aria-current={scene===i?'step':undefined} onClick={()=>go(i)} key={name}><span>{name}</span><i/></button>)}</div>
  <footer className="bottom-bar">
   <span className="counter"><strong>0{scene+1}</strong><i/>0{chapters.length}</span>
   <span className="scroll-guide"><b>↕</b> SCROLL TO KEEP CELEBRATING</span>
   <div className="stepper"><button disabled={scene===0} aria-label="Adegan sebelumnya" onClick={()=>go(scene-1)}><ArrowLeft size={16}/></button><button disabled={scene===3} aria-label="Adegan berikutnya" onClick={()=>go(scene+1)}><ArrowRight size={16}/></button></div>
  </footer>
  <span className="screenreader-status" aria-live="polite">Adegan {scene+1} dari 4: {chapters[scene]}</span>
  {sparkle&&<div className="confetti" aria-hidden="true">{Array.from({length:65},(_,i)=><i key={i} style={{left:`${i*37%100}%`,animationDelay:`${i%7*.11}s`,background:['#ff55a2','#ffb2d1','#ffe2ed','#fff'][i%4]}}/>)}</div>}
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
