import {useState} from 'react';

function readAsDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function bouquetSnapshot(svg) {
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', '760');
  clone.setAttribute('height', '690');
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.querySelectorAll('circle, title').forEach(node => node.remove());
  const images = Array.from(clone.querySelectorAll('image'));
  const sources = [...new Set(images.map(node => node.getAttribute('href')))];
  const embedded = new Map(await Promise.all(sources.map(async src => {
    if (src.startsWith('data:')) return [src, src];
    const response = await fetch(src);
    if (!response.ok) throw new Error('Gambar belum selesai dimuat.');
    return [src, await readAsDataURL(await response.blob())];
  })));
  images.forEach(node => node.setAttribute('href', embedded.get(node.getAttribute('href'))));
  const artwork = new Image();
  artwork.src = await readAsDataURL(new Blob([new XMLSerializer().serializeToString(clone)], {type:'image/svg+xml;charset=utf-8'}));
  await artwork.decode();
  return artwork;
}

function drawMessage(context, message) {
  context.font = '32px Georgia, serif';
  // Wrap even an unbroken word, so a long dedication fits the postcard.
  const lines = [];
  let line = '';
  for (const word of message.trim().split(/\s+/u)) {
    if (line && context.measureText(line + ' ' + word).width > 740) {
      lines.push(line);
      line = '';
    }
    if (line) line += ' ';
    for (const character of word) {
      if (line && context.measureText(line + character).width > 740) {
        lines.push(line);
        line = '';
      }
      line += character;
    }
  }
  lines.push(line);
  lines.forEach((text, index) => context.fillText(text, 450, 975 + index * 45));
}

export function useBouquetPostcard() {
  const [saving, setSaving] = useState(false);
  async function savePostcard(svg, recipient, message) {
    if (!svg || saving) return;
    setSaving(true);
    try {
      const artwork = await bouquetSnapshot(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1250;
      const context = canvas.getContext('2d');
      context.fillStyle = '#faf3e6';
      context.fillRect(0, 0, 900, 1250);
      context.strokeStyle = '#9e525b';
      context.lineWidth = 2;
      context.strokeRect(25, 25, 850, 1200);
      context.lineWidth = 1;
      context.strokeRect(34, 34, 832, 1182);
      context.fillStyle = '#703245';
      context.textAlign = 'center';
      context.font = 'italic 62px Georgia, serif';
      context.fillText('Untuk ' + recipient, 450, 145, 755);
      context.drawImage(artwork, 45, 170, 810, 735);
      context.fillStyle = '#583b40';
      drawMessage(context, message || 'Selamat ulang tahun, ' + recipient + '.');
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Kartu belum bisa diunduh.');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kartu-buket-' + recipient.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } finally {
      setSaving(false);
    }
  }
  return {saving, savePostcard};
}
