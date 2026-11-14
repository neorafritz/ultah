export const personalization = {
  recipient: '[Nama Pacarmu]',
  sender: '[Namamu]',
  age: '[Usia]'
};

export const chapters = [
  {
    kicker: 'A LITTLE STORY ACROSS THE DISTANCE',
    title: ['Happy birthday,', '[Nama Pacarmu]!'],
    message: 'Meski kita berada di kota yang berbeda, malam ini semua doaku tertuju padamu.'
  },
  {
    kicker: 'THE DATE WE KEEP IMAGINING',
    title: ['Suatu hari nanti,', 'kita jalan bersama.'],
    message: 'Sampai hari itu datang, aku suka membayangkan kita berjalan santai di taman kota.'
  },
  {
    kicker: 'UNTIL THE NEXT HELLO',
    title: ['Semua jarak', 'pasti punya ujung.'],
    message: 'Aku menantikan hari sederhana ketika akhirnya kita bisa bertemu dan bergandengan tangan lagi.'
  },
  {
    kicker: 'A SMALL SURPRISE FOR YOU',
    title: ['Ada bunga, kue,', 'dan banyak sayang.'],
    message: 'Andai hari ini kita duduk di meja yang sama, aku ingin jadi orang pertama yang merayakanmu.'
  },
  {
    kicker: 'MAKE A LITTLE WISH',
    title: ['Buat satu harapan,', 'khusus untukmu.'],
    message: 'Semoga semua hal baik yang kamu harapkan perlahan menemukan jalannya.'
  },
  {
    kicker: 'THE DREAM CAN WAIT',
    title: ['Mimpi boleh usai,', 'sayangku tetap ada.'],
    message: 'Kita terbangun di kamar masing-masing, dengan rambut berantakan dan senyum malu-malu. Doaku tetap sama: semoga kamu selalu bahagia.'
  }
];

export function personalize(text) {
  return text
    .replaceAll('[Nama Pacarmu]', personalization.recipient)
    .replaceAll('[Namamu]', personalization.sender)
    .replaceAll('[Usia]', personalization.age);
}
