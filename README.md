# Credex SaaS Audit Tool

A web-based SaaS spend auditor that analyzes your team's tool stack and surfaces overspending, wrong plans, and cheaper alternatives — delivering findings as an AI-written summary with a downloadable PDF report. Built for Credex as a lead-generation and consultation-booking engine targeting early-stage startups and scale-ups.

**Deployed URL:** https://credex-assignment.vercel.app

---

## Screenshots

> _Add 3 screenshots or a Loom/YouTube link here before submission._

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Resend API key
- Groq API key

### Install & Run Locally

```bash
# Clone the repo
git clone https://github.com/raffay69/credex_assignment
cd credex_assignment

# Install backend dependencies
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, RESEND_API_KEY, GROQ_API_KEY

# Run DB migrations
npx prisma migrate dev

# Start backend
node server.js

# In a separate terminal — install & run frontend
cd ../frontend
npm install
npm run dev
```

### Deploy

Backend is deployable to Railway or Render with the same env vars. Frontend deploys to Vercel with `npm run build`.

---

## Decisions

| #   | Decision                                          | Why                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Deterministic audit engine over pure LLM**      | The core savings logic (overspend, wrong-plan, cheaper-plan, alternatives) runs in plain JS. LLM is only used for the narrative summary. This means the numbers are always correct even when the LLM call fails, and the fallback markdown summary keeps the product usable. |
| 2   | **Groq (via LangChain) instead of OpenAI**        | Groq's free tier offers fast inference with llama-3 at no cost during prototyping, which matters for a week-long build. LangChain abstraction means swapping providers later is a one-line change.                                                                           |
| 3   | **Resend for transactional email**                | Resend has the simplest Node.js SDK for attachment-based emails and a generous free tier. The alternative (Nodemailer + SMTP) would require managing a mail server or third-party SMTP credentials.                                                                          |
| 4   | **PDF generated server-side, deleted after send** | Generating the PDF on the server and deleting it after the email is sent avoids storing sensitive financial data as static files. The trade-off is that PDFs can't be re-sent without regenerating — acceptable at this stage.                                               |
| 5   | **Rate limiting at 100 req / 15 min**             | The `/audit` route runs an LLM call, so unbounded traffic would exhaust the Groq quota instantly. 100 requests per 15-minute window is generous enough for demo use but prevents abuse. The trade-off is that a viral spike could throttle legitimate users.                 |
