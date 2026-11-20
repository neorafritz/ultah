import React, {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowUp, Check, Download, Flower2, Heart, Layers, Mail, Plus, Redo2, RotateCcw, RotateCw, Shuffle, Trash2, Undo2, Upload, X} from 'lucide-react';
import {useBouquetPostcard} from './bouquetPostcard.js';
import roseImage from '../assets/bouquet/rose.png';
import tulipImage from '../assets/bouquet/tulip.png';
import carnationImage from '../assets/bouquet/carnation.png';
import fillerImage from '../assets/bouquet/filler.png';
import leafPairImage from '../assets/bouquet/leaf-pair.png';
import stemImage from '../assets/bouquet/stem.png';
import foldedWrapperImage from '../assets/bouquet/wrapper-folded.png';
import petalWrapperImage from '../assets/bouquet/wrapper-petal.png';
import pleatedWrapperImage from '../assets/bouquet/wrapper-pleated.png';
import classicRibbonImage from '../assets/bouquet/ribbon-classic.png';
import doubleRibbonImage from '../assets/bouquet/ribbon-double.png';
import slimRibbonImage from '../assets/bouquet/ribbon-slim.png';
import './InteractiveBouquet.css';

const STORAGE_KEY = 'ultah.interactive-bouquet.v1';
const MAX_FLOWERS = 16;
const revealFlowerArt = [roseImage, tulipImage, carnationImage, fillerImage, leafPairImage];
const toolPanels = [
  {id: 'flowers', label: 'Bunga', Icon: Flower2},
  {id: 'wrap', label: 'Bungkus', Icon: Layers},
  {id: 'card', label: 'Kartu', Icon: Mail}
];

const palettes = [
  {name: 'Kebun persik', petals: ['ivory', 'peach', 'coral', 'blush'], paper: 'sage', fold: 'petal', ribbon: 'cream', bow: 'slim'},
  {name: 'Senja mawar', petals: ['rose', 'blush', 'peach', 'rose'], paper: 'cream', fold: 'pleated', ribbon: 'cherry', bow: 'double'},
  {name: 'Embun pagi', petals: ['blush', 'ivory', 'peach', 'ivory'], paper: 'mauve', fold: 'folded', ribbon: 'mauve', bow: 'classic'}
];

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

const flowerImages = {
  rose: roseImage,
  tulip: tulipImage,
  carnation: carnationImage,
  filler: fillerImage
};

const flowerFilters = {
  blush: 'saturate(.88) brightness(1.04)',
  rose: 'saturate(1.22) brightness(.87) contrast(1.04)',
  coral: 'hue-rotate(13deg) saturate(1.12) brightness(1.04)',
  peach: 'hue-rotate(23deg) saturate(.84) brightness(1.09)',
  ivory: 'grayscale(.92) sepia(.52) saturate(.85) brightness(1.26)'
};

const wrapperImages = {
  folded: foldedWrapperImage,
  petal: petalWrapperImage,
  pleated: pleatedWrapperImage
};

const wrapperFilters = {
  blush: 'saturate(.9) brightness(1.03)',
  rose: 'hue-rotate(-8deg) saturate(1.12) brightness(.97)',
  cream: 'grayscale(.52) sepia(.3) saturate(.78) brightness(1.1)',
  mauve: 'hue-rotate(15deg) saturate(.58) brightness(.97)',
  sage: 'hue-rotate(66deg) saturate(.58) brightness(1.01)'
};

const ribbonImages = {
  classic: classicRibbonImage,
  double: doubleRibbonImage,
  slim: slimRibbonImage
};

const ribbonFilters = {
  rose: 'saturate(1.08) brightness(.98)',
  cherry: 'hue-rotate(-8deg) saturate(1.22) brightness(.84) contrast(1.04)',
  cream: 'grayscale(.74) sepia(.45) saturate(.68) brightness(1.2)',
  mauve: 'hue-rotate(15deg) saturate(.58) brightness(.96)'
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
    flowers: defaultFlowers.map(flower => ({
      ...flower,
      x: 500 + (flower.x - 500) * .84,
      y: 310 + (flower.y - 310) * .75,
    })),
    message: '',
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
    message: typeof value.message === 'string' ? value.message.slice(0, 100) : '',
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
  const endY = flower.y + (flower.type === 'tulip' ? 31 : 32);
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

function Leaf({x, y, mirrored = false}) {
  return (
    <g transform={'translate(' + x + ' ' + y + ') scale(' + (mirrored ? -1 : 1) + ' 1)'}>
      <image href={leafPairImage} x="-58" y="-74" width="90" height="77" className="bouquet-leaf" aria-hidden="true" />
    </g>
  );
}

function StemArtwork({curve, flower, index}) {
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const start = {x: curve.startX, y: curve.startY};
  const end = {x: curve.endX, y: curve.endY};
  const estimatedLength = distance(start, curve.c1) + distance(curve.c1, curve.c2) + distance(curve.c2, end);
  const segmentCount = clamp(Math.ceil(estimatedLength / 42), 7, 16);
  const stemWidth = 6.2 * flower.scale;
  const overlap = 3.5;

  return Array.from({length: segmentCount}, (_, segmentIndex) => {
    const start = bezierPoint(curve, segmentIndex / segmentCount);
    const end = bezierPoint(curve, (segmentIndex + 1) / segmentCount);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const rotation = Math.atan2(dy, dx) * 180 / Math.PI - 90;
    const imageHeight = length + overlap;

    return (
      <image
        key={'stem-' + index + '-' + segmentIndex}
        href={stemImage}
        x={centerX - stemWidth / 2}
        y={centerY - imageHeight / 2}
        width={stemWidth}
        height={imageHeight}
        preserveAspectRatio="none"
        transform={'rotate(' + rotation + ' ' + centerX + ' ' + centerY + ')'}
        className="bouquet-stem-image"
        aria-hidden="true"
      />
    );
  });
}

function FlowerArtwork({flower, bloomDelay = 0}) {
  const image = flowerImages[flower.type];
  const filter = flowerFilters[flower.color];
  const artwork = {
    rose: {x: -72, y: -69, width: 144, height: 138},
    tulip: {x: -56, y: -81, width: 112, height: 123},
    carnation: {x: -71, y: -70, width: 142, height: 140},
    filler: {x: -51, y: -42, width: 102, height: 84}
  }[flower.type];
  return (
    <g transform={'rotate(' + flower.rotation + ') scale(' + flower.scale + ')'}>
      <g className="bouquet-flower-sway" style={{'--bouquet-bloom-delay': bloomDelay + 'ms'}}>
        <image
          href={image}
          x={artwork.x}
          y={artwork.y}
          width={artwork.width}
          height={artwork.height}
          preserveAspectRatio="xMidYMid meet"
          className="bouquet-flower-image"
          style={{filter}}
          draggable="false"
        />
      </g>
    </g>
  );
}

function BouquetIllustration({arrangement, flowers, selectedId, draggingId, settlingId, svgRef, interactive, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, onFlowerFocus, onFlowerPointerDown, onFlowerClick, onFlowerKeyDown}) {
  return (
    <svg
      ref={svgRef}
      className={'bouquet-svg' + (interactive ? '' : ' bouquet-svg-static')}
      viewBox="110 -42 780 786"
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Buket bunga yang dapat diatur' : undefined}
      aria-hidden={interactive ? undefined : 'true'}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerUp={interactive ? onPointerUp : undefined}
      onPointerCancel={interactive ? onPointerCancel : undefined}
      onLostPointerCapture={interactive ? onLostPointerCapture : undefined}
    >
      {flowers.map((flower, index) => {
        const curve = curveFor(flower, index);
        const leafOne = bezierPoint(curve, 0.68);
        return (
          <g key={'stem-' + flower.id} className="bouquet-stem" aria-hidden="true">
            <StemArtwork curve={curve} flower={flower} index={index} />
            <Leaf x={leafOne.x} y={leafOne.y} mirrored={flower.x > 500} />
          </g>
        );
      })}
      <BouquetWrapper wrapper={arrangement.wrapper} ribbon={arrangement.ribbon} />
      {flowers.map((flower, index) => {
        const colors = petalColors[flower.color];
        const isSelected = flower.id === selectedId;
        const isDragging = flower.id === draggingId;
        const isSettling = flower.id === settlingId;
        return (
          <g
            key={flower.id}
            className={'bouquet-flower-object ' + (isSelected ? 'is-selected ' : '') + (isDragging ? 'is-dragging ' : '') + (isSettling ? 'is-settling' : '')}
            transform={'translate(' + flower.x + ' ' + flower.y + ')'}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? flowerTypes[flower.type] + ', ' + colors.label + '. Gunakan panah untuk memindahkan, R untuk memutar.' : undefined}
            aria-pressed={interactive ? isSelected : undefined}
            tabIndex={interactive ? 0 : undefined}
            onFocus={interactive ? () => onFlowerFocus(flower.id) : undefined}
            onPointerDown={interactive ? (event) => onFlowerPointerDown(event, flower) : undefined}
            onClick={interactive ? () => onFlowerClick(flower.id) : undefined}
            onKeyDown={interactive ? (event) => onFlowerKeyDown(event, flower) : undefined}
          >
            <circle className="bouquet-selection-ring" r="57" />
            <FlowerArtwork flower={flower} bloomDelay={index * 86} />
            <circle className="bouquet-flower-hit-area" r="55" />
            <title>{flowerTypes[flower.type]} · {colors.label}</title>
          </g>
        );
      })}
    </svg>
  );
}

function BouquetWrapper({wrapper, ribbon}) {
  return (
    <>
      <image
        href={wrapperImages[wrapper.style]}
        x="246"
        y="312"
        width="508"
        height="354"
        preserveAspectRatio="none"
        className="bouquet-paper"
        style={{filter: wrapperFilters[wrapper.color] + ' drop-shadow(0 10px 8px rgba(99, 66, 67, .12))'}}
        aria-hidden="true"
        draggable="false"
      />
      {ribbon.visible && (
        <image
          href={ribbonImages[ribbon.style]}
          x="370"
          y={ribbon.style === 'slim' ? 548 : 534}
          width="260"
          height="182"
          preserveAspectRatio="none"
          className={'bouquet-ribbon ribbon-' + ribbon.style}
          style={{filter: ribbonFilters[ribbon.color] + ' drop-shadow(0 3px 4px rgba(110, 51, 69, .22))'}}
          aria-hidden="true"
          draggable="false"
        />
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
  const [celebrating, setCelebrating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [settlingId, setSettlingId] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [panel, setPanel] = useState('flowers');
  const [paletteStep, setPaletteStep] = useState(0);
  const {saving, savePostcard} = useBouquetPostcard();
  const arrangementRef = useRef(arrangement);
  const historyRef = useRef({past: [], future: []});
  const dragRef = useRef(null);
  const svgRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const finishButtonRef = useRef(null);
  const revealLetterRef = useRef(null);
  const hasEnteredCelebration = useRef(false);
  const importInputRef = useRef(null);
  const editingMessageRef = useRef(false);
  const settleTimerRef = useRef(null);
  const currentFlower = arrangement.flowers.find((flower) => flower.id === selectedId) || null;
  const orderedFlowers = arrangement.flowers.slice().sort((a, b) => a.zIndex - b.zIndex);
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  useEffect(() => {
    if (celebrating) {
      hasEnteredCelebration.current = true;
      revealLetterRef.current?.focus();
    } else if (hasEnteredCelebration.current) {
      finishButtonRef.current?.focus();
    }
  }, [celebrating]);

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
      const focusable = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled):not([hidden]), input:not([type="hidden"]):not([hidden]), textarea, [tabindex="0"]:not([hidden])'));
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
    setSettlingId(flower.id);
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => setSettlingId(null), 720);
    setImportMessage(flowerTypes[type] + ' ditambahkan.');
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
    if (dragRef.current || event.button !== 0) return;
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

  const surprise = () => {
    const current = arrangementRef.current;
    const palette = palettes[paletteStep % palettes.length];
    publishChange({
      ...current,
      flowers: current.flowers.map((flower, i) => ({...flower, color: palette.petals[i % palette.petals.length]})),
      wrapper: {color: palette.paper, style: palette.fold},
      ribbon: {...current.ribbon, color: palette.ribbon, style: palette.bow}
    });
    setPaletteStep(step => step + 1);
    setImportMessage('Palet ' + palette.name.toLowerCase() + ' diterapkan.');
  };

  const downloadCard = async () => {
    try {
      await savePostcard(svgRef.current, recipient, arrangementRef.current.message);
      setImportMessage('Kartu buket siap diunduh.');
    } catch {
      setImportMessage('Gambar belum dapat disimpan. Coba unduh lagi setelah buket tampil.');
    }
  };

  const finishArrangement = () => setCelebrating(true);

  return (
    <div className={'bouquet-builder' + (celebrating ? ' is-celebrating' : '')} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={celebrating ? 'bouquet-reveal-title' : 'bouquet-title'}>
      {celebrating ? (
        <section className="bouquet-reveal" aria-label={'Kejutan buket untuk ' + recipient}>
          <button ref={closeButtonRef} type="button" className="bouquet-close-button bouquet-reveal-close" aria-label="Tutup kejutan buket" onClick={onClose}><X size={19} /></button>
          <div className="bouquet-gift-petals" aria-hidden="true">
            {Array.from({length: 18}, (_, index) => <img key={index} src={revealFlowerArt[index % revealFlowerArt.length]} alt="" style={{'--petal-index': index, '--petal-left': (index * 37 % 100) + '%', '--petal-delay': (index % 8 * 145) + 'ms', '--petal-drift': (index % 2 ? 46 : -46) + 'px'}} />)}
          </div>
          <div className="bouquet-gift-stage">
            <div className="bouquet-gift-backdrop" aria-hidden="true"><i /><i /><i /></div>
            <div className="bouquet-gift-card">
              <BouquetIllustration
                arrangement={arrangement}
                flowers={orderedFlowers}
                interactive={false}
              />
              <div className="bouquet-gift-dedication">
                <span>Untuk {recipient}</span>
              </div>
            </div>
          </div>
          <div className="bouquet-gift-note">
            <p className="bouquet-gift-kicker"><i /> Satu kejutan kecil untuk {recipient}</p>
            <h2 id="bouquet-reveal-title">Kelopaknya kamu pilih.<br /><em>Buketnya untukmu.</em></h2>
            <p className="bouquet-gift-copy">Setiap bunga kamu rangkai sendiri. Sekarang biarkan buket ini menyampaikan yang ingin kuucapkan.</p>
            <p className="bouquet-gift-message">{arrangement.message.trim() || 'Semoga tahun barumu penuh hal-hal indah, tawa yang lama, dan kasih sayang sebanyak bunga di buket ini.'}</p>
            <p className="bouquet-gift-signature">Dengan seluruh sayangku <Heart size={15} fill="currentColor" /></p>
            <div className="bouquet-gift-actions">
              <button ref={revealLetterRef} type="button" className="bouquet-finish-button bouquet-letter-button" onClick={onComplete}>Baca surat ulang tahunmu <Mail size={17} /></button>
              <button type="button" className="bouquet-return-button" onClick={() => setCelebrating(false)}><RotateCcw size={15} /> Mau merapikan lagi</button>
            </div>
          </div>
          <span className="bouquet-reveal-status" role="status" aria-live="polite">Buket untuk {recipient} selesai dirangkai. Kejutan kecil sudah menunggu.</span>
        </section>
      ) : (
        <>
      <header className="bouquet-builder-header">
        <div className="bouquet-builder-heading">
          <button ref={closeButtonRef} type="button" className="bouquet-close-button" aria-label="Tutup perangkai buket" onClick={onClose}><X size={19} /></button>
          <div>
            <h2 id="bouquet-title">Studio bunga</h2>
          </div>
        </div>
        <div className="bouquet-header-actions" aria-label="Aksi susunan">
          <button type="button" className="bouquet-icon-button" aria-label="Urungkan" title="Urungkan" disabled={!canUndo} onClick={undo}><Undo2 size={18} /></button>
          <button type="button" className="bouquet-icon-button" aria-label="Ulangi" title="Ulangi" disabled={!canRedo} onClick={redo}><Redo2 size={18} /></button>
          <button ref={finishButtonRef} type="button" className="bouquet-finish-button" onClick={finishArrangement}><Check size={17} /><span>Selesai</span></button>
        </div>
      </header>

      <div className="bouquet-workspace">
        <main className="bouquet-stage-area" aria-label="Area merangkai bunga">
          <div className="bouquet-stage-caption">
            <span className="bouquet-stage-count">{arrangement.flowers.length} tangkai</span>
            <button type="button" className="bouquet-surprise" onClick={surprise}><Shuffle size={15} /> Kejutkan aku</button>
          </div>
          <div className="bouquet-canvas">
            <div className="bouquet-presentation">
            {paletteStep > 0 && <div key={paletteStep} className="bouquet-flourish" aria-hidden="true">{Array.from({length: 8}, (_, i) => <img key={i} src={i % 2 ? fillerImage : leafPairImage} alt="" style={{'--i': i, '--angle': (i * 45) + 'deg'}} />)}</div>}
            <BouquetIllustration
              arrangement={arrangement}
              flowers={orderedFlowers}
              selectedId={selectedId}
              draggingId={draggingId}
              settlingId={settlingId}
              svgRef={svgRef}
              interactive
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onLostPointerCapture={finishDrag}
              onFlowerFocus={setSelectedId}
              onFlowerPointerDown={beginDrag}
              onFlowerClick={setSelectedId}
              onFlowerKeyDown={handleFlowerKey}
            />
            <div className="bouquet-dedication">
              <span>Untuk {recipient}</span>
              {panel === 'card' && arrangement.message && <p>{arrangement.message}</p>}
            </div>
            </div>
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
              <span>Ketuk atau seret bunga untuk mengaturnya.</span>
            )}
          </div>
        </main>

        <aside className="bouquet-tools" aria-label="Pengaturan buket">
          <div className="bouquet-panel-switch" role="group" aria-label="Pilih alat">
            {toolPanels.map(({id, label, Icon}) => (
              <button key={id} type="button" aria-pressed={panel === id} onClick={() => setPanel(id)}>
                <Icon size={17} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          <div key={panel} className="bouquet-tool-page">
            {panel === 'flowers' && (
              <>
                <section className="bouquet-tool-group">
                  <h3>Petik bungamu</h3>
                  <p className="bouquet-help">Ketuk bunga untuk menambah satu tangkai.</p>
                  <div className="bouquet-library">
                    {Object.entries(flowerTypes).map(([type, label]) => (
                      <button key={type} type="button" className={'bouquet-library-button library-' + type} aria-label={'Tambah ' + label.toLowerCase()} disabled={arrangement.flowers.length >= MAX_FLOWERS} onClick={() => addFlower(type)}>
                        <img src={flowerImages[type]} alt="" draggable="false" />
                        <span>{label}</span><Plus size={15} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  {arrangement.flowers.length >= MAX_FLOWERS && <p className="bouquet-help">Sudah 16 tangkai. Lepas satu bunga untuk memetik lagi.</p>}
                </section>
                {currentFlower && (
                  <section className="bouquet-tool-group">
                    <h4>Warna {flowerTypes[currentFlower.type].toLowerCase()}</h4>
                    <Swatches items={petalColors} selected={currentFlower.color} label="Warna bunga terpilih" onChange={(color) => changeSelectedFlower((flower) => ({...flower, color}))} />
                  </section>
                )}
              </>
            )}
            {panel === 'wrap' && (
              <>
                <section className="bouquet-tool-group">
                  <h3>Kertas pembungkus</h3>
                  <div className="bouquet-style-options" role="group" aria-label="Gaya lipatan kertas">
                    {wrapperStyles.map(style => <button key={style.id} type="button" aria-pressed={arrangement.wrapper.style === style.id} onClick={() => changeWrapper('wrapper', {style: style.id})}><img src={wrapperImages[style.id]} alt="" />{style.label}</button>)}
                  </div>
                  <Swatches items={wrapperColors} selected={arrangement.wrapper.color} label="Warna kertas pembungkus" onChange={color => changeWrapper('wrapper', {color})} />
                </section>
                <section className="bouquet-tool-group">
                  <div className="bouquet-heading-line"><h3>Pita</h3>
                    <button type="button" className="bouquet-text-action" aria-pressed={arrangement.ribbon.visible} onClick={() => changeWrapper('ribbon', {visible: !arrangement.ribbon.visible})}>
                      {arrangement.ribbon.visible ? 'Lepas pita' : 'Pasang pita'}
                    </button>
                  </div>
                  <div className="bouquet-style-options" role="group" aria-label="Gaya pita">
                    {ribbonStyles.map(style => <button key={style.id} type="button" aria-pressed={arrangement.ribbon.visible && arrangement.ribbon.style === style.id} onClick={() => changeWrapper('ribbon', {style: style.id, visible: true})}><img src={ribbonImages[style.id]} alt="" />{style.label}</button>)}
                  </div>
                  <Swatches items={ribbonColors} selected={arrangement.ribbon.color} label="Warna pita" onChange={color => changeWrapper('ribbon', {color, visible: true})} />
                </section>
              </>
            )}
            {panel === 'card' && (
              <>
                <section className="bouquet-tool-group">
                  <h3>Kartu untuk {recipient}</h3>
                  <label className="bouquet-help" htmlFor="bouquet-message">Pesan di bawah buket</label>
                  <textarea id="bouquet-message" value={arrangement.message} maxLength={100} rows={3} placeholder={'Selamat ulang tahun, ' + recipient + '.'}
                    onFocus={() => { editingMessageRef.current = false; }}
                    onChange={event => {
                      const next = {...arrangementRef.current, message: event.target.value};
                      if (!editingMessageRef.current) {
                        publishChange(next);
                        editingMessageRef.current = true;
                      } else {
                        updateLiveArrangement(next);
                        persistArrangement(next);
                      }
                    }} />
                  <button className="bouquet-save-card" type="button" disabled={saving} onClick={downloadCard}><Download size={17} />{saving ? 'Menyiapkan gambar…' : 'Unduh kartu PNG'}</button>
                </section>
                <section className="bouquet-tool-group">
                  <h4>Simpan susunan</h4>
                  <p className="bouquet-help">Buket tersimpan di perangkat ini. Bawa file JSON untuk merangkainya lagi di perangkat lain.</p>
                  <div className="bouquet-file-buttons">
                    <button type="button" onClick={exportArrangement}><Download size={15} /> Unduh JSON</button>
                    <button type="button" onClick={() => importInputRef.current?.click()}><Upload size={15} /> Muat JSON</button>
                    <input ref={importInputRef} type="file" accept="application/json,.json" onChange={importArrangement} hidden />
                  </div>
                  <button type="button" className="bouquet-text-action bouquet-reset" onClick={resetArrangement}><RotateCcw size={14} /> Kembali ke buket awal</button>
                </section>
              </>
            )}
          </div>
          <p role="status" aria-live="polite" className="bouquet-live-message">{importMessage}</p>
        </aside>
      </div>
        </>
      )}
    </div>
  );
}
