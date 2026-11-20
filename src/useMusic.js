import {useEffect, useRef, useState} from 'react';

// Schedule one short phrase ahead. Suspending the context freezes the melody in place.
const phrase = [72, 76, 79, 76, 74, 77, 81, 77, 76, 79, 83, 79, 74, 71, 67, 71];
const bass = [48, 50, 52, 43];

function note(context, output, midi, time, volume, length) {
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  envelope.gain.setValueAtTime(.0001, time);
  envelope.gain.exponentialRampToValueAtTime(volume, time + .025);
  envelope.gain.exponentialRampToValueAtTime(.0001, time + length);
  oscillator.connect(envelope).connect(output);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  oscillator.start(time);
  oscillator.stop(time + length);
}

export function useMusic() {
  const [state, setState] = useState('off');
  const player = useRef(null);
  const busy = useRef(false);

  useEffect(() => () => {
    if (player.current) {
      clearInterval(player.current.timer);
      player.current.context.close().catch(() => {});
      player.current = null;
    }
  }, []);

  async function toggle() {
    if (busy.current) return;
    busy.current = true;
    try {
      if (!player.current) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) { setState('unavailable'); return; }
        const context = new Audio();
        const output = context.createGain();
        output.gain.value = .65;
        output.connect(context.destination);
        let step = 0;
        let next = context.currentTime + .06;
        const schedule = () => {
          if (context.state !== 'running') return;
          if (next < context.currentTime) next = context.currentTime + .04;
          while (next <= context.currentTime + .65) {
            note(context, output, phrase[step], next, .09, 1.12);
            if (step % 4 === 0) note(context, output, bass[step / 4], next, .045, 1.8);
            step = (step + 1) % phrase.length;
            next += .41;
          }
        };
        player.current = {context, timer: setInterval(schedule, 300), schedule};
      }
      const {context, schedule} = player.current;
      if (state === 'on') {
        await context.suspend();
        setState('off');
      } else {
        await context.resume();
        schedule();
        setState('on');
      }
    } catch { setState('unavailable'); }
    finally { busy.current = false; }
  }
  return {state, toggle};
}
