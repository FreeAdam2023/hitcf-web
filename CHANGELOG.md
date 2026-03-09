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

