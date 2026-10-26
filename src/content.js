export const CHAPTERS = [
  {
    id: 'hero',
    title: ['Jedan dodir.', 'Pet zvjezdica.'],
    lead: 'Stalak za Google recenzije s vašim logom, QR kodom i NFC čipom. Gost prisloni telefon i forma za recenziju je već otvorena.',
    hero: true,
  },
  {
    id: 'logo',
    eyebrow: 'Vaš logo',
    title: ['Vaš brend, izdignut iz ploče.'],
    body: 'Logo i naziv lokala printamo direktno u ploču, 0,8 mm iznad površine i u boji koju izaberete. Nema naljepnica koje se ljušte ni folije koja izblijedi.',
    chips: [['Ploča', '90 × 165 mm'], ['Reljef', '0,8 mm']],
  },
  {
    id: 'qr',
    eyebrow: 'QR skener',
    title: ['Kamera ga uhvati iz prve.'],
    body: 'QR kod vodi pravo na formu za recenziju vašeg lokala na Googleu. Reljef je uvijek u kontrastnoj boji, tamno na svijetlom ili svijetlo na tamnom, pa ga telefon čita i na šanku pod prigušenim svjetlom.',
    chips: [['QR', '44 × 44 mm'], ['Korekcija greške', 'M']],
  },
  {
    id: 'nfc',
    eyebrow: 'NFC tehnologija',
    title: ['Prisloni telefon. Gotovo.'],
    body: 'Unutar ploče je zapečaćen NFC čip. Gost samo prinese telefon i recenzija se otvori, bez aplikacije i bez skeniranja. Radi na iPhoneu XS i novijim i na Android telefonima s uključenim NFC-om.',
    chips: [['Čip', 'NTAG215 · Ø 25 mm'], ['Spolja', 'nevidljiv']],
  },
  {
    id: 'base',
    eyebrow: 'Postolje',
    title: ['Pod 15°, tačno u liniji pogleda.'],
    body: 'Ploča ulazi u utor postolja bez ljepila i alata. Kad promijenite dizajn ili akciju, mijenjate samo ploču. Postolje ostaje na stolu.',
    chips: [['Postolje', '110 × 70 × 16 mm'], ['Nagib', '15°']],
  },
  {
    id: 'final',
    eyebrow: 'Spreman za vaš sto',
    title: ['Za stolove, šank i recepciju.'],
    body: 'Oblik ploče, boje i postolje biramo zajedno: klasik, luk, kosi uglovi ili mekani rubovi, u bojama vašeg lokala. Pošaljite nam logo i link do Google profila, a mi vratimo dizajn na odobrenje.',
    cta: true,
  },
]

export const VENUES = [
  { icon: 'cup', title: 'Kafići i restorani', text: 'Na svakom stolu, pored računa ili na šanku. Gost ostavi recenziju dok čeka kusur.', where: 'sto · šank · kasa' },
  { icon: 'hotel', title: 'Hoteli i apartmani', text: 'Na recepciji pri odjavi i u sobi pored kartice za Wi-Fi. Isti stalak može voditi i na Booking ili TripAdvisor.', where: 'recepcija · soba · lobby' },
  { icon: 'scissors', title: 'Saloni i barberi', text: 'Na pultu dok klijent plaća. Zadovoljan klijent u stolici je najbolja recenzija koju možete dobiti.', where: 'pult · ogledalo' },
  { icon: 'clinic', title: 'Klinike i servisi', text: 'Ordinacije, autoservisi, teretane. Svako mjesto gdje se gost vraća i gdje ga recenzije dovode.', where: 'čekaonica · prijem' },
]

export const STEPS = [
  { title: 'Pošaljete logo i link', text: 'Logo u bilo kojem formatu i link do vašeg Google profila. Ako ne znate gdje je link, pronađemo ga za vas.' },
  { title: 'Odobrite dizajn', text: 'Pošaljemo vam 3D pregled stalka s vašim logom i bojama. Ništa ne ide u izradu dok ne kažete da je dobro.' },
  { title: 'Izrada i isporuka', text: 'Printamo ploče i postolja, programiramo i testiramo svaki NFC čip, pa stalke dostavimo spremne za stol.' },
]
