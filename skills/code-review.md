---
name: code-review
description: Use this skill whenever the user asks for a code review, asks to "check the codebase," "audit the code," "clean things up," "find bugs," or before any major milestone (finishing a feature, before deployment, after a long agent session that touched many files). Also trigger proactively after a large or complex change has just been implemented, since that is when undetected bugs, dead code, and inconsistencies are most likely to have been introduced. Works on any codebase — any language, any framework, any project size, old or new.
---

# Code Review

A systematic process for reviewing code quality, correctness, and consistency. This is not a style-nitpicking exercise — it is a structured search for things that will actually cause bugs, confusion, or maintenance pain, ranked by how much they matter.

## Core Principle

**Every finding gets a severity. Every severity gets fixed in order. Never report a wall of 40 unranked nitpicks — that's useless to act on and gets ignored.**

---

## The Loop

```
1. SCOPE     → What changed recently, or what's the review boundary?
2. SCAN      → Read the actual code, not just file names
3. CLASSIFY  → Bucket every finding into a severity tier
4. REPORT    → Severity-ordered, with file:line references
5. FIX       → Critical and High first, with explicit approval before changing behavior
6. VERIFY    → Confirm fixes didn't break anything; re-run tests/build if available
```

---

## Step 1 — Scope The Review

Before reading code, establish what's actually in scope:

- If this is reviewing a recent change: use `git diff` or `git log` to see what actually changed, rather than re-reviewing the entire codebase from scratch every time
- If this is a full audit: confirm with the user whether they want everything reviewed or specific areas (a section, a feature, a directory)
- Check for any existing project context file (CLAUDE.md, PROJECT_CONTEXT.md, README, or similar) and read it first — it defines the intended architecture, rules, and conventions the code is supposed to follow. Reviewing without this context means missing violations of the project's own stated rules.

```bash
git diff HEAD~5 --stat   # see what files changed recently, adjust range as needed
git log --oneline -10    # recent history for context
```

---

## Step 2 — Scan With A Structured Lens

Don't read code looking for "anything weird." Read it through these specific lenses, in this order, because earlier categories tend to cause the most damage:

### A. Correctness & Bugs
- Logic that doesn't do what it appears intended to do
- Off-by-one errors, incorrect conditionals, inverted booleans
- Race conditions — especially in async code, effects with missing dependencies, event listeners that fire before state is ready
- Memory leaks — event listeners, intervals, observers, or animation loops that are never cleaned up on unmount/destroy
- Error handling that's missing, swallows errors silently, or catches too broadly
- Edge cases: empty arrays, null/undefined, zero, negative numbers, very large inputs

### B. Security
- Hardcoded secrets, API keys, credentials anywhere in the codebase (including in comments or old commented-out code)
- User input rendered without sanitization (XSS risk) — especially `dangerouslySetInnerHTML`, `innerHTML`, `eval`, template literals built from untrusted input
- Missing input validation on anything crossing a trust boundary (form submission, URL params, API responses treated as trusted)

### C. Consistency With Project Rules
- Read any project context file's stated rules and check the code against them literally — if the project says "no em dashes in copy" or "always use named exports" or "colors must come from design tokens," check for violations directly, don't assume compliance
- Inconsistent patterns for the same kind of thing across the codebase (e.g. some components use a context file's tokens, others have hardcoded hex values; some files use arrow functions, others use function declarations, with no apparent reason for the split)
- Dead code: unused imports, unused variables, commented-out blocks left in, components or functions defined but never called

### D. Performance-Relevant Code Smells
(Lighter pass than a full performance audit — flag obvious things, defer deep optimization to the performance-optimization skill if one is available)
- Expensive operations inside render/loop paths that don't need to be there (e.g. creating new objects/arrays/functions on every render when they could be memoized or hoisted)
- Obviously redundant re-renders or re-computations
- Animating layout properties instead of transform/opacity (if relevant to the stack)

### E. Maintainability & Clarity
- Functions or components doing too many unrelated things (a component that fetches data, manages five pieces of unrelated state, and handles three different UI concerns)
- Naming that doesn't reflect what something actually does
- Missing or misleading comments on genuinely non-obvious logic (don't ask for comments on obvious code — that's noise)
- Magic numbers/strings that should be named constants, especially anything that's a design decision (timing values, thresholds, sizes) repeated in multiple places instead of defined once

### F. Style & Formatting
Lowest priority. Only flag if there's an established convention in the project being violated inconsistently, or if something is genuinely confusing to read. Do not generate generic style nitpicks with no real impact (e.g. don't flag single quotes vs double quotes unless the project has a linter rule being violated).

---

## Step 3 — Classify By Severity

Every finding gets exactly one tag:

- **🔴 Critical** — Will cause a bug, crash, security issue, or data loss. Fix before anything else ships.
- **🟠 High** — Will likely cause a problem under realistic conditions (specific edge case, specific user action, specific browser/device). Should be fixed soon.
- **🟡 Medium** — Inconsistency, code smell, or maintainability issue. Not urgent but compounds over time if ignored repeatedly.
- **⚪ Low** — Style, naming, minor clarity. Optional, mention but don't insist.

If something doesn't clearly fit a tier, that itself is information — say so and explain the ambiguity rather than forcing a severity.

---

## Step 4 — Report

Format every finding the same way so it's scannable and actionable:

```
🔴 CRITICAL — src/components/Hero.tsx:84
The ScrollTrigger instance created in useEffect is never killed on unmount.
Navigating away and back will stack duplicate ScrollTrigger instances,
causing animations to fire multiple times and the scroll behavior to
degrade over time.

Fix: store the ScrollTrigger instance in a ref and call .kill() in the
useEffect cleanup function.
```

Group the report by severity, Critical first. Within a severity tier, order by file for easy navigation. Always include the file and line number — a finding without a location is not actionable.

End the report with a one-line summary: how many of each severity, and a plain recommendation on what to tackle first.

**Do not pad the report with Low severity findings to seem thorough.** A short list of real issues is more valuable than a long list padded with trivia. If there's nothing wrong in a category, don't manufacture a finding to fill space.

---

## Step 5 — Fix, With Approval Boundaries

- **Critical and High severity:** propose the fix, but confirm with the user before changing behavior-affecting code, especially if multiple files are touched or the fix is non-trivial. A one-line null check is safe to just fix. A race condition fix that restructures async flow needs a sentence of explanation and a green light first.
- **Medium severity:** batch these and propose them together rather than fixing one at a time with separate approvals — more efficient for both sides.
- **Low severity:** only fix if explicitly asked, or bundle as an optional "also, while I was in there" list at the end.

Never silently fix something the user didn't ask about and didn't see flagged first — surprises in a diff erode trust, even well-intentioned ones.

---

## Step 6 — Verify

After applying fixes:
- Re-run the build if the project has one (`npm run build`, `tsc --noEmit`, etc.) — confirm no new errors introduced
- Re-run tests if they exist
- If no automated verification exists, do a manual sanity pass on the specific areas touched
- Report back: what was fixed, what (if anything) still needs the user's attention, and confirm nothing broke

---

## Hard Rules

- Every finding must have a severity and a location. No vague "this section could be cleaner" without specifics.
- Never report more than what's useful to act on — prioritize signal over volume.
- Never assume project conventions — read the actual project context file if one exists, don't guess at "best practices" that might contradict the project's own stated rules.
- Never silently change behavior-affecting code without flagging it first, even if the fix seems obviously correct.
- Distinguish clearly between "this is a bug" and "this is a style preference" — conflating them in the same severity erodes trust in the whole review.
- If the codebase is large, say so and propose a scoped first pass rather than attempting to review everything shallowly in one sitting.
