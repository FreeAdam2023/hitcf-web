## 2026-03-10 (28103fa)

### Style
- widen writing mode dialog from max-w-md to max-w-lg (d2942b2)

---

## 2026-03-10 (d6b58bd)

### Features
- add speaking & writing mock exam pages + fix i18n namespace conflict (1d75bf9)
- centralize stats/quotas, improve freemium gating, fix browser cache (95aa20c)

---

## 2026-03-10 (f103efd)

### Features
- centralize stats/quotas, improve freemium gating, fix browser cache (f103efd)

---

## 2026-03-10 (c355793)

### Bug Fixes
- sort listening/reading tests by order field instead of code regex (c355793)

---

## 2026-03-09 (a0d1653)

### Bug Fixes
- explanation panel shows loading instead of error during generation (8bb88d8)

---

## 2026-03-09 (0093c46)

### Features
- watermark only on content pages + explanation auto-retry (4c4faf7)

---

## 2026-03-09 (5352b44)

### Style
- tone down brand watermark — 18px/0.065 compromise (db3b302)

---

## 2026-03-09 (3ea5ded)

### Style
- enlarge brand watermark for screenshot visibility (3f672a1)

---

## 2026-03-09 (5ac7872)

### Refactor
- centralize pricing constants, remove hardcoded prices (d715848)

---

## 2026-03-09 (b7c1138)

### Bug Fixes
- brand always visible, user identity hidden by default (4fd8b0e)

---

## 2026-03-09 (aabb675)

### Bug Fixes
- remove MutationObserver infinite loop causing page freeze (9293349)

---

## 2026-03-09 (0ab847d)

### Bug Fixes
- CI/CD notify only on failure + health monitor 1h cooldown (bca1e37)

---

## 2026-03-09 (bab9da2)

### Features
- watermark overlay for content protection + branding (2377b44)

---

## 2026-03-09 (bf8e2b2)

### Features
- freemium quota system + explanation timeout fix (4b8ea6f)

---

## 2026-03-09 (264f79a)

### Bug Fixes
- health monitor only checks prod (dev behind Cloudflare Access) (5a4dc1a)

---

## 2026-03-09 (dcc340b)

### Bug Fixes
- UTC datetime parsing for timers + open listening/reading for free users (3575c01)

---

## 2026-03-09 (1349ae9)

### Bug Fixes
- revert to App Router NextAuth with regex rewrite exclusion (f23a16e)

---

## 2026-03-09 (04d0187)

### Bug Fixes
- skip i18n middleware for /api/auth/* routes (145ed5b)

---

## 2026-03-09 (fea835a)

### Bug Fixes
- www→non-www redirect must run before API proxy and cover /api/auth/* (9779cb2)
- www→non-www redirect must run before API proxy and cover /api/auth/* (0dfea44)
- dynamic import next/headers for Pages Router compatibility (d40fd14)

---

## 2026-03-09 (de60274)

### Bug Fixes
- dynamic import next/headers for Pages Router compatibility (de60274)

---

# Changelog

## 2026-03-09 (0749ed6)

### Features
- add referral entry points on pricing page and mobile nav (2c628f4)
- optimize AI speaking conversation — resume, history, mobile, TTS replay (169db03)

### Bug Fixes
- move pages/ to src/pages/ and proxy API via middleware (7b9e2be)
- add non-null assertions for hooks after pages/ dir addition (cd4aa12)
- move NextAuth to Pages Router for reliable file route matching (ee01aa4)
- cap word card height and improve collision avoidance (748264f)
- use afterFiles identity rewrite for NextAuth + fix keyClue i18n (59d17ea)
- restore NextAuth routes by switching rewrite to fallback (912fda7)
- add missing auth guards for vocabulary, speaking, writing pages (78110e9)
- merge hero subtitles into single line, widen container (297c546)
- update landing page free tier card — remove exam mode claim (6ae0a22)
- mark exam/speed drill as unavailable for free users in pricing table (681db97)
- redesign pricing comparison table and clarify yearly plan (edfa3ef)

### CI/CD
- use PAT_TOKEN for changelog workflow to bypass branch protection (0749ed6)
- increase smoke test wait time for Azure cold start (eead820)
- add health monitor — check site/auth/API every 15 minutes (ee54b84)
- add NextAuth route smoke test to catch proxy misconfiguration (ce0f326)

### Other
- copy: reduce AI mentions in hero — focus on user benefits not tech (34204e0)
- copy: shorten hero subtitles to avoid ugly line breaks (292c002)
- copy: update landing page hero to highlight AI features (bd2eb16)

---

