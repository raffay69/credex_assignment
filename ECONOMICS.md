# ECONOMICS.md (Unit Economics & Projections)

## 1. Value of a Converted Lead to Credex

To run the economics, we must define what a "credit purchase" or new client is worth to Credex.

- **Target:** Series A–C SaaS company (50–250 employees).
- **Spend:** This profile typically spends $100k–$500k annually on software/cloud infrastructure.
- **Revenue Model:** Assuming Credex monetizes via interchange fees (~1.5%) on a corporate card product, plus potential float or SaaS management subscription fees.
- **Estimated LTV (Annual):** If Credex captures $300,000 of their annual spend on a card, that yields **$4,500 in interchange revenue per year, plus $500 in platform fees.**
- **Conservative ARR per Client:** **$5,000**.

## 2. CAC by GTM Channel (The "$0 Budget" Reality)

While the cash budget is $0, the fully-loaded Customer Acquisition Cost (CAC) must account for software tooling and founder/sales time.

- **X/LinkedIn "Teardown" Threads:**
  - _Cost:_ 2 hours of research/writing per thread.
  - _Yield:_ ~1 closed client per 5 viral threads.
  - _Estimated CAC:_ **$150** (Founder time equivalent).
- **Targeted Cold Outreach:**
  - _Cost:_ Apollo/SalesNav subscription ($100/mo) + 5 hours/week.
  - _Yield:_ Highly targeted, ~2 closed clients per month.
  - _Estimated CAC:_ **$250**.
- **Hacker News "Show HN":**
  - _Cost:_ $0 cash, 1 hour formatting.
  - _Yield:_ High traffic spike, lower intent. ~3 closed clients.
  - _Estimated CAC:_ **$15** (Essentially free).
- **Credex Internal Email List (Unfair Advantage):**
  - _Cost:_ $0.
  - _Yield:_ High trust, immediate conversion.
  - _Estimated CAC:_ **$0**.
- **Blended Initial CAC:** **~$100 per acquired customer.** With an LTV of $5,000, the LTV:CAC ratio is a staggering 50:1 in the early organic days.

## 3. The Profitability Funnel

For this engineering-as-marketing tool to be profitable, it needs to be self-sustaining. Since server/LLM costs are low (~$0.02 per audit using Groq/Anthropic), the conversion math looks like this:

| Funnel Stage                        | Metric / Conversion Rate | Cost / Rev Implication        |
| :---------------------------------- | :----------------------- | :---------------------------- |
| **1. Unique Visitors**              | 1,000 Visitors           | $0 (Organic acquisition)      |
| **2. Audits Completed**             | 25% (250 Audits)         | -$5.00 (API processing costs) |
| **3. Leads Captured**               | 15% (37 Leads)           | Email DB storage (negligible) |
| **4. Consultations Booked**         | 10% (3.7 Bookings)       | Sales rep time ($50/booking)  |
| **5. Credit Purchase (Closed Won)** | 20% (0.75 Clients)       | **+$3,750 ARR Generated**     |

**Conclusion:** At these conservative conversion rates, every 1,000 organic visitors generates ~$3,750 in ARR against ~$190 in API and sales costs. The tool is wildly profitable.

## 4. Path to $1M ARR in 18 Months

To reach $1,000,000 in ARR using our $5,000 ARR/Client estimate, Credex needs **200 net-new clients** from this tool. Spread over 18 months, that requires closing roughly **11 clients per month**.

**What has to be true to hit 11 clients/month?** (Reverse engineering the funnel):

- **Clients Needed:** 11 / 0.20 close rate = **55 Consultations booked per month**.
- **Consults Needed:** 55 / 0.10 booking rate = **550 High-intent leads captured per month**.
- **Leads Needed:** 550 / 0.15 capture rate = **3,666 Audits completed per month**.
- **Audits Needed:** 3,666 / 0.25 completion rate = **14,664 Unique Visitors per month**.

**Is this realistic?**
Getting ~15,000 targeted unique visitors a month without paid ads is difficult but achievable. It requires the **"Shareable Result URL" (Viral Loop)** to have a K-factor > 0.15. Every 10 users must share their audit in a Slack channel that brings in 1.5 new users. Combined with programmatic SEO (ranking for terms like "Cursor vs GitHub Copilot cost") and continuous X/LinkedIn teardowns, this tool can realistically drive the required traffic to generate $1M ARR.
