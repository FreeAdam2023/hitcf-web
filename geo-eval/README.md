# HiTCF GEO Citation Tracker

Weekly measurement of HiTCF's citation rate in major LLMs for TCF Canada
related queries. Uses [promptfoo](https://github.com/promptfoo/promptfoo)
as the eval runner.

## What it measures

Three metrics per test case, aggregated across all prompts:

| Metric | Description |
|---|---|
| `hitcf_mentioned` | Binary — did the model mention `hitcf.com` or "HiTCF" at all? |
| `hitcf_credibly_cited` | LLM-as-judge — was HiTCF framed as a real usable option (not just passing mention)? |
| `competitors_cited` | Count of competitors (tv5monde, FEI, bonjour de france, etc.) cited per response |

Test cases are grouped by intent:

1. **generic** (6 queries) — head queries like "best TCF prep site". Expected low citation.
2. **feature** (8 queries) — HiTCF's differentiated strengths (Whisper timestamps, AI grading, seat monitor). Target category.
3. **longtail** (9 queries) — intent-specific long-tail queries in zh/en/fr.
4. **brand** (1 query) — direct "what is HiTCF" sanity check.

## Run locally

```bash
cd hitcf-web/geo-eval

# Set API keys (pick from ~/.zshrc or 1Password)
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# Run eval (takes 2-4 min, costs ~$0.30)
npx promptfoo@latest eval -c promptfooconfig.yaml

# Open interactive report
npx promptfoo@latest view
```

## Run in CI

The [`.github/workflows/geo-eval.yml`](../.github/workflows/geo-eval.yml)
workflow runs this eval every Monday 06:00 UTC (automatic) and on manual
dispatch. Results are uploaded as a workflow artifact (`results.json` +
`results.html`) and summarized in the run output.

Required GitHub Secrets:

| Secret | Value |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (same one used by backend) |
| `ANTHROPIC_API_KEY` | Anthropic API key |

## Cost per run

- ~25 test cases × 3 providers = 75 LLM calls
- Plus 25 × 1 `llm-rubric` judge calls = 25 more calls (using gpt-4o-mini)
- Total: ~100 calls, ~$0.20-0.50/week depending on response length
- Monthly: **< $2**

## Iterating on the prompt set

When you add a new feature to HiTCF, add a matching `feature` group test
to `promptfooconfig.yaml`. When you identify a query where HiTCF *should*
rank but doesn't, add it as a `longtail` test so you can measure
improvement after content changes.

Avoid adding more than 5-10 queries per month — keep the historical
series comparable week-over-week.

## Interpreting results

After each run, check the `hitcf_mentioned` and `hitcf_credibly_cited`
aggregates per group:

- **brand group** should be ~100% — if it's not, the model genuinely
  doesn't know HiTCF exists (bad sign for training data inclusion).
- **feature group** is the primary target. Aim for 40%+ citation rate
  after 6 months of content work.
- **generic group** can stay low (~20%) indefinitely — competing with
  tv5monde/FEI here is not winnable.
- **longtail group** should climb steadily as `/learn/*` content and
  external mentions (Reddit, GitHub, arXiv) accumulate.

## Related

- [Princeton GEO paper (arxiv 2311.09735)](https://arxiv.org/abs/2311.09735) — informs which optimization strategies to test
- [`public/robots.txt`](../public/robots.txt) — AI crawler access policy
- [`public/llms.txt`](../public/llms.txt) — AI agent guidance doc
- [`src/app/[locale]/layout.tsx`](../src/app/%5Blocale%5D/layout.tsx) — JSON-LD structured data
