# REFLECTION.md

### 1. The hardest bug you hit this week, and how you debugged it

The most frustrating bug I encountered was a race condition in the backend pipeline handling PDF generation and email dispatch. The application crashed with a "file not found" (`ENOENT`) error when the email service tried to attach the document. I initially hypothesized the file path routing was incorrect, logging absolute versus relative paths. When that wasn't it, I suspected the PDF library was failing silently and wrapped it in try/catch blocks. Finally, I realized the core issue: the PDF file system write stream was synchronous and not properly awaited. The email function fired before the OS finished flushing the data to the disk. To fix it quickly and unblock development, I added a custom 2-second `sleep` promise between generation and dispatch. While not ideal for production, it ensured the file was ready before the email function read it.

### 2. A decision you reversed mid-week, and what made you reverse it

Mid-week, I completely reversed my decision on how users receive their audit report. Initially, I designed a simple "Download PDF" button on the frontend. The logic was low-friction: users run the audit, view the summary, and download the file directly. However, I realized this architecture was a missed opportunity for user retention. If users download and leave, I have no visibility into who they are and no way to contact them again. I decided to scrap the button and force users to enter their email addresses to receive the PDF in their inbox. This pivot transformed a simple utility into a lead-generation engine. Capturing contact information allows me to build a mailing list for future updates and potential monetization. It added backend complexity and slight user friction, but the entrepreneurial trade-off is absolutely worth it to build a sustainable audience.

### 3. What you would build in week 2 if you had it

If I had a second week, my primary focus would be expanding LLM integrations and building a persistent user dashboard. Currently, the app is stateless. I would implement robust authentication to create user accounts. With authentication in place, I'd build a dashboard for users to view past audits and implement comparative analytics. If a user runs an audit a month later, the backend could compare the JSON results and use Langchain/GROQ to generate a "Delta Summary" highlighting what changed. Additionally, I would build a "Chat with your Audit" feature using Retrieval-Augmented Generation (RAG) to let users ask follow-up questions about their report.

### 4. How you used AI tools

I utilized ChatGPT, Gemini, and Claude strictly as interactive coding assistants. I used them exclusively for code-related issues throughout the week, such as writing boilerplate, figuring out syntax, and troubleshooting logic within specific functions. To be completely honest, I didn't experience any instances where the AI gave me wrong or incorrect code or information during my usage. They performed exactly as needed for the coding tasks I gave them, helping me move faster without any major hallucinations or setbacks.

### 5. Self-rating on a 1–10 scale

- **Discipline: 8/10** — Maintained a consistent daily coding schedule.
- **Code Quality: 7/10** — The architecture is modular and error-handling is centralized, but I left in a few temporary hacks to meet deadlines.
- **Design Sense: 7/10** — The UI is clean and functional, but I prioritized backend logic over advanced visual polish.
- **Problem Solving: 9/10** — Successfully navigated complex multi-step integrations and found workarounds when hitting walls.
- **Entrepreneurial Thinking: 9/10** — Pivoting from a free download to an email-gated delivery to capture leads shows a strong focus on building a marketable product.
