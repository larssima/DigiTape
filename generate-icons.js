import sharp from 'sharp'
import { mkdirSync } from 'fs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" rx="90" fill="#0f0f13"/>

  <!-- Cassette body -->
  <rect x="60" y="158" width="392" height="196" rx="22" fill="#1a1a24"/>
  <rect x="60" y="158" width="392" height="196" rx="22" fill="none" stroke="#2e2e3e" stroke-width="6"/>

  <!-- Tape window -->
  <rect x="108" y="190" width="296" height="118" rx="10" fill="#0f0f13"/>

  <!-- Left reel -->
  <circle cx="194" cy="249" r="48" fill="#22222e"/>
  <circle cx="194" cy="249" r="48" fill="none" stroke="#383848" stroke-width="4"/>
  <circle cx="194" cy="249" r="23" fill="#0f0f13"/>
  <line x1="194" y1="226" x2="194" y2="201" stroke="#383848" stroke-width="4" stroke-linecap="round"/>
  <line x1="215" y1="236" x2="236" y2="222" stroke="#383848" stroke-width="4" stroke-linecap="round"/>
  <line x1="215" y1="262" x2="236" y2="276" stroke="#383848" stroke-width="4" stroke-linecap="round"/>
  <circle cx="194" cy="249" r="8" fill="#1db954"/>

  <!-- Right reel -->
  <circle cx="318" cy="249" r="48" fill="#22222e"/>
  <circle cx="318" cy="249" r="48" fill="none" stroke="#383848" stroke-width="4"/>
  <circle cx="318" cy="249" r="23" fill="#0f0f13"/>
  <line x1="318" y1="226" x2="318" y2="201" stroke="#383848" stroke-width="4" stroke-linecap="round"/>
  <line x1="339" y1="236" x2="360" y2="222" stroke="#383848" stroke-width="4" stroke-linecap="round"/>
  <line x1="339" y1="262" x2="360" y2="276" stroke="#383848" stroke-width="4" stroke-linecap="round"/>
  <circle cx="318" cy="249" r="8" fill="#1db954"/>

  <!-- Tape guide pegs -->
  <circle cx="164" cy="308" r="9" fill="#1db954"/>
  <circle cx="348" cy="308" r="9" fill="#1db954"/>

  <!-- Tape sag -->
  <path d="M173 308 Q256 345 339 308" fill="none" stroke="#1db954" stroke-width="5" stroke-linecap="round"/>

  <!-- Corner screw holes -->
  <circle cx="92" cy="182" r="11" fill="#0f0f13"/>
  <circle cx="420" cy="182" r="11" fill="#0f0f13"/>
  <circle cx="92" cy="330" r="11" fill="#0f0f13"/>
  <circle cx="420" cy="330" r="11" fill="#0f0f13"/>
</svg>`

mkdirSync('public/icons', { recursive: true })

await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icons/icon-192.png')
console.log('✓ icon-192.png')

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icons/icon-512.png')
console.log('✓ icon-512.png')

console.log('Icons generated in public/icons/')
