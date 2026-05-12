# USER_INTERVIEWS.md

### Interview 1: Syed Anas

**Role:** MS Computer Science Student (Massachusetts, USA)  
**Company Stage:** N/A (Full-time student building personal projects)

**Quotes:**

- _"I split a ChatGPT Plus account with two of my roommates right now just so we can all use GPT-4 for our assignments without paying $60 total."_
- _"Cursor looks amazing, but I can't justify a $20 monthly subscription just for my coursework."_
- _"If a site tells me I'll save $240 a year, I don't really care. I graduate in eight months. Tell me what I save this week."_

**The most surprising thing he said:**
His absolute disregard for long-term annual savings. As a student living on a fixed budget and a short timeline, annual projections felt abstract and meaningless to him. He only cared about immediate, month-to-month cash flow.

**What it changed about your design:**
I originally had "Total Annual Savings" as the primary, massive number on the results page. After this chat, I flipped the visual hierarchy. I made the "Total Monthly Savings" the boldest, most prominent metric, pushing the annual projection down to a secondary, smaller font.

---

### Interview 2: Anas Ullah

**Role:** MS Student (Massachusetts, USA)  
**Company Stage:** N/A (Full-time student)

**Quotes:**

- _"I mostly just use the GitHub Copilot student pack because it's free. If I have to pay out of pocket, I usually just use the free web versions."_
- _"I would never link my GitHub or Google account to a random calculator site just to see my usage. I don't trust the permissions."_
- _"I just want to figure out if it's cheaper to use the OpenAI API directly for my final project instead of paying for ChatGPT Plus."_

**The most surprising thing he said:**
I was surprised by how paranoid he was about OAuth and account permissions, even just for his student projects. I thought a "Log in with GitHub to scan your stack" feature would be convenient, but he viewed it as a massive security red flag.

**What it changed about your design:**
This conversation completely validated the decision to make the app a manual-input calculator. I scrapped any lingering ideas of building API integrations to read their actual usage. By making the user type in their seats manually, it bypasses the trust barrier completely and requires zero permissions.

---

### Interview 3: Syed Alamdaar

**Role:** MS Engineering Student (UAE)  
**Company Stage:** N/A (Full-time student)

**Quotes:**

- _"Oh nice, a 'Download PDF' button. Yeah, I'm definitely just going to grab the file and leave. I hate getting startup spam."_
- _"Why would I type my email in the box if I can just click download? I only give my email if it's locked."_
- _"The breakdown is cool, but if you want my contact info, you have to force me. Otherwise, I'm out of here in 10 seconds."_

**The most surprising thing he said:**
How bluntly he admitted that as long as the free "Download PDF" button existed on the page, there was a 0% chance he would voluntarily provide his email address. He explicitly pointed out that I was giving away the maximum value of the tool without asking for anything in return, breaking my own lead-gen funnel.

**What it changed about your design:**
This conversation directly caused the biggest pivot in the project. I immediately deleted the "Download PDF" button from the frontend. I realized that giving away the report for free ruined my ability to capture users. I completely reversed the flow so that the _only_ way to get the detailed PDF report is to enter an email address. This one change transformed the app from a simple calculator into an actual lead-capture engine.
