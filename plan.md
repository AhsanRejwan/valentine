# Final Implementation Plan — Valentine Week Gift Website (React.js SPA, Vite)

This is the single source of truth plan to build the full site **phase-by-phase** with **zero deviation**.  
All assets are local under `public/assets/**` with folders like `assets/ui`, `assets/rose-day`, etc.  
Font is **Fredoka**.

---

## 0) Non-Negotiable Rules (Agent Must Follow)

1. Framework: **React.js SPA** using **Vite**. No Next.js.
2. Routing: **react-router-dom** with one route per page (listed below).
3. Styling: **Tailwind CSS**, with the provided palette mapped to theme tokens.
4. Animations: **Framer Motion** for modals/transitions + CSS keyframes for ambient motion.
5. Assets must be loaded from `public/assets/**` using absolute paths like `/assets/rose-day/rose-red.svg`.
6. No external asset CDNs. No additional icon packs.
7. Must implement:
    - Daily unlock gating (with debug overrides)
    - Home roadmap + countdown
    - Word cloud (heart-shaped) matching the approved mock vibe
    - Each day’s interaction + coupon modal
    - Coupon download to PNG (DOM → image)
    - No persistence of claimed coupons or selections across refresh
    - Reduced motion support

---

## 1) Tech Stack & Libraries (Must Use)

### Core
- `react`, `react-dom`
- `react-router-dom`
- `date-fns` (time calculations + countdown)
- `tailwindcss`
- `framer-motion`

### Coupon Export
- `html-to-image`  
  Use: `toPng(node, { pixelRatio: 2, cacheBust: true })`

### Drag & Drop (Chocolate Day)
- `@dnd-kit/core`

### Utility (recommended)
- `clsx`

---

## 2) Project Structure (Must Match)

### Assets (public)
Place all assets here:
- `public/assets/**`

Expected asset folders:
- `public/assets/ui`
- `public/assets/icons`
- `public/assets/backgrounds`
- `public/assets/home`
- `public/assets/coupons`
- `public/assets/rose-day`
- `public/assets/propose-day`
- `public/assets/chocolate-day`
- `public/assets/teddy-day`
- `public/assets/promise-day`
- `public/assets/hug-day`
- `public/assets/kiss-day`
- `public/assets/valentines-day`

### Source folders (src)
```
src/
  components/
    layout/
      PageLayout.tsx
      Sticker.tsx
      Modal.tsx
      CountdownPill.tsx
      Roadmap.tsx
      LockedView.tsx
    wordcloud/
      WordCloud.tsx
      wordcloudWords.ts
      wordcloudLayout.ts
      wordcloudHearts.ts
      wordcloudStyles.css
    coupon/
      CouponCard.tsx
      useCouponDownload.ts
    effects/
      FloatingHearts.tsx
      SparkleOverlay.tsx
      HeartParticles.tsx
  config/
    days.ts
    theme.ts
  pages/
    Home.tsx
    RoseDay.tsx
    ProposeDay.tsx
    ChocolateDay.tsx
    TeddyDay.tsx
    PromiseDay.tsx
    HugDay.tsx
    KissDay.tsx
    ValentinesDay.tsx
  utils/
    debug.ts
    unlock.ts
    time.ts
  App.tsx
  main.tsx
```


---

## 3) Theme & Style Guide (Must Implement)

### Font
- Use **Fredoka** globally (Google Fonts in `index.html`)
- Apply to body: `font-family: "Fredoka", sans-serif;`

### Palette Tokens
Main:
- Baby Pink: `#FFD4E5`
- Soft Orange/Peach: `#FFDAB9`
- Cream/Beige: `#F5E6D3`
- Cocoa Brown: `#8B6F47`
- Soft Pastel Blue: `#D4E5FF`
- White: `#FFFFFF`

Accents:
- Light Pink/Rose: `#FFB6C1`
- Rich Brown: `#6B4423`
- Soft Brown: `#D4A574`
- Soft Green: `#D4E5D3`
- Soft Gold/Peach: `#FFD4A3`
- Sparkle: `#FFF4D4`

### Global UI Style
- Soft dreamy backgrounds
- Rounded corners: `rounded-2xl` / `rounded-3xl`
- Frosted modals (blur + translucent cream/pink)
- Gentle shadows only
- No harsh contrasts

### Reduced Motion
Respect `prefers-reduced-motion`:
- Disable float/sway loops
- Keep transitions minimal

---

## 4) Routing (Must Match)

Routes:
- `/` (Home)
- `/rose-day`
- `/propose-day`
- `/chocolate-day`
- `/teddy-day`
- `/promise-day`
- `/hug-day`
- `/kiss-day`
- `/valentines-day`

---

## 5) Core Config & Time Gating

### 5.1 Days Config (`src/config/days.ts`)
Create an ordered `DAYS` array. Each day entry must include:
- `id` (e.g., `"rose-day"`)
- `title` (e.g., `"Rose Day"`)
- `route` (e.g., `"/rose-day"`)
- `icon` (e.g., `"/assets/icons/rose.svg"`)
- `background` (page background path)
- `unlockOffsetDays` (0..7 relative to start date)
- `coupon` metadata (title, default reward text builder, etc.)

### 5.2 Unlock Engine (`src/utils/unlock.ts`)
Functions required:
- `getStartDate(): Date`
- `getNow(debug): Date`
- `isUnlocked(dayId, now, debug): boolean`
- `getDayStatus(dayId, now, debug): "locked" | "today" | "unlocked"`
- `getNextUnlock(now, debug): { dayId, unlockAt, msRemaining } | null`

### 5.3 Debug Overrides (`src/utils/debug.ts`)
Parse query params:
- `debugAll=1` → all unlocked
- `debugDay=<dayId>` → unlock that day + earlier days
- `debugDate=YYYY-MM-DD` → override current date

These must be honored on:
- Home (roadmap state + countdown)
- Every day page (lock check)

---

## 6) Interaction State (No Persistence)

Use in-memory React state (`useState`) only for each page interaction.

Rules:
- No `localStorage` usage for claimed coupons or selections
- No saved progress across refresh/reopen
- Coupon can be downloaded immediately after interaction completion
- Unlock gating remains date-based and independent of interaction state

---

## 7) Shared Components (Must Build Once, Reuse Everywhere)

### 7.1 PageLayout (`components/layout/PageLayout.tsx`)
Responsibilities:
- Render page background image (full screen, fixed behind)
- Provide header with optional back button (to Home)
- Provide consistent centered content area
- Add ambient overlays optionally (sparkles/hearts)

### 7.2 Sticker (`components/layout/Sticker.tsx`)
Responsibilities:
- Render an SVG/PNG with consistent sticker shadow + hover scale
- Optional animation class:
   - `float` (slow up/down)
   - `sway` (gentle rotation)
   - `none`

### 7.3 Modal (`components/layout/Modal.tsx`)
Responsibilities:
- Backdrop + frosted glass panel
- Use `framer-motion` for open/close transitions
- Close via:
   - click backdrop
   - ESC key
   - close button (heart icon)

Assets:
- `/assets/ui/modal-frame.svg`
- `/assets/ui/close-heart.svg`

### 7.4 CountdownPill (`components/layout/CountdownPill.tsx`)
Responsibilities:
- Display “Next day unlocks in: HH:MM:SS”
- Update every second on Home

Asset:
- `/assets/home/countdown-clock.svg`

### 7.5 Roadmap (`components/layout/Roadmap.tsx`)
Responsibilities:
- Render ribbon path and stations in order
- Visual state per station:
   - locked: dim + lock overlay
   - today: glow pulse
   - unlocked: normal

Assets:
- `/assets/home/roadmap-ribbon-path.svg`
- `/assets/home/station-node.svg`
- `/assets/icons/*.svg`
- `/assets/ui/lock-icon.svg`
- `/assets/ui/tooltip-bubble.svg`

### 7.6 CouponCard + Download (`components/coupon/*`)
CouponCard responsibilities:
- Render consistent coupon design using template
- Insert day title, icon, reward text, signature
- Signature rotates among:
   - “your buira”
   - “your gadhu”
   - “your idiot”
   - “your chhagol”
   - “yours truly”
   - “your loves you like crazy guy”
   - “your man”
   - “yours forever”

Assets:
- `/assets/coupons/coupon-base-template.svg`
- `/assets/coupons/coupon-divider.svg`
- `/assets/coupons/coupon-stamp-redeemable.svg` (optional)

Download responsibilities (`useCouponDownload.ts`):
- Export coupon ref to PNG with html-to-image
- Filename format:
   - `coupon-<dayId>.png`
   - if selection exists: `coupon-<dayId>-<selection>.png`

### 7.7 LockedView (`components/layout/LockedView.tsx`)
Responsibilities:
- Show lock icon + countdown until unlock + back to home

Asset:
- `/assets/ui/lock-icon.svg`

---

## 8) Word Cloud (Home) — Must Match Approved Mock Vibe

You have:
- A final word-cloud image asset (optional use)
- A “background heart image” to place behind word render
- The main word: **SIHINTA** (center, biggest)
- Deduped list of **41 unique words** (render exactly once)

### 8.1 Word List Source (`wordcloudWords.ts`)
Must export:
- `MAIN_WORD = "SIHINTA"`
- `WORDS` array of 41 items (exact spelling):
   - Loitta maas
   - Maria B
   - AirBnb 😉
   - cutush
   - goltush
   - gadhu
   - chagol
   - motu
   - bashay jabo
   - matha tipe dao
   - etta gaan shunao
   - tolomaaa
   - appa dao
   - ki diba
   - Not insinuating..
   - hypothetically...
   - accha dhoro
   - thame thame
   - sowwie
   - free tissues
   - Ajke Oneek Khabo
   - Kutkut
   - KitKat
   - Dark
   - Phuush
   - Futfuti
   - Potlaa
   - Beyadop
   - Buira
   - Lalla la la la
   - vroom vroom
   - Bridge
   - Dhaap
   - How would I know..
   - Na ekhoniii
   - Chanachur
   - Fuchka
   - Busabaa
   - Protocol
   - Janoo ki hoise
   - the things i do for you

### 8.2 Layout Approach (Deterministic, No Random)
To generate a consistent designed look:
- Use a **fixed square container**: `min(92vw, 720px)`, `aspect-ratio: 1/1`
- Render a **heart background image** behind the words (the one you generated to be used as background)
- Place words using a **layout map** (`wordcloudLayout.ts`) with normalized coordinates.

Rules:
- MAIN_WORD at exact center, largest.
- All other 41 words placed exactly once.
- Small rotations only: -12° to +12° for outer words; inner words mostly 0°.

Implementation requirement:
- The agent must create a `WORD_LAYOUT` array with an entry for:
   - MAIN_WORD + all 41 words
- Each entry includes:
   - `text`, `x`, `y`, `scale`, `rotate`, `variant`

### 8.3 Word Styling (Sticker text effect)
Implement sticker-style via CSS (or Tailwind + inline style):
- Fill: mostly cocoa `#8B6F47`
- Accents: 15–25% words use `#FFB6C1` or `#FFDAB9`
- Outline effect using multi-layer `text-shadow`:
   - thick soft white outline
   - cocoa outline
   - soft drop shadow

All words have:
- `font-family: Fredoka`
- `font-weight: 700` (MAIN_WORD 900)
- subtle floating motion (disabled for reduced motion)

### 8.4 Hearts sprinkled
Use `/assets/ui/heart-small.svg` as decorative sprinkles.
Create `wordcloudHearts.ts` with fixed coordinates for 15–30 hearts.

### 8.5 Animations
- Words: gentle float (6–10s loop), random staggered delays BUT deterministic:
   - delays derived from stable hash of `text` so it’s consistent each load
- Background heart: very subtle glow pulse (optional)
- Reduced motion: disable float/glow

Acceptance criteria:
- Word cloud matches the approved mock’s vibe: dense heart shape, SIHINTA prominent center, sticker-like feel.
- All 41 words rendered exactly once (plus SIHINTA).

---

## 9) Page-by-Page Experience Specs (Assets + Elements + Animations)

Each day page must:
- Gate via unlock engine; if locked -> LockedView
- Show dreamy background + centered interactive scene
- Provide an interaction that results in a coupon modal
- Allow PNG download

### 9.1 Home (`/`)
Assets:
- `/assets/backgrounds/global-dreamy-gradient.*`
- `/assets/home/roadmap-ribbon-path.svg`
- `/assets/home/station-node.svg`
- `/assets/icons/*.svg`
- `/assets/home/countdown-clock.svg`
- `/assets/ui/lock-icon.svg`
- `/assets/ui/tooltip-bubble.svg`
- Word cloud heart background image (your generated heart background)
- Optional: final wordcloud image asset (only if you decide to show it instead of code-generated text)

Design elements:
- Hero title + subtitle
- WordCloud component
- Roadmap component
- CountdownPill

Animations:
- Roadmap today station: glow pulse
- Hover unlocked stations: lift + glow
- WordCloud: gentle float + shimmer
- Reduced motion: static

Experience:
- Clear entry point into today’s day, anticipation via countdown, warm romantic feel.

---

### 9.2 Rose Day (`/rose-day`)
Assets:
- `/assets/rose-day/bg-rose-field.*`
- `/assets/rose-day/rose-red.svg`
- `/assets/rose-day/rose-blue.svg`
- `/assets/rose-day/rose-white.svg`
- `/assets/rose-day/rose-pink.svg`
- `/assets/rose-day/selection-glow.svg`
- Modal/coupon assets:
   - `/assets/ui/modal-frame.svg`, `/assets/ui/close-heart.svg`
   - `/assets/coupons/coupon-base-template.svg`, `/assets/coupons/coupon-divider.svg`, optional stamp

Design elements:
- Four roses arranged neatly
- Prompt text

Animations:
- Roses sway slowly
- Hover: slight scale + glow
- Click: selection glow appears
- Modal pop-in

Experience:
- Choose a rose → instantly rewarded with a matching coupon.

---

### 9.3 Propose Day (`/propose-day`)
Assets:
- `/assets/propose-day/bg-day-date.*`
- `/assets/propose-day/icon-food.svg`
- `/assets/propose-day/icon-activity.svg`
- `/assets/propose-day/icon-place.svg`
- `/assets/propose-day/ring-box.svg`
- `/assets/propose-day/ring-box-open.svg`
- Modal/coupon assets

Design elements:
- Three choice cards
- Ring box display near bottom

Animations:
- Card hover lift
- On select: ring box scale pop + swap to open
- Modal pop-in

Experience:
- Pick the vibe of a future proposal moment.

---

### 9.4 Chocolate Day (`/chocolate-day`)
Assets:
- `/assets/chocolate-day/bg-choco.*`
- `/assets/chocolate-day/choco-box.svg`
- `/assets/chocolate-day/kitkat.svg`
- `/assets/chocolate-day/dairy-milk.svg`
- `/assets/chocolate-day/dark-chocolate.svg`
- `/assets/chocolate-day/ferrero.svg`
- `/assets/chocolate-day/snickers.svg`
- `/assets/chocolate-day/slot-highlight.svg`
- Modal/coupon assets

Design elements:
- Box with 5 slots
- Chocolates on side

Animations:
- Draggable hover scale
- Slot highlight on hover
- On drop: small bounce
- On completion: sparkles overlay + modal

Experience:
- Build a cute chocolate box and “seal” the day.

---

### 9.5 Teddy Day (`/teddy-day`)
Assets:
- `/assets/teddy-day/bg-teddy.*`
- `/assets/teddy-day/teddy-base.svg`
- `/assets/teddy-day/teddy-heart-accessory.svg`
- `/assets/teddy-day/teddy-bow-accessory.svg`
- `/assets/teddy-day/teddy-flower-bouquet-accessory.svg`
- Modal/coupon assets

Design elements:
- Teddy center
- Accessories toggles
- Confirm button

Animations:
- Accessory click: pop-in
- Confirm: teddy wiggle
- Modal pop-in

Experience:
- Build her teddy of the day.

---

### 9.6 Promise Day (`/promise-day`)
Assets:
- `/assets/promise-day/bg-promise.*`
- `/assets/promise-day/promise-box-closed-1.svg`
- `/assets/promise-day/promise-box-closed-2.svg`
- `/assets/promise-day/promise-box-closed-3.svg`
- `/assets/promise-day/promise-box-closed-4.svg`
- `/assets/promise-day/scroll-open.svg`
- `/assets/promise-day/stamp-promise.svg`
- `/assets/promise-day/final-glow-frame.svg`
- Modal/coupon assets

Design elements:
- Several mystery boxes
- Reveal scroll modal

Animations:
- Box hover wiggle
- On reveal: stamp pop + tiny sparkles
- Final reveal: glow pulse + slower text (typewriter)
- Modal pop-in

Promise logic (must):
- Clicking any box reveals the next promise in fixed queue
- Funny promises first, main promise last
- Coupon contains main promise

Experience:
- Funny surprises leading to heartfelt promise.

---

### 9.7 Hug Day (`/hug-day`)
Assets:
- `/assets/hug-day/bg-hug.*`
- `/assets/hug-day/icon-cozy-hug.svg`
- `/assets/hug-day/icon-bear-hug.svg`
- `/assets/hug-day/icon-gentle-hug.svg`
- `/assets/hug-day/icon-sensual-hug.svg`
- `/assets/hug-day/icon-snug-hug.svg`
- `/assets/hug-day/hug-meter-heart-empty.svg`
- `/assets/hug-day/hug-meter-heart-fill.svg`
- Modal/coupon assets

Design elements:
- Hug type selection row
- Hold-to-hug meter + button

Animations:
- Selected hug: glow ring
- Hold: meter fill animation
- Completion: heart burst + modal

Experience:
- A playful “hold to hug” that feels warm and cute.

---

### 9.8 Kiss Day (`/kiss-day`)
Assets:
- `/assets/kiss-day/bg-kiss.*`
- `/assets/kiss-day/kiss-mark.svg`
- `/assets/kiss-day/floating-hearts-pack.svg`
- Modal/coupon assets

Design elements:
- Kiss mark center
- Heart particle overlay layer

Animations:
- On click: heart particles float up for ~2s
- Modal pop-in after particles begin/end

Experience:
- A quick cute “kiss” moment with floating hearts.

---

### 9.9 Valentine’s Day (`/valentines-day`)
Assets:
- `/assets/valentines-day/bg-valentine.*`
- `/assets/valentines-day/golden-heart.svg`
- `/assets/valentines-day/button-yes.svg`
- `/assets/valentines-day/button-no.svg`
- `/assets/valentines-day/scramble-sparkles.svg`
- `/assets/valentines-day/confetti-hearts.svg`
- Modal/coupon assets

Design elements:
- Big question text
- Two buttons
- Golden heart centerpiece

Animations / mechanic (must):
- Hover “No”:
   - scramble its text briefly
   - swap labels so hovered becomes “Yes” and the other becomes “No”
   - allow repeated play
- Clicking “Yes”:
   - confetti hearts overlay + final modal

Experience:
- Playful teasing that always results in “Yes”.

---

## 10) Phased Build Plan (Each Phase Must Be Completed & Validated)

### Phase 1 — Setup Project
Tasks:
- Create Vite React project (TypeScript)
- Install required deps (router, tailwind, framer-motion, date-fns, html-to-image, dnd-kit)
- Add Fredoka font
- Copy assets into `public/assets`
  Validation:
- App runs
- Opening `/assets/ui/modal-frame.svg` in browser works

### Phase 2 — Theme & Core Layout Components
Tasks:
- Tailwind theme tokens for palette
- Build: PageLayout, Sticker, Button primitives
- Add reduced-motion handling
  Validation:
- Demo page shows background + sticker hover + smooth layout

### Phase 3 — Routing + Config + Unlock Engine + Debug
Tasks:
- Add all routes and placeholder pages
- Implement `DAYS` config
- Implement unlock logic + debug overrides
- Implement LockedView
  Validation:
- `?debugAll=1` unlocks all
- Locked pages show countdown + lock

### Phase 4 — Modal System + Coupon System + PNG Export
Tasks:
- Modal component with assets
- CouponCard component with template assets
- Download to PNG via html-to-image
- Keep interaction state in-memory only (no persistence)
  Validation:
- Download produces readable PNG
- Refresh resets interaction UI state

### Phase 5 — Home Page + Word Cloud (Final)
Tasks:
- Home hero + roadmap + countdown
- Implement WordCloud component:
   - uses heart background image
   - renders SIHINTA + all 41 words once
   - fixed layout array + hearts sprinkle array
   - sticker text effect and gentle float
     Validation:
- WordCloud matches mock vibe
- Console/dev assertion confirms total words rendered = 42 (41 + SIHINTA)

### Phase 6 — Rose Day
Tasks:
- Scene + roses + selection glow + coupon
  Validation:
- Each rose produces correct coupon filename and text

### Phase 7 — Propose Day
Tasks:
- Options cards + ring swap + coupon
  Validation:
- Select any option -> ring opens -> coupon

### Phase 8 — Chocolate Day (DND)
Tasks:
- Dnd-kit drag/drop with 5 slots
- Completion detection
  Validation:
- Works on touch + desktop
- Prevent duplicates

### Phase 9 — Teddy Day
Tasks:
- Accessories overlay + confirm wiggle + coupon
  Validation:
- Accessories align correctly across screen sizes

### Phase 10 — Promise Day
Tasks:
- Promise queue deterministic reveal
- Final glow + main promise coupon
  Validation:
- Always ends with main promise last

### Phase 11 — Hug Day
Tasks:
- Hug selection + hold meter + completion
  Validation:
- Hold interaction stable on mobile

### Phase 12 — Kiss Day
Tasks:
- Kiss click -> heart particles -> coupon
  Validation:
- Hearts animate smoothly

### Phase 13 — Valentine’s Day Finale
Tasks:
- No hover scramble+swap loop
- Yes click confetti + final coupon
  Validation:
- No effectively never chosen; interaction remains fun

### Phase 14 — Polish & QA
Tasks:
- Responsive fixes
- Reduced motion verification
- Performance optimization
- Final copy polish
  Validation:
- Works on mobile Safari/Chrome
- No layout breaks

---

## 11) Final Acceptance Checklist (Definition of Done)
- All routes exist and match config.
- Unlock system works with real dates + debug overrides.
- Home shows:
   - word cloud + roadmap + countdown
- Every day page:
   - has correct assets
   - has the specified interaction
   - shows a coupon modal on completion
   - downloads a PNG coupon
- No claimed/selection persistence across refresh
- Word cloud:
   - SIHINTA centered and largest
   - all 41 words rendered exactly once
   - heart background visible behind
- Reduced motion supported.
- Mobile supported.

---
