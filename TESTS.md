# TESTS.md

## Automated Test Suite: Audit Engine

**Filename:** `audit_engine.test.js`

This test suite uses **Vitest** to verify the core logic, error handling, and recommendation generation of the `audit_engine`.

### Test Coverage Breakdown

1. **Input Validation**
   - **Test:** `"should throw error on invalid input structure"`
   - **What it covers:** Ensures the engine implements structural validation before processing data. It passes malformed input (e.g., `tools` as a string instead of an array) and verifies that the engine explicitly rejects it with an `"invalid input structure"` error.

2. **LLM Failure / Fallback Handling**
   - **Test:** `"should use the fallback summary when the LLM call fails"`
   - **What it covers:** Tests the resiliency of the engine when the external LLM dependency (`model.invoke`) fails or times out. It mocks a rejected promise from the LLM and confirms that the engine gracefully degrades to generate a deterministic, hard-coded markdown summary with correct financial calculations.

3. **'Overspend' Finding Logic**
   - **Test:** `"should return 'overspend' finding when the spend is higher then expected"`
   - **What it covers:** Validates the core financial calculation logic. It passes an inflated monthly spend ($200 for 1 seat on a standard plan) and ensures the engine correctly identifies this discrepancy and tags it with the `"overspend"` finding type.

4. **'Cheaper-Plan' Finding Logic**
   - **Test:** `"should return 'cheaper-plan' finding when a cheaper plan is available"`
   - **What it covers:** Verifies the engine's internal pricing knowledge for a specific tool. It checks that the engine can identify when a user is over-provisioned and successfully recommends a cheaper tier (e.g., suggesting a 'plus' plan over a 'pro' plan) by attaching the `"cheaper-plan"` finding type.

5. **'Alternatives' Finding Logic**
   - **Test:** `"should return 'alternatives' finding when alternatives are available"`
   - **What it covers:** Tests the engine's market comparison capabilities. It ensures the engine evaluates the user's `useCase` (e.g., 'research') and successfully triggers the `"alternatives"` finding type to suggest competing tools that offer better value.

6. **'Wrong-Plan' Finding Logic**
   - **Test:** `"should return 'wrong-plan' finding when the selected plan is inefficient"`
   - **What it covers:** Validates seat-to-plan efficiency constraints. It passes a configuration where a single user is utilizing a 'business' tier, and verifies the engine flags this inefficiency by returning the `"wrong-plan"` finding type.

---

### How to Run the Tests

Since the tests are written using the **Vitest** framework, you can execute them from the root directory of your project using your package manager.

**Standard Run:**

```bash
cd backend
npm install vitest --save-dev # (If not already installed)
npm run test
```
