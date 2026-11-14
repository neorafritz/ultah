export const personalization = {
  recipient: '[Nama Pacarmu]',
  sender: '[Namamu]',
  age: '[Usia]'
};

export const chapters = [
  {
    kicker: 'A BLUE LITTLE CELEBRATION',
    title: ['Happy birthday,', '[Nama Pacarmu]!'],
    message: 'Hari ini, dunia terasa lebih cerah karena seseorang seistimewa kamu lahir ke dunia.'
  },
  {
    kicker: 'A NEW YEAR OF YOU',
    title: ['Untuk semua mimpi', 'yang menunggumu.'],
    message: 'Semoga babak baru ini membawa lebih banyak tawa, keberanian, dan warna di setiap langkahmu.'
  },
  {
    kicker: 'FOLLOW THE LIGHT',
    title: ['Ke mana pun kamu', 'ingin melangkah.'],
    message: 'Apa pun langit di depanmu, semoga selalu ada harapan yang menerangi perjalanan.'
  },
  {
    kicker: 'A LITTLE SOMETHING FOR YOU',
    title: ['Satu kejutan kecil', 'dari aku untukmu.'],
    message: 'Terima kasih sudah menjadi bagian paling indah dari ceritaku. Hari ini, biar aku yang merayakanmu.'
  },
  {
    kicker: 'MADE ESPECIALLY FOR YOU',
    title: ['Satu pesan kecil,', 'khusus untukmu.'],
    message: 'Ada ucapan penuh sayang yang menunggumu di dalam hadiah itu.'
  },
  {
    kicker: 'YOUR NEXT CHAPTER',
    title: ['Semoga tahun ini', 'penuh cahaya.'],
    message: 'Selamat ulang tahun ke-[Usia], [Nama Pacarmu]. Dengan cinta, [Namamu].'
  }
];

export function personalize(text) {
  return text
    .replaceAll('[Nama Pacarmu]', personalization.recipient)
    .replaceAll('[Namamu]', personalization.sender)
    .replaceAll('[Usia]', personalization.age);
}
