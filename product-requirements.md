# Product Requirements Document (PRD)
## Valentine Week Gift Website — React.js SPA

---

## 1. Product Overview

### Product Name
**Valentine Week — A Digital Love Journey**

### Purpose
A time-gated, interactive, romantic website designed as a gift for the user’s girlfriend while she is away for work. The website allows her to experience each day of Valentine’s Week through playful, emotional, and interactive mini-experiences, culminating in a final Valentine’s Day moment.

Each day:
- Unlocks automatically based on date
- Contains a themed interactive experience
- Rewards the user with a downloadable coupon that can be redeemed later in real life

---

## 2. Target User

### Primary User
Girlfriend (recipient of the gift)

### Secondary User
Creator of the website (for testing/debugging)

---

## 3. Core Product Goals

The product must:

1. Make her feel included, loved, and surprised even when physically apart.
2. Feel soft, dreamy, and playful.
3. Be intuitive with zero instructions.
4. Reward interaction with a beautiful keepsake coupon each day.
5. Build anticipation through locked days + countdown timer.
6. Work smoothly on mobile and desktop.
7. Respect reduced-motion accessibility settings.

---

## 4. Key Product Features

### 4.1 Daily Unlock System

Each day unlocks automatically at midnight (local time).

Order:
1. Rose Day
2. Propose Day
3. Chocolate Day
4. Teddy Day
5. Promise Day
6. Hug Day
7. Kiss Day
8. Valentine’s Day

#### Locked Day Behavior
If user visits locked page:
- Show Locked Screen
- Display lock icon
- Show countdown until unlock
- Provide Back to Home button

#### Unlocked Day Behavior
- Page accessible anytime after unlock
- Completed days remain accessible
- Downloaded coupons are remembered

---

## 5. User Flow (High-Level)

Ideal journey:

1. User opens Home.
2. Sees roadmap + unlocked day.
3. Clicks today’s day.
4. Completes interaction.
5. Receives coupon.
6. Downloads coupon.
7. Returns next day for next unlock.

---

## 6. Detailed Page Requirements

---

## 6.1 Home Page

### User Goal
Understand what today is, what’s unlocked, and what’s coming next.

### Elements
- Welcome title
- Heart word cloud
- Valentine roadmap
- Countdown timer

---

### User Stories

#### US-H1 Welcome
User sees a warm welcome message.

Acceptance:
- Title visible
- Subtitle visible
- Emotionally warm tone

---

#### US-H2 Word Cloud
User sees heart-shaped word cloud.

Acceptance:
- Words inside heart shape
- Gentle shimmer animation

---

#### US-H3 Roadmap
User sees all 8 days visually.

Acceptance:
- Ribbon path visible
- Day icons visible
- Locked days dimmed

---

#### US-H4 Countdown
User sees timer until next day.

Acceptance:
- HH:MM:SS format
- Updates every second

---

#### US-H5 Navigation
User clicks a day.

Acceptance:
- Unlocked → navigates
- Locked → tooltip message

---

## 6.2 Rose Day

### Goal
Choose a rose color.

### Interaction
Click one rose → coupon.

Acceptance:
- Four roses visible
- Hover glow
- Click selects
- Coupon reflects chosen color

---

## 6.3 Propose Day

### Goal
Choose proposal style.

Options:
- Food
- Activity
- Special place

Acceptance:
- Three cards visible
- Click triggers ring animation
- Coupon appears

---

## 6.4 Chocolate Day

### Goal
Build a chocolate box.

Acceptance:
- Empty box visible
- Drag chocolates
- Slot highlights
- Completion triggers coupon

---

## 6.5 Teddy Day

### Goal
Customize teddy.

Acceptance:
- Teddy visible
- Accessories toggle
- Confirm triggers animation
- Coupon appears

---

## 6.6 Promise Day

### Goal
Reveal promises playfully.

Acceptance:
- Multiple boxes visible
- Each click reveals next promise
- Funny promises first
- Main promise last
- Final coupon contains main promise

---

## 6.7 Hug Day

### Goal
Choose a hug and hold it.

Acceptance:
- 5 hug options
- Hold button fills meter
- Completion shows coupon

---

## 6.8 Kiss Day

### Goal
Send a virtual kiss.

Acceptance:
- Kiss icon visible
- Click → floating hearts
- Coupon appears after animation

---

## 6.9 Valentine’s Day

### Goal
Answer the final question.

Acceptance:
- Question visible
- Hover No → text scrambles + swaps
- Click Yes → confetti + final coupon

---

## 7. Coupon System Requirements

Each day must produce a coupon.

Coupon must:
- Be downloadable as PNG
- Include day title
- Include reward text
- Include playful signature
- Have consistent design

Success Criteria:
- Download always works
- Claimed state persists
- Layout readable on all screens

---

## 8. Non-Functional Requirements

### Performance
- Page loads < 2 seconds
- SVG assets optimized

### Accessibility
- Keyboard navigation works
- Reduced motion supported

### Mobile
- Fully responsive
- Drag interactions work on touch

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
Drag fails mobile | Use touch-compatible drag library |
Timing wrong | Debug date override |
Blurry coupons | High pixel ratio export |
Too many animations | Reduced motion support |

---

## 10. Definition of Done

The product is complete when:

- All pages exist
- Unlock system works
- Every interaction produces coupon
- Coupons download correctly
- UI matches dreamy theme
- Works on mobile + desktop
- No blocking bugs

---

## End of PRD
