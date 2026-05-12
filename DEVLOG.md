## Day 1 — 2026-05-07

**Hours worked:** 6
**What I did:** Worked entirely on writing the core logic and structural foundation for the audit engine.
**What I learned:** Building a flexible analysis pipeline requires careful separation of concerns to ensure the backend remains scalable.
**Blockers / what I'm stuck on:** Figuring out how to eventually integrate LLM features without slowing down the core audit processing time.
**Plan for tomorrow:** Initialize the git repository, set up the base project, and implement the PDF generation and email functionalities.

## Day 2 — 2026-05-08

**Hours worked:** 5
**What I did:** Initialized the repository.Wrote the frontend and added the email functionality along with the initial PDF feature. Cleaned up the frontend by removing unnecessary toaster tags in `Home.tsx`.
**What I learned:** Generating PDFs programmatically and attaching them to automated emails requires careful handling of asynchronous streams in Node.js.
**Blockers / what I'm stuck on:** Ensuring the PDF layout remains consistent and legible when exported.
**Plan for tomorrow:** Implement rate limiting on the API routes to prevent abuse.

## Day 3 — 2026-05-09

**Hours worked:** 4
**What I did:** Added rate limiting to the application's endpoints.
**What I learned:** Implementing efficient rate-limiting algorithms like the Token Bucket pattern in middleware is crucial for protecting backend resources from traffic spikes.
**Blockers / what I'm stuck on:** Fine-tuning the rate limits so that legitimate operations aren't accidentally throttled during heavy usage.
**Plan for tomorrow:** Begin integrating the LLM for the audit summaries using Langchain and GROQ.

## Day 4 — 2026-05-10

**Hours worked:** 6
**What I did:** Integrated the GROQ LLM using Langchain. Successfully added the LLM summary capabilities directly into the audit engine pipeline.
**What I learned:** Langchain provides a very clean abstraction layer, and GROQ's inference speeds are exceptionally fast for generating rapid summaries.
**Blockers / what I'm stuck on:** Getting the Langchain system prompts perfectly formatted to consistently return the desired summary structure.
**Plan for tomorrow:** Refine the system prompts, build a fallback mechanism in case the LLM fails, and add a markdown renderer.

## Day 5 — 2026-05-11

**Hours worked:** 5
**What I did:** Fixed a small issue in the summary system prompt. Added a fallback summary mechanism for better reliability. Implemented a markdown renderer on the frontend to properly display the generated summaries.
**What I learned:** Designing resilient AI systems means always having a graceful fallback logic when external LLM endpoints timeout or fail.
**Blockers / what I'm stuck on:** Translating the rendered markdown styles accurately into the PDF export.
**Plan for tomorrow:** Add markdown support to the PDF generator and refactor the backend routes to ensure robust error handling everywhere.

## Day 6 — 2026-05-12

**Hours worked:** 6
**What I did:** Added markdown support to the PDF generation and integrated the fallback summary. Conducted a major refactor to add proper error handling across all routes. Wrote test cases and added all the required `.md` files.
**What I learned:** Centralizing error handling cleans up route controllers significantly. Also, writing test cases and documentation immediately after a major refactor prevents technical debt and ensures system stability.
**Blockers / what I'm stuck on:** None right now.
**Plan for tomorrow:** Review the week's progress and make sure everything is correct before submission.
