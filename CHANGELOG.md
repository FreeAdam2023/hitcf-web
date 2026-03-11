## 2026-03-11 (8702cb4)

### Features
- add exclude-answered toggle to test card dialog (43e2d94)

### Bug Fixes
- (ci): auto-sync CHANGELOG commit from main to dev (8702cb4)
- default excludeAnswered to false in test detail page (98730a6)

---

## 2026-03-11 (cf729ee)

### Features
- add exclude-answered toggle to test card dialog (cf729ee)

---

## 2026-03-11 (0720490)

### Bug Fixes
- default excludeAnswered to false in test detail page (0720490)

---

## 2026-03-11 (27eda0c)

### Features
- CF Access Service Token for server-to-server API proxy (3c7ffa8)

---

## 2026-03-11 (312e4d9)

### Bug Fixes
- NextAuth 404 — skip i18n middleware for /api/auth/* routes (bc6acf5)

---

## 2026-03-11 (1686c04)

### Bug Fixes
- use correct Azure default hostname for dev smoke tests (d15dc2e)

---

## 2026-03-11 (a05507c)

### Bug Fixes
- runtime BACKEND_URL — eliminate cross-environment contamination (a6a1762)

---

## 2026-03-11 (0f72554)

### Features
- exclude answered questions in test set practice (bc22e11)
- exclude answered questions in test set practice (63d0887)

---

## 2026-03-11 (32a78d0)

### Other
- revert: remove frontend newline normalization, data fixed in DB instead (92b7fa4)
- revert: remove frontend newline normalization, data fixed in DB instead (613aa0b)

---

## 2026-03-11 (c5e941b)

### Bug Fixes
- normalize excessive newlines in reading passages (97621e8)
- normalize excessive newlines in reading passages (d3f7e3f)

---

## 2026-03-11 (08825b2)

### Bug Fixes
- robust UTC parsing and proper locale formatting for all languages (2986e6d)
- robust UTC parsing and proper locale formatting for all languages (6b061b2)

---

## 2026-03-11 (089eac6)

### Bug Fixes
- parse history timestamps as UTC so date grouping matches local time (dbaafa9)

---

## 2026-03-11 (470bad0)

### Bug Fixes
- rename speed drill to "等级练习" / "Level Practice" in history (f4d5ecf)
- rename speed drill to "等级练习" / "Level Practice" in history (aa91b6a)

---

## 2026-03-11 (62c1e70)

### Bug Fixes
- default speed drill question count to "all" (7e5bca7)
- default speed drill question count to "all" (6945a35)

---

## 2026-03-11 (a701ed5)

### Bug Fixes
- widen level practice dialog + fix theme toggle first click (4695c3d)

---

## 2026-03-11 (06b68f7)

### Features
- show per-level completion progress in speed drill dialog (f3a6235)
- show per-level completion progress in speed drill dialog (4b2bbce)

### Bug Fixes
- show done/total/remaining counts in level practice dialog (523e6fb)
- i18n hardcoded strings + add dedup toggle to speed drill dialog (2655d31)
- show done/total/remaining counts in level practice dialog (38bcc12)
- i18n hardcoded strings + add dedup toggle to speed drill dialog (a05ddbc)

---

## 2026-03-10 (a4b93f8)

### Features
- add frontend event tracking + fix health monitor alert step (327e099)

### Bug Fixes
- mobile footer nav link alignment with flex-wrap (16f5ed6)
- health monitor false positives — grep pattern and exit codes (2cece6b)

### Tests
- add auth API + attempts API tests (13 tests) (a27e416)

---

## 2026-03-10 (8394879)

### Features
- sync exam countdown with backend — no more localStorage-only (59599e8)
- redesign exam countdown as a standalone strip on /tests page (b2fabf6)
- support free trial for all mock exams (listening/reading/speaking/writing) (f814ef8)

### Refactor
- unify continue banners — one banner for all in-progress work (d796b93)
- move mock exam button inline with search bar (291f98f)
- flatten speaking/writing tab UI — merge mock exam into Tâche pill row (a6f82f5)
- move exam countdown from mock exam pages to /tests as global badge (6f17f89)
- restructure speaking/writing tabs — kill test set concept, add mock exam to 随机模考 (19fdef9)

### Other
- remove: kill exam countdown badge from /tests page (e887def)
- copy: add "首次免费体验" to speaking/writing mock exam descriptions (09cdf8c)

---

## 2026-03-10 (df36d29)

### Bug Fixes
- compute TCF level from question_number when level field is null (6033cc9)

---

## 2026-03-10 (097aadd)

### Features
- add mock exam entry buttons on speaking/writing tabs (88fda92)

---

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

