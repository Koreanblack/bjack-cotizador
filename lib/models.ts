export interface Color {
  name: string;
  hex: string;
  imgKey: string | null;
}

export interface Model {
  id: string;
  nombre: string;
  tipo: string;
  precio_usd: number;
  patentamiento_usd: number;
  motor: string;
  autonomia: string;
  bateria: string;
  aceleracion: string;
  asientos: string;
  medidas: string;
  neumaticos: string;
  colores: Color[];
  defaultImg: string;
}

export const MODELOS: Model[] = [
  {
    id: 'dolphin_gl',
    nombre: 'BYD Dolphin Mini GL',
    tipo: '100% Eléctrico',
    precio_usd: 23990,
    patentamiento_usd: 1000,
    motor: 'Motor eléctrico 65 kW / 175 N·m',
    autonomia: '380 km (NEDC)',
    aceleracion: '0-100 km/h en 10,9 s',
    bateria: 'Batería Blade 43,2 kWh',
    asientos: '4 asientos',
    medidas: '3.990 × 1.720 × 1.590 mm',
    neumaticos: '185/55 R16',
    colores: [
      { name: 'Apricity White', hex: '#f5f0e8', imgKey: 'dolphin_white' },
      { name: 'Glacier Blue', hex: '#d0dde6', imgKey: 'dolphin_gray' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'dolphin_black' },
      { name: 'Sprout Green', hex: '#7ab648', imgKey: null },
    ],
    defaultImg: 'dolphin_white',
  },
  {
    id: 'dolphin',
    nombre: 'BYD Dolphin Mini GS',
    tipo: '100% Eléctrico',
    precio_usd: 24990,
    patentamiento_usd: 1200,
    motor: 'Motor eléctrico 65 kW / 175 N·m',
    autonomia: '380 km (NEDC)',
    aceleracion: '0-100 km/h en 10,9 s',
    bateria: 'Batería Blade 43,2 kWh',
    asientos: '4 asientos',
    medidas: '3.990 × 1.720 × 1.590 mm',
    neumaticos: '185/55 R16',
    colores: [
      { name: 'Apricity White', hex: '#f5f0e8', imgKey: 'dolphin_white' },
      { name: 'Glacier Blue', hex: '#d0dde6', imgKey: 'dolphin_gray' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'dolphin_black' },
      { name: 'Sprout Green', hex: '#7ab648', imgKey: null },
    ],
    defaultImg: 'dolphin_white',
  },
  {
    id: 'yuan_gl',
    nombre: 'BYD Yuan Pro GL',
    tipo: '100% Eléctrico',
    precio_usd: 30990,
    patentamiento_usd: 1200,
    motor: 'Motor eléctrico 130 kW / 290 N·m',
    autonomia: '380 km EV (NEDC)',
    aceleracion: '0-100 km/h en 7,9 s',
    bateria: 'Batería Blade BYD 45,12 kWh',
    asientos: '5 asientos',
    medidas: '4.310 × 1.830 × 1.675 mm',
    neumaticos: '215/55 R17',
    colores: [
      { name: 'Skiing White', hex: '#f5f5f0', imgKey: 'yuan_white' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'yuan_black' },
      { name: 'Time Gray', hex: '#7a8a96', imgKey: null },
      { name: 'Malachite Darkcyan', hex: '#1a7a6a', imgKey: null },
    ],
    defaultImg: 'yuan_white',
  },
  {
    id: 'yuan',
    nombre: 'BYD Yuan Pro GS',
    tipo: '100% Eléctrico',
    precio_usd: 31990,
    patentamiento_usd: 1360,
    motor: 'Motor eléctrico 130 kW / 290 N·m',
    autonomia: '380 km EV (NEDC)',
    aceleracion: '0-100 km/h en 7,9 s',
    bateria: 'Batería Blade BYD 45,12 kWh',
    asientos: '5 asientos',
    medidas: '4.310 × 1.830 × 1.675 mm',
    neumaticos: '215/55 R17',
    colores: [
      { name: 'Skiing White', hex: '#f5f5f0', imgKey: 'yuan_white' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'yuan_black' },
      { name: 'Time Gray', hex: '#7a8a96', imgKey: null },
      { name: 'Malachite Darkcyan', hex: '#1a7a6a', imgKey: null },
    ],
    defaultImg: 'yuan_white',
  },
  {
    id: 'atto2',
    nombre: 'BYD Atto 2 DM-i GS',
    tipo: 'Híbrido enchufable PHEV',
    precio_usd: 33990,
    patentamiento_usd: 1500,
    motor: 'Motor combustión 72 kW + Eléctrico 145 kW / 300 N·m',
    autonomia: '110 km EV · 1.100 km combinada (NEDC)',
    aceleracion: '0-100 km/h en 7,5 s',
    bateria: 'Batería Blade 18,03 kWh',
    asientos: '5 asientos',
    medidas: '4.330 × 1.830 × 1.670 mm',
    neumaticos: '215/55 R17',
    colores: [
      { name: 'Malachite Darkcyan', hex: '#1a7a6a', imgKey: 'atto2_malachite' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'atto2_black' },
      { name: 'Skiing White', hex: '#f5f5f0', imgKey: 'atto2_teal' },
      { name: 'Time Gray', hex: '#7a8a96', imgKey: null },
      { name: 'Gravel Beige', hex: '#c8b89a', imgKey: null },
    ],
    defaultImg: 'atto2_malachite',
  },
  {
    id: 'song_gl',
    nombre: 'BYD Song Pro GL',
    tipo: 'Híbrido enchufable PHEV',
    precio_usd: 35490,
    patentamiento_usd: 1300,
    motor: 'Motor combustión 78 kW + Eléctrico 145 kW / 300 N·m',
    autonomia: '100 km EV · 1.030 km combinada (NEDC)',
    aceleracion: '0-100 km/h en 7,9 s',
    bateria: 'Batería Blade BYD 18,3 kWh',
    asientos: '5 asientos',
    medidas: '4.738 × 1.860 × 1.710 mm',
    neumaticos: '225/60 R18',
    colores: [
      { name: 'Snow White', hex: '#f5f5f0', imgKey: 'song_white' },
      { name: 'Atlantis Blue', hex: '#3a7ab8', imgKey: 'song_blue' },
      { name: 'Time Gray', hex: '#7a8a96', imgKey: 'song_gray' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'song_black' },
      { name: 'Cream Brown', hex: '#c8a878', imgKey: null },
    ],
    defaultImg: 'song_white',
  },
  {
    id: 'song',
    nombre: 'BYD Song Pro GS',
    tipo: 'Híbrido enchufable PHEV',
    precio_usd: 37490,
    patentamiento_usd: 1500,
    motor: 'Motor combustión 78 kW + Eléctrico 145 kW / 300 N·m',
    autonomia: '100 km EV · 1.030 km combinada (NEDC)',
    aceleracion: '0-100 km/h en 7,9 s',
    bateria: 'Batería Blade BYD 18,3 kWh',
    asientos: '5 asientos',
    medidas: '4.738 × 1.860 × 1.710 mm',
    neumaticos: '225/60 R18',
    colores: [
      { name: 'Snow White', hex: '#f5f5f0', imgKey: 'song_white' },
      { name: 'Atlantis Blue', hex: '#3a7ab8', imgKey: 'song_blue' },
      { name: 'Time Gray', hex: '#7a8a96', imgKey: 'song_gray' },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: 'song_black' },
      { name: 'Cream Brown', hex: '#c8a878', imgKey: null },
    ],
    defaultImg: 'song_white',
  },
  {
    id: 'seal_u',
    nombre: 'BYD Seal U',
    tipo: 'Híbrido enchufable PHEV',
    precio_usd: 47990,
    patentamiento_usd: 1800,
    motor: 'A confirmar',
    autonomia: 'A confirmar',
    aceleracion: 'A confirmar',
    bateria: 'A confirmar',
    asientos: '5 asientos',
    medidas: 'A confirmar',
    neumaticos: 'A confirmar',
    colores: [
      { name: 'A confirmar', hex: '#9aa0a8', imgKey: null },
    ],
    defaultImg: 'seal_u_white',
  },
  {
    id: 'shark',
    nombre: 'BYD Shark DMO GS',
    tipo: 'Híbrida enchufable 4x4',
    precio_usd: 59990,
    patentamiento_usd: 2100,
    motor: '321 kW / 650 N·m combinado · 4WD inteligente',
    autonomia: '100 km EV · 800 km combinada (NEDC)',
    aceleracion: '0-100 km/h en 5,7 s',
    bateria: 'Batería Blade LFP 29,58 kWh',
    asientos: '5 asientos',
    medidas: '5.457 × 1.971 × 1.925 mm',
    neumaticos: '265/65 R18',
    colores: [
      { name: 'Pallas White', hex: '#f0f0ec', imgKey: 'shark_white' },
      { name: 'Urdu Milky-Gray', hex: '#9aaa8a', imgKey: 'shark_urdu' },
      { name: 'Atlantis Gray', hex: '#6a7a88', imgKey: 'shark_gray' },
      { name: 'Floating Sun Orange', hex: '#e86820', imgKey: null },
      { name: 'Obsidian Black', hex: '#1a1a1a', imgKey: null },
    ],
    defaultImg: 'shark_white',
  },
];
