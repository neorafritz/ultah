import React, {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowUp, Check, Download, Flower2, Plus, Redo2, RotateCcw, RotateCw, Trash2, Undo2, Upload, X} from 'lucide-react';
import './InteractiveBouquet.css';

const STORAGE_KEY = 'ultah.interactive-bouquet.v1';
const MAX_FLOWERS = 16;

const flowerTypes = {
  rose: 'Mawar',
  tulip: 'Tulip',
  carnation: 'Anyelir',
  filler: 'Bunga kecil'
};

const petalColors = {
  blush: {label: 'Merah muda lembut', light: '#ffe2e5', mid: '#ee91a8', dark: '#bb5476'},
  rose: {label: 'Mawar', light: '#ffcbd8', mid: '#df6287', dark: '#a93860'},
  coral: {label: 'Koral', light: '#ffd4cd', mid: '#ed8a86', dark: '#b95458'},
  peach: {label: 'Persik', light: '#ffe5d9', mid: '#efa397', dark: '#b96868'},
  ivory: {label: 'Krem', light: '#fff8e8', mid: '#e8cbb6', dark: '#ae8a7a'}
};

const wrapperColors = {
  blush: {label: 'Merah muda', light: '#fff0ee', mid: '#efb8bf', dark: '#d98e9e'},
  rose: {label: 'Rose', light: '#f9e3e0', mid: '#e79aa8', dark: '#c57288'},
  cream: {label: 'Krem', light: '#fff9ec', mid: '#e9d4c3', dark: '#c9ad9b'},
  mauve: {label: 'Mauve', light: '#f3e7ec', mid: '#d5afbf', dark: '#ae879f'},
  sage: {label: 'Sage', light: '#eff1e4', mid: '#bdc5a6', dark: '#909c7d'}
};

const ribbonColors = {
  rose: {label: 'Merah muda', light: '#ffc8d1', mid: '#df708d', dark: '#b14465'},
  cherry: {label: 'Merah ceri', light: '#f5a7b6', mid: '#c64d70', dark: '#8f3457'},
  cream: {label: 'Krem', light: '#fff2d8', mid: '#dfc29b', dark: '#ad896e'},
  mauve: {label: 'Mauve', light: '#e8c7d6', mid: '#bd829f', dark: '#895c7a'}
};

const wrapperStyles = [
  {id: 'folded', label: 'Lipat klasik'},
  {id: 'petal', label: 'Lipat lembut'},
  {id: 'pleated', label: 'Berlipit'}
];

const ribbonStyles = [
  {id: 'classic', label: 'Klasik'},
  {id: 'double', label: 'Pita ganda'},
  {id: 'slim', label: 'Ramping'}
];

const defaultFlowers = [
  {id: 'rose-blush', type: 'rose', color: 'blush', x: 375, y: 244, rotation: -9, scale: 1, zIndex: 2},
  {id: 'rose-deep', type: 'rose', color: 'rose', x: 508, y: 178, rotation: 3, scale: 1.1, zIndex: 6},
  {id: 'rose-peach', type: 'rose', color: 'peach', x: 625, y: 257, rotation: 10, scale: 0.96, zIndex: 5},
  {id: 'tulip-left', type: 'tulip', color: 'rose', x: 292, y: 170, rotation: -15, scale: 0.92, zIndex: 1},
  {id: 'tulip-center', type: 'tulip', color: 'blush', x: 486, y: 82, rotation: 1, scale: 0.96, zIndex: 7},
  {id: 'tulip-right', type: 'tulip', color: 'coral', x: 710, y: 181, rotation: 16, scale: 0.9, zIndex: 3},
  {id: 'carnation-left', type: 'carnation', color: 'peach', x: 397, y: 338, rotation: -8, scale: 0.94, zIndex: 8},
  {id: 'carnation-right', type: 'carnation', color: 'blush', x: 587, y: 335, rotation: 8, scale: 0.96, zIndex: 9},
  {id: 'filler-left', type: 'filler', color: 'ivory', x: 329, y: 294, rotation: -5, scale: 0.76, zIndex: 4},
  {id: 'filler-right', type: 'filler', color: 'blush', x: 673, y: 296, rotation: 6, scale: 0.78, zIndex: 10}
];

function createDefaultArrangement() {
  return {
    flowers: defaultFlowers.map((flower) => ({...flower})),
    wrapper: {color: 'blush', style: 'folded'},
    ribbon: {color: 'rose', style: 'classic', visible: true}
  };
}

function makeId(type) {
  return type + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeArrangement(value) {
  if (!value || !Array.isArray(value.flowers) || value.flowers.length === 0) {
    throw new Error('File buket tidak memiliki bunga.');
  }
  const ids = new Set();
  const flowers = value.flowers.slice(0, MAX_FLOWERS).map((flower, index) => {
    const idBase = typeof flower.id === 'string' ? flower.id : makeId('flower');
    let id = idBase.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || makeId('flower');
    while (ids.has(id)) id = id + '-' + index;
    ids.add(id);
    return {
      id,
      type: Object.prototype.hasOwnProperty.call(flowerTypes, flower.type) ? flower.type : 'rose',
      color: Object.prototype.hasOwnProperty.call(petalColors, flower.color) ? flower.color : 'blush',
      x: clamp(Number(flower.x) || 500, 205, 795),
      y: clamp(Number(flower.y) || 220, 65, 390),
      rotation: clamp(Number(flower.rotation) || 0, -180, 180),
      scale: clamp(Number(flower.scale) || 1, 0.62, 1.3),
      zIndex: Number.isFinite(Number(flower.zIndex)) ? Number(flower.zIndex) : index
    };
  });
  if (!flowers.length) throw new Error('File buket tidak memiliki bunga.');
  const wrapperColor = value.wrapper && Object.prototype.hasOwnProperty.call(wrapperColors, value.wrapper.color) ? value.wrapper.color : 'blush';
  const wrapperStyle = value.wrapper && wrapperStyles.some((item) => item.id === value.wrapper.style) ? value.wrapper.style : 'folded';
  const ribbonColor = value.ribbon && Object.prototype.hasOwnProperty.call(ribbonColors, value.ribbon.color) ? value.ribbon.color : 'rose';
  const ribbonStyle = value.ribbon && ribbonStyles.some((item) => item.id === value.ribbon.style) ? value.ribbon.style : 'classic';
  return {
    flowers,
    wrapper: {color: wrapperColor, style: wrapperStyle},
    ribbon: {color: ribbonColor, style: ribbonStyle, visible: value.ribbon?.visible !== false}
  };
}

function loadArrangement() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeArrangement(JSON.parse(saved)) : createDefaultArrangement();
  } catch {
    return createDefaultArrangement();
  }
}

function persistArrangement(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The bouquet remains usable when browser storage is unavailable.
  }
}

function curveFor(flower, index) {
  const startX = 500 + clamp((flower.x - 500) * 0.22, -72, 72);
  const startY = 616;
  const endY = flower.y + (flower.type === 'tulip' ? 42 : 32);
  const bend = ((index % 3) - 1) * 17;
  const c1 = {x: startX + bend, y: 478};
  const c2 = {x: flower.x - (flower.x - startX) * 0.08 + bend * 0.42, y: endY + 132};
  return {startX, startY, endX: flower.x, endY, c1, c2};
}

function bezierPoint(curve, t) {
  const u = 1 - t;
  const blend = (a, b, c, d) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  return {
    x: blend(curve.startX, curve.c1.x, curve.c2.x, curve.endX),
    y: blend(curve.startY, curve.c1.y, curve.c2.y, curve.endY)
  };
}

function bezierAngle(curve, t) {
  const u = 1 - t;
  const dx = 3 * u * u * (curve.c1.x - curve.startX) + 6 * u * t * (curve.c2.x - curve.c1.x) + 3 * t * t * (curve.endX - curve.c2.x);
  const dy = 3 * u * u * (curve.c1.y - curve.startY) + 6 * u * t * (curve.c2.y - curve.c1.y) + 3 * t * t * (curve.endY - curve.c2.y);
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

function Leaf({x, y, angle, side, index}) {
  const rotation = angle + (side === 'left' ? -48 : 45);
  return (
    <g transform={'translate(' + x + ' ' + y + ') rotate(' + rotation + ')'} className="bouquet-leaf">
      <path d="M0 0 C12 -17 34 -22 49 -10 C37 3 17 8 0 0Z" fill={index % 2 ? '#709466' : '#527f59'} />
      <path d="M2 0 C17 -5 31 -9 45 -11" fill="none" stroke="#b3c49a" strokeWidth="1.4" strokeLinecap="round" opacity=".78" />
    </g>
  );
}

function FlowerArtwork({flower, colors}) {
  const gradientId = 'petal-' + flower.id;
  const darkId = 'petal-dark-' + flower.id;
  return (
    <g transform={'rotate(' + flower.rotation + ') scale(' + flower.scale + ')'}>
      <g className="bouquet-flower-sway">
        {flower.type === 'rose' && (
          <g className="rose-art" stroke={colors.dark} strokeWidth="1.25" strokeLinejoin="round">
            <ellipse cx="0" cy="3" rx="43" ry="33" fill={'url(#' + gradientId + ')'} />
            <path d="M-34 8 C-51 -5 -43 -33 -22 -38 C-6 -42 1 -29 -8 -17 C8 -31 30 -23 30 -8 C31 6 16 17 1 13 C14 23 9 37 -9 38 C-25 38 -37 26 -34 8Z" fill={'url(#' + darkId + ')'} />
            <path d="M-21 4 C-31 -10 -18 -25 -5 -22 C5 -20 3 -9 -4 -5 C7 -15 20 -9 18 1 C16 11 6 16 -3 11 C4 21 -3 28 -13 23 C-21 19 -24 12 -21 4Z" fill={'url(#' + gradientId + ')'} />
            <path d="M-6 1 C-8 -7 2 -13 9 -8 C16 -3 11 5 5 6 C9 11 3 17 -3 13 C-8 10 -8 5 -6 1Z" fill={colors.light} />
            <path d="M-30 -6 C-25 -26 -12 -30 -4 -27 M12 -24 C25 -18 29 -8 26 0 M-28 19 C-18 28 -10 29 -3 27" fill="none" stroke={colors.light} strokeWidth="2.2" strokeLinecap="round" opacity=".76" />
          </g>
        )}
        {flower.type === 'tulip' && (
          <g className="tulip-art" stroke={colors.dark} strokeWidth="1.4" strokeLinejoin="round">
            <path d="M-40 28 C-46 14 -41 -7 -33 -28 C-28 -42 -20 -42 -14 -26 L-5 -52 C-1 -63 8 -62 12 -49 L19 -26 C27 -43 36 -41 41 -25 C48 -3 46 19 36 31 C20 51 -21 49 -40 28Z" fill={'url(#' + gradientId + ')'} />
            <path d="M-29 22 C-27 5 -23 -11 -14 -26 M2 39 C3 14 3 -28 5 -53 M30 22 C27 3 23 -11 18 -25" fill="none" stroke={colors.light} strokeWidth="2.4" strokeLinecap="round" opacity=".82" />
            <path d="M-17 35 Q0 43 18 35" fill="none" stroke={colors.dark} strokeWidth="1.2" opacity=".65" />
          </g>
        )}
        {flower.type === 'carnation' && (
          <g className="carnation-art" stroke={colors.dark} strokeWidth="1" strokeLinejoin="round">
            {Array.from({length: 14}, (_, index) => (
              <path key={index} d="M0 1 C-18 -8 -20 -28 -10 -39 C-3 -47 8 -39 8 -27 C20 -39 31 -30 25 -17 C22 -8 12 -2 0 1Z" fill={index % 2 ? 'url(#' + gradientId + ')' : 'url(#' + darkId + ')'} transform={'rotate(' + (index * 360 / 14) + ')'} />
            ))}
            <circle cx="0" cy="0" r="15" fill={'url(#' + gradientId + ')'} stroke={colors.dark} strokeWidth="1.2" />
            <path d="M-10 -3 Q-3 -12 4 -6 M4 7 Q12 0 9 -6 M-5 9 Q-11 4 -9 -2" fill="none" stroke={colors.light} strokeWidth="2.1" strokeLinecap="round" opacity=".84" />
          </g>
        )}
        {flower.type === 'filler' && (
          <g className="filler-art" stroke={colors.dark} strokeWidth="1" strokeLinejoin="round">
            {Array.from({length: 6}, (_, index) => (
              <ellipse key={index} cx="0" cy="-17" rx="9" ry="17" fill={'url(#' + gradientId + ')'} transform={'rotate(' + (index * 60) + ')'} />
            ))}
            <circle cx="0" cy="0" r="8" fill="#d9ae65" stroke="#ae8250" strokeWidth="1" />
            <circle cx="-2" cy="-2" r="2" fill="#fff3c8" opacity=".9" />
          </g>
        )}
      </g>
    </g>
  );
}

function BouquetWrapper({arrangement, wrapper, ribbon}) {
  const paper = wrapperColors[wrapper.color];
  const tie = ribbonColors[ribbon.color];
  const paperId = 'bouquet-paper-gradient';
  const ribbonId = 'bouquet-ribbon-gradient';
  return (
    <>
      <defs>
        <linearGradient id={paperId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={paper.light} />
          <stop offset=".56" stopColor={paper.mid} />
          <stop offset="1" stopColor={paper.dark} />
        </linearGradient>
        <linearGradient id={ribbonId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tie.light} />
          <stop offset=".55" stopColor={tie.mid} />
          <stop offset="1" stopColor={tie.dark} />
        </linearGradient>
      </defs>
      <g className={'bouquet-paper paper-' + wrapper.style} aria-hidden="true">
        <path d="M331 382 Q409 403 500 598 Q592 404 669 382 L636 559 Q584 610 500 626 Q416 610 364 559Z" fill="#9b6e6c" opacity=".11" transform="translate(0 8)" />
        <path d="M331 382 Q411 403 500 598 Q589 403 669 382 L636 554 Q575 608 500 626 Q425 608 364 554Z" fill={'url(#' + paperId + ')'} stroke={paper.dark} strokeWidth="2.2" strokeLinejoin="round" />
        {wrapper.style === 'folded' && (
          <>
            <path d="M331 382 Q389 423 500 598 Q425 537 364 554 Q344 470 331 382Z" fill={paper.light} opacity=".86" />
            <path d="M669 382 Q610 423 500 598 Q575 537 636 554 Q656 470 669 382Z" fill={paper.light} opacity=".56" />
            <path d="M364 554 Q422 520 500 598 M636 554 Q578 520 500 598" fill="none" stroke={paper.dark} strokeWidth="2" opacity=".7" />
          </>
        )}
        {wrapper.style === 'petal' && (
          <>
            <path d="M331 382 Q354 432 403 454 Q409 405 391 378 Q448 417 500 598 Q450 551 414 537 Q380 518 364 554Z" fill={paper.light} opacity=".78" />
            <path d="M669 382 Q646 432 597 454 Q591 405 609 378 Q552 417 500 598 Q550 551 586 537 Q620 518 636 554Z" fill={paper.light} opacity=".58" />
            <path d="M403 454 Q452 490 500 598 M597 454 Q548 490 500 598" fill="none" stroke={paper.dark} strokeWidth="1.8" opacity=".56" />
          </>
        )}
        {wrapper.style === 'pleated' && (
          <>
            <path d="M354 399 Q397 452 426 560 M391 411 Q436 486 457 590 M646 399 Q603 452 574 560 M609 411 Q564 486 543 590" fill="none" stroke={paper.light} strokeWidth="8" opacity=".6" />
            <path d="M374 431 Q430 492 476 594 M626 431 Q570 492 524 594" fill="none" stroke={paper.dark} strokeWidth="1.8" opacity=".42" />
          </>
        )}
        <path d="M500 598 Q480 612 464 619 M500 598 Q520 612 536 619" fill="none" stroke={paper.light} strokeWidth="3" strokeLinecap="round" opacity=".82" />
      </g>
      {ribbon.visible && (
        <g className={'bouquet-ribbon ribbon-' + ribbon.style} transform="translate(500 552)" aria-hidden="true">
          {ribbon.style === 'double' && (
            <g transform="scale(.78) translate(0 -13)" opacity=".74">
              <path d="M0 2 C-17 -29 -58 -52 -91 -32 C-113 -18 -99 7 -70 14 C-44 20 -17 13 0 2Z" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2" />
              <path d="M0 2 C17 -29 58 -52 91 -32 C113 -18 99 7 70 14 C44 20 17 13 0 2Z" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2" />
            </g>
          )}
          <path d="M-3 0 C-18 -29 -62 -52 -96 -30 C-117 -16 -99 10 -69 15 C-43 20 -16 11 -3 0Z" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2.2" />
          <path d="M3 0 C18 -29 62 -52 96 -30 C117 -16 99 10 69 15 C43 20 16 11 3 0Z" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2.2" />
          <path d="M-9 7 C-26 41 -46 68 -65 88 L-89 76 L-77 104 C-50 91 -28 57 -1 15Z" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 7 C26 41 46 68 65 88 L89 76 L77 104 C50 91 28 57 1 15Z" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2" strokeLinejoin="round" />
          {ribbon.style === 'slim' && (
            <g fill="none" stroke={tie.light} strokeWidth="2.3" opacity=".8">
              <path d="M-9 1 C-32 -24 -62 -36 -87 -24" />
              <path d="M9 1 C32 -24 62 -36 87 -24" />
            </g>
          )}
          <rect x="-15" y="-8" width="30" height="32" rx="9" fill={'url(#' + ribbonId + ')'} stroke={tie.dark} strokeWidth="2" />
          <path d="M-8 -2 Q0 -7 8 -2 M-7 10 Q0 15 7 10" fill="none" stroke={tie.light} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
        </g>
      )}
    </>
  );
}

function Swatches({items, selected, onChange, label}) {
  return (
    <div className="bouquet-swatches" role="group" aria-label={label}>
      {Object.entries(items).map(([key, item]) => (
        <button
          key={key}
          type="button"
          className={'bouquet-swatch ' + (selected === key ? 'is-active' : '')}
          style={{'--swatch-light': item.light, '--swatch-mid': item.mid, '--swatch-dark': item.dark}}
          aria-label={item.label}
          aria-pressed={selected === key}
          title={item.label}
          onClick={() => onChange(key)}
        />
      ))}
    </div>
  );
}

export default function InteractiveBouquet({onClose, onComplete, recipient = 'Fadilla'}) {
  const [arrangement, setArrangement] = useState(loadArrangement);
  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [settlingId, setSettlingId] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const arrangementRef = useRef(arrangement);
  const historyRef = useRef({past: [], future: []});
  const dragRef = useRef(null);
  const svgRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const importInputRef = useRef(null);
  const settleTimerRef = useRef(null);
  const currentFlower = arrangement.flowers.find((flower) => flower.id === selectedId) || null;
  const orderedFlowers = arrangement.flowers.slice().sort((a, b) => a.zIndex - b.zIndex);
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  useEffect(() => {
    arrangementRef.current = arrangement;
  }, [arrangement]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled):not([hidden]), input:not([type="hidden"]):not([hidden]), [tabindex="0"]:not([hidden])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearTimeout(settleTimerRef.current);
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };
  }, [onClose]);

  const refreshHistory = () => setHistoryVersion((version) => version + 1);

  const publishChange = (next, previous = arrangementRef.current) => {
    historyRef.current = {
      past: [...historyRef.current.past, previous].slice(-60),
      future: []
    };
    arrangementRef.current = next;
    setArrangement(next);
    persistArrangement(next);
    refreshHistory();
  };

  const updateLiveArrangement = (next) => {
    arrangementRef.current = next;
    setArrangement(next);
  };

  const undo = () => {
    const {past, future} = historyRef.current;
    if (!past.length) return;
    const current = arrangementRef.current;
    const previous = past[past.length - 1];
    historyRef.current = {past: past.slice(0, -1), future: [current, ...future].slice(0, 60)};
    arrangementRef.current = previous;
    setArrangement(previous);
    persistArrangement(previous);
    refreshHistory();
  };

  const redo = () => {
    const {past, future} = historyRef.current;
    if (!future.length) return;
    const current = arrangementRef.current;
    const next = future[0];
    historyRef.current = {past: [...past, current].slice(-60), future: future.slice(1)};
    arrangementRef.current = next;
    setArrangement(next);
    persistArrangement(next);
    refreshHistory();
  };

  const changeSelectedFlower = (change) => {
    if (!currentFlower) return;
    const current = arrangementRef.current;
    const next = {
      ...current,
      flowers: current.flowers.map((flower) => flower.id === currentFlower.id ? change(flower) : flower)
    };
    publishChange(next);
  };

  const addFlower = (type) => {
    if (arrangementRef.current.flowers.length >= MAX_FLOWERS) return;
    const current = arrangementRef.current;
    const index = current.flowers.length;
    const flower = {
      id: makeId(type),
      type,
      color: type === 'filler' ? 'ivory' : ['blush', 'rose', 'peach', 'coral'][index % 4],
      x: clamp(333 + (index % 6) * 67, 260, 740),
      y: clamp(132 + (index % 4) * 53, 95, 340),
      rotation: ((index * 17) % 36) - 18,
      scale: type === 'filler' ? 0.78 : 0.92,
      zIndex: Math.max(...current.flowers.map((item) => item.zIndex)) + 1
    };
    publishChange({...current, flowers: [...current.flowers, flower]});
    setSelectedId(flower.id);
  };

  const removeSelectedFlower = () => {
    if (!currentFlower || arrangementRef.current.flowers.length <= 1) return;
    const current = arrangementRef.current;
    const flowers = current.flowers.filter((flower) => flower.id !== currentFlower.id);
    publishChange({...current, flowers});
    setSelectedId(flowers[flowers.length - 1]?.id || null);
  };

  const changeLayer = (direction) => {
    if (!currentFlower) return;
    const flowers = arrangementRef.current.flowers;
    const level = currentFlower.zIndex;
    const neighbor = flowers
      .filter((flower) => direction > 0 ? flower.zIndex > level : flower.zIndex < level)
      .sort((a, b) => direction > 0 ? a.zIndex - b.zIndex : b.zIndex - a.zIndex)[0];
    if (!neighbor) return;
    const next = {
      ...arrangementRef.current,
      flowers: flowers.map((flower) => {
        if (flower.id === currentFlower.id) return {...flower, zIndex: neighbor.zIndex};
        if (flower.id === neighbor.id) return {...flower, zIndex: level};
        return flower;
      })
    };
    publishChange(next);
  };

  const changeWrapper = (key, value) => {
    const current = arrangementRef.current;
    publishChange({...current, [key]: {...current[key], ...value}});
  };

  const toScenePoint = (event) => {
    const svg = svgRef.current;
    if (!svg) return {x: 500, y: 300};
    const matrix = svg.getScreenCTM();
    if (!matrix) return {x: 500, y: 300};
    const screenPoint = svg.createSVGPoint();
    screenPoint.x = event.clientX;
    screenPoint.y = event.clientY;
    const scenePoint = screenPoint.matrixTransform(matrix.inverse());
    return {x: scenePoint.x, y: scenePoint.y};
  };

  const beginDrag = (event, flower) => {
    event.preventDefault();
    event.stopPropagation();
    const point = toScenePoint(event);
    const previous = arrangementRef.current;
    const highest = Math.max(...previous.flowers.map((item) => item.zIndex));
    const raised = flower.zIndex < highest
      ? {...previous, flowers: previous.flowers.map((item) => item.id === flower.id ? {...item, zIndex: highest + 1} : item)}
      : previous;
    dragRef.current = {
      pointerId: event.pointerId,
      id: flower.id,
      offsetX: flower.x - point.x,
      offsetY: flower.y - point.y,
      before: previous,
      changed: raised !== previous
    };
    try {
      svgRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may be unavailable in older embedded browsers.
    }
    setSelectedId(flower.id);
    setDraggingId(flower.id);
    updateLiveArrangement(raised);
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const point = toScenePoint(event);
    const current = arrangementRef.current;
    const flowers = current.flowers.map((flower) => {
      if (flower.id !== drag.id) return flower;
      const x = clamp(point.x + drag.offsetX, 210, 790);
      const y = clamp(point.y + drag.offsetY, 66, 392);
      if (Math.abs(x - flower.x) > 0.15 || Math.abs(y - flower.y) > 0.15) drag.changed = true;
      return {...flower, x, y};
    });
    updateLiveArrangement({...current, flowers});
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || (event && drag.pointerId !== event.pointerId)) return;
    const finalState = arrangementRef.current;
    dragRef.current = null;
    setDraggingId(null);
    if (drag.changed) {
      historyRef.current = {
        past: [...historyRef.current.past, drag.before].slice(-60),
        future: []
      };
      persistArrangement(finalState);
      refreshHistory();
    }
    setSettlingId(drag.id);
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => setSettlingId(null), 700);
  };

  const handleFlowerKey = (event, flower) => {
    const step = event.shiftKey ? 18 : 6;
    const move = {ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]};
    if (move[event.key]) {
      event.preventDefault();
      event.stopPropagation();
      changeSelectedFlower((item) => ({...item, x: clamp(item.x + move[event.key][0], 210, 790), y: clamp(item.y + move[event.key][1], 66, 392)}));
    } else if (event.key.toLowerCase() === 'r') {
      event.preventDefault();
      event.stopPropagation();
      const amount = event.shiftKey ? -15 : 15;
      changeSelectedFlower((item) => ({...item, rotation: clamp(item.rotation + amount, -180, 180)}));
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      event.stopPropagation();
      removeSelectedFlower();
    } else if (event.key === 'Home') {
      event.preventDefault();
      event.stopPropagation();
      changeLayer(1);
    } else if (event.key === 'End') {
      event.preventDefault();
      event.stopPropagation();
      changeLayer(-1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedId(flower.id);
    }
  };

  const exportArrangement = () => {
    const data = {
      version: 1,
      savedAt: new Date().toISOString(),
      recipient,
      ...arrangementRef.current
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'buket-untuk-' + recipient.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setImportMessage('Konfigurasi buket berhasil diunduh.');
  };

  const importArrangement = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = JSON.parse(await file.text());
      const normalized = normalizeArrangement(content);
      publishChange(normalized);
      setSelectedId(normalized.flowers[0]?.id || null);
      setImportMessage('Buket berhasil dimuat.');
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'File buket tidak bisa dibaca.');
    } finally {
      event.target.value = '';
    }
  };

  const resetArrangement = () => {
    const next = createDefaultArrangement();
    publishChange(next);
    setSelectedId(next.flowers[1].id);
    setImportMessage('Susunan buket dikembalikan ke awal. Kamu bisa mengurungkannya.');
  };

  return (
    <div className="bouquet-builder" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="bouquet-title">
      <header className="bouquet-builder-header">
        <div className="bouquet-builder-heading">
          <button ref={closeButtonRef} type="button" className="bouquet-close-button" aria-label="Tutup perangkai buket" onClick={onClose}><X size={19} /></button>
          <div>
            <span className="bouquet-eyebrow">BUKET DIGITAL · UNTUK {recipient.toUpperCase()}</span>
            <h2 id="bouquet-title">Rangkai bunga untukmu</h2>
          </div>
        </div>
        <div className="bouquet-header-actions" aria-label="Aksi susunan">
          <button type="button" className="bouquet-icon-button" aria-label="Urungkan" title="Urungkan" disabled={!canUndo} onClick={undo}><Undo2 size={18} /></button>
          <button type="button" className="bouquet-icon-button" aria-label="Ulangi" title="Ulangi" disabled={!canRedo} onClick={redo}><Redo2 size={18} /></button>
          <button type="button" className="bouquet-icon-button" aria-label="Atur ulang buket" title="Atur ulang buket" onClick={resetArrangement}><RotateCcw size={17} /></button>
          <button type="button" className="bouquet-finish-button" onClick={onComplete}><Check size={17} /><span>Selesai</span></button>
        </div>
      </header>

      <div className="bouquet-workspace">
        <main className="bouquet-stage-area" aria-label="Area merangkai bunga">
          <div className="bouquet-stage-caption">
            <span><Move size={14} /> Seret satu bunga untuk mengatur posisinya</span>
            <span className="bouquet-stage-count">{arrangement.flowers.length} bunga</span>
          </div>
          <div className="bouquet-canvas">
            <svg
              ref={svgRef}
              className="bouquet-svg"
              viewBox="0 0 1000 680"
              role="group"
              aria-label="Buket bunga yang dapat diatur"
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onLostPointerCapture={finishDrag}
            >
              <defs>
                <radialGradient id="bouquet-ground-shadow">
                  <stop offset="0" stopColor="#765d56" stopOpacity=".15" />
                  <stop offset="1" stopColor="#765d56" stopOpacity="0" />
                </radialGradient>
                {orderedFlowers.map((flower) => {
                  const colors = petalColors[flower.color];
                  return (
                    <React.Fragment key={'defs-' + flower.id}>
                      <radialGradient id={'petal-' + flower.id} cx=".34" cy=".22" r=".82">
                        <stop offset="0" stopColor={colors.light} />
                        <stop offset=".58" stopColor={colors.mid} />
                        <stop offset="1" stopColor={colors.dark} />
                      </radialGradient>
                      <linearGradient id={'petal-dark-' + flower.id} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={colors.mid} />
                        <stop offset="1" stopColor={colors.dark} />
                      </linearGradient>
                    </React.Fragment>
                  );
                })}
              </defs>
              <ellipse cx="500" cy="628" rx="245" ry="36" fill="url(#bouquet-ground-shadow)" />
              {orderedFlowers.map((flower, index) => {
                const curve = curveFor(flower, index);
                const leafOne = bezierPoint(curve, 0.35);
                const leafTwo = bezierPoint(curve, 0.54);
                const angleOne = bezierAngle(curve, 0.35);
                const angleTwo = bezierAngle(curve, 0.54);
                const path = 'M' + curve.startX + ' ' + curve.startY + ' C' + curve.c1.x + ' ' + curve.c1.y + ' ' + curve.c2.x + ' ' + curve.c2.y + ' ' + curve.endX + ' ' + curve.endY;
                return (
                  <g key={'stem-' + flower.id} className="bouquet-stem" aria-hidden="true">
                    <path d={path} className="bouquet-stem-shadow" />
                    <path d={path} className="bouquet-stem-line" />
                    <path d={path} className="bouquet-stem-highlight" />
                    <Leaf x={leafOne.x} y={leafOne.y} angle={angleOne} side="left" index={index} />
                    <Leaf x={leafTwo.x} y={leafTwo.y} angle={angleTwo} side="right" index={index} />
                  </g>
                );
              })}
              <BouquetWrapper wrapper={arrangement.wrapper} ribbon={arrangement.ribbon} />
              {orderedFlowers.map((flower, index) => {
                const colors = petalColors[flower.color];
                const isSelected = flower.id === selectedId;
                const isDragging = flower.id === draggingId;
                const isSettling = flower.id === settlingId;
                return (
                  <g
                    key={flower.id}
                    className={'bouquet-flower-object ' + (isSelected ? 'is-selected ' : '') + (isDragging ? 'is-dragging ' : '') + (isSettling ? 'is-settling' : '')}
                    transform={'translate(' + flower.x + ' ' + flower.y + ')'}
                    role="button"
                    aria-label={flowerTypes[flower.type] + ', ' + colors.label + '. Gunakan panah untuk memindahkan, R untuk memutar.'}
                    aria-pressed={isSelected}
                    tabIndex="0"
                    onPointerDown={(event) => beginDrag(event, flower)}
                    onClick={() => setSelectedId(flower.id)}
                    onKeyDown={(event) => handleFlowerKey(event, flower)}
                  >
                    <circle className="bouquet-selection-ring" r="57" />
                    <FlowerArtwork flower={flower} colors={colors} />
                    <circle className="bouquet-flower-hit-area" r="55" />
                    <title>{flowerTypes[flower.type]} · {colors.label}</title>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="bouquet-selection-bar" aria-live="polite">
            {currentFlower ? (
              <>
                <span className="bouquet-selection-name">{flowerTypes[currentFlower.type]} dipilih</span>
                <button type="button" aria-label="Putar berlawanan arah jarum jam" title="Putar ke kiri" onClick={() => changeSelectedFlower((flower) => ({...flower, rotation: clamp(flower.rotation - 15, -180, 180)}))}><RotateCcw size={17} /></button>
                <button type="button" aria-label="Putar searah jarum jam" title="Putar ke kanan" onClick={() => changeSelectedFlower((flower) => ({...flower, rotation: clamp(flower.rotation + 15, -180, 180)}))}><RotateCw size={17} /></button>
                <button type="button" aria-label="Pindah ke belakang" title="Pindah ke belakang" onClick={() => changeLayer(-1)}><ArrowDown size={17} /></button>
                <button type="button" aria-label="Pindah ke depan" title="Pindah ke depan" onClick={() => changeLayer(1)}><ArrowUp size={17} /></button>
                <button type="button" aria-label="Hapus bunga terpilih" title="Hapus bunga" disabled={arrangement.flowers.length <= 1} onClick={removeSelectedFlower}><Trash2 size={17} /></button>
              </>
            ) : (
              <span>Pilih bunga untuk memutar, mengubah warna, atau menghapusnya.</span>
            )}
          </div>
        </main>

        <aside className="bouquet-tools" aria-label="Pengaturan buket">
          <section className="bouquet-tool-group">
            <div className="bouquet-group-heading"><Flower2 size={17} /><h3>Pilih bunga</h3></div>
            <p className="bouquet-help">Tambahkan satu per satu, lalu seret ke susunanmu.</p>
            <div className="bouquet-library">
              {Object.entries(flowerTypes).map(([type, label]) => (
                <button key={type} type="button" className="bouquet-library-button" disabled={arrangement.flowers.length >= MAX_FLOWERS} onClick={() => addFlower(type)}>
                  <span className={'bouquet-library-flower library-' + type} aria-hidden="true"><i /><i /><i /><i /><b /></span>
                  <span>{label}</span><Plus size={15} />
                </button>
              ))}
            </div>
            {arrangement.flowers.length >= MAX_FLOWERS && <p className="bouquet-help bouquet-limit-message">Buket sudah penuh. Hapus satu bunga untuk menambahkan lagi.</p>}
          </section>

          <section className="bouquet-tool-group">
            <div className="bouquet-group-heading"><span className="bouquet-group-number">01</span><h3>Warna bunga</h3></div>
            {currentFlower ? (
              <>
                <p className="bouquet-help">Untuk {flowerTypes[currentFlower.type].toLowerCase()} yang dipilih.</p>
                <Swatches items={petalColors} selected={currentFlower.color} label="Warna bunga terpilih" onChange={(color) => changeSelectedFlower((flower) => ({...flower, color}))} />
              </>
            ) : <p className="bouquet-help">Pilih salah satu bunga di buket lebih dulu.</p>}
          </section>

          <section className="bouquet-tool-group">
            <div className="bouquet-group-heading"><span className="bouquet-group-number">02</span><h3>Kertas pembungkus</h3></div>
            <Swatches items={wrapperColors} selected={arrangement.wrapper.color} label="Warna kertas pembungkus" onChange={(color) => changeWrapper('wrapper', {color})} />
            <div className="bouquet-style-options" role="group" aria-label="Gaya lipatan kertas">
              {wrapperStyles.map((style) => <button key={style.id} type="button" className={arrangement.wrapper.style === style.id ? 'is-active' : ''} aria-pressed={arrangement.wrapper.style === style.id} onClick={() => changeWrapper('wrapper', {style: style.id})}>{style.label}</button>)}
            </div>
          </section>

          <section className="bouquet-tool-group">
            <div className="bouquet-group-heading"><span className="bouquet-group-number">03</span><h3>Pita</h3></div>
            <Swatches items={ribbonColors} selected={arrangement.ribbon.color} label="Warna pita" onChange={(color) => changeWrapper('ribbon', {color})} />
            <div className="bouquet-style-options" role="group" aria-label="Gaya pita">
              {ribbonStyles.map((style) => <button key={style.id} type="button" className={arrangement.ribbon.style === style.id ? 'is-active' : ''} aria-pressed={arrangement.ribbon.style === style.id} onClick={() => changeWrapper('ribbon', {style: style.id})}>{style.label}</button>)}
            </div>
            <button type="button" className="bouquet-ribbon-toggle" aria-pressed={arrangement.ribbon.visible} onClick={() => changeWrapper('ribbon', {visible: !arrangement.ribbon.visible})}>
              {arrangement.ribbon.visible ? 'Lepas pita' : 'Pasang pita'}
            </button>
          </section>

          <section className="bouquet-tool-group bouquet-file-actions">
            <div className="bouquet-group-heading"><span className="bouquet-group-number">04</span><h3>Simpan susunan</h3></div>
            <p className="bouquet-help">Buket tersimpan otomatis di perangkat ini. Kamu juga bisa mengunduh atau memuat file JSON.</p>
            <div className="bouquet-file-buttons">
              <button type="button" onClick={exportArrangement}><Download size={16} /> Unduh JSON</button>
              <button type="button" onClick={() => importInputRef.current?.click()}><Upload size={16} /> Muat JSON</button>
              <input ref={importInputRef} type="file" accept="application/json,.json" onChange={importArrangement} hidden />
            </div>
            <p className="bouquet-live-message" aria-live="polite">{importMessage || 'Gunakan Tab, Enter, dan tombol panah untuk mengatur bunga.'}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
