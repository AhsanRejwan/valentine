import { MAIN_WORD } from './wordcloudWords'

export type WordVariant = 'main' | 'cocoa' | 'rose' | 'peach'

export interface WordLayoutEntry {
  text: string
  x: number
  y: number
  scale: number
  rotate: number
  variant: WordVariant
}

export const WORD_LAYOUT: WordLayoutEntry[] = [
  { text: MAIN_WORD, x: 50, y: 52, scale: 1.74, rotate: -1, variant: 'main' },
  { text: 'Loitta maas', x: 32, y: 14, scale: 1.06, rotate: -4, variant: 'cocoa' },
  { text: 'Maria B', x: 45, y: 16, scale: 1.02, rotate: -5, variant: 'cocoa' },
  { text: 'AirBnb \u{1F609}', x: 62, y: 15, scale: 1.04, rotate: 5, variant: 'rose' },
  { text: 'Buira', x: 23, y: 18, scale: 1.02, rotate: -8, variant: 'cocoa' },
  { text: 'gadhu', x: 18, y: 24, scale: 0.98, rotate: -7, variant: 'cocoa' },
  { text: 'goltush', x: 57, y: 23, scale: 1.02, rotate: 4, variant: 'cocoa' },
  { text: 'cutush', x: 76, y: 23, scale: 1.04, rotate: 6, variant: 'cocoa' },
  { text: 'appa dao', x: 13, y: 29, scale: 1, rotate: -9, variant: 'cocoa' },
  { text: 'chagol', x: 86, y: 30, scale: 1.04, rotate: 9, variant: 'peach' },
  { text: 'Janoo ki hoise', x: 45, y: 29, scale: 0.88, rotate: -2, variant: 'cocoa' },
  { text: 'vroom vroom', x: 66, y: 29, scale: 0.9, rotate: 3, variant: 'peach' },
  { text: 'Potlaa', x: 28, y: 33, scale: 1.08, rotate: -6, variant: 'cocoa' },
  { text: 'Not insinuating..', x: 42, y: 34, scale: 0.86, rotate: -3, variant: 'cocoa' },
  { text: 'Protocol', x: 82, y: 34, scale: 1, rotate: 7, variant: 'cocoa' },
  { text: 'motu', x: 15, y: 38, scale: 1.02, rotate: -7, variant: 'cocoa' },
  { text: 'ki diba', x: 72, y: 38, scale: 1.08, rotate: 4, variant: 'cocoa' },
  { text: 'hypothetically...', x: 55, y: 39, scale: 0.84, rotate: 1, variant: 'cocoa' },
  { text: 'bashay jabo', x: 24, y: 44, scale: 1.04, rotate: -4, variant: 'cocoa' },
  { text: 'etta gaan shunao', x: 66, y: 44, scale: 0.88, rotate: 2, variant: 'cocoa' },
  { text: 'matha tipe dao', x: 34, y: 45, scale: 0.9, rotate: -3, variant: 'cocoa' },
  { text: 'Beyadop', x: 81, y: 44, scale: 1.16, rotate: 3, variant: 'cocoa' },
  { text: 'Chanachur', x: 19, y: 56, scale: 0.96, rotate: -6, variant: 'cocoa' },
  { text: 'Futfuti', x: 43, y: 57, scale: 1.18, rotate: -1, variant: 'cocoa' },
  { text: 'Busabaa', x: 69, y: 57, scale: 1.08, rotate: 2, variant: 'cocoa' },
  { text: 'accha dhoro', x: 83, y: 57, scale: 0.94, rotate: 6, variant: 'cocoa' },
  { text: 'tolomaaa', x: 31, y: 62, scale: 1.08, rotate: -3, variant: 'cocoa' },
  { text: 'thame thame', x: 49, y: 62, scale: 0.9, rotate: -2, variant: 'peach' },
  { text: 'sowwie', x: 61, y: 62, scale: 0.98, rotate: 2, variant: 'rose' },
  { text: 'Fuchka', x: 74, y: 62, scale: 1.02, rotate: 3, variant: 'cocoa' },
  { text: 'Kutkut', x: 27, y: 68, scale: 1.1, rotate: -5, variant: 'cocoa' },
  { text: 'KitKat', x: 39, y: 68, scale: 1.08, rotate: -2, variant: 'cocoa' },
  { text: 'the things i do for you', x: 56, y: 68, scale: 0.9, rotate: 0, variant: 'cocoa' },
  { text: 'Na ekhoniii', x: 75, y: 68, scale: 1, rotate: 4, variant: 'cocoa' },
  { text: 'free tissues', x: 38, y: 74, scale: 1.02, rotate: -3, variant: 'cocoa' },
  { text: 'Bridge', x: 55, y: 74, scale: 1.1, rotate: 0, variant: 'cocoa' },
  { text: 'Dhaap', x: 72, y: 74, scale: 1.04, rotate: 4, variant: 'cocoa' },
  { text: 'How would I know..', x: 23, y: 74, scale: 0.8, rotate: -5, variant: 'cocoa' },
  { text: 'Lalla la la la', x: 35, y: 81, scale: 0.98, rotate: -3, variant: 'cocoa' },
  { text: 'Dark', x: 47, y: 81, scale: 1.1, rotate: -1, variant: 'cocoa' },
  { text: 'Phuush', x: 60, y: 81, scale: 1.1, rotate: 2, variant: 'cocoa' },
  { text: 'Ajke Oneek Khabo', x: 50, y: 88, scale: 1.02, rotate: 0, variant: 'cocoa' },
]
