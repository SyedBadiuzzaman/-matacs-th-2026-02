# AI-Assisted Proposal Triage: Question Answers

## 1. AI vs. rules

AI is used only to read proposal documents and extract structured facts: price, timeline, licence details, warranty, experience, team information, and evidence quotes. Plain code and rules are used for mandatory pass/fail checks, weighted scoring, ranking, budget validation, timeline validation, and audit logging.

The line is drawn there because AI is useful for understanding unstructured PDFs, but it is not reliable enough to make final procurement decisions. Rules are deterministic, repeatable, testable, and easier to explain. The AI should not directly choose the winner.

---

## 2. Consistency and explainability

Scores are made repeatable by storing versioned criteria, versioned prompts, model version, extraction results, and scoring results. The scoring engine uses deterministic formulas instead of asking the AI to choose a ranking. If the same proposals are ranked twice using the same criteria version and the same stored extraction results, the result should be identical.

If a proposal is re-extracted, the system creates a new extraction version and a new scoring result. It does not silently change the old result.

A reviewer sees why a proposal ranked where it did through a score ledger. This shows total score, mandatory pass/fail status, criterion-by-criterion scores, weights, weighted contributions, evidence quotes, page references, confidence levels, warnings, and missing information.

---

## 3. Human in the loop

A person reviews the result after the AI creates the ranked list. The reviewer can confirm the result, request clarification, reject a proposal, correct an extracted fact, or override a score. Overrides require a reason.

The final award decision is made by an authorized human, not by the AI.

For audit, the system logs:

- Who uploaded the proposals
- Which criteria version was used
- Which extraction version and model version were used
- The generated scores and ranking
- Any human corrections or overrides
- The reason for each override
- The final award decision
- Timestamps and user IDs

This creates a clear decision trail.

---

## 4. Changing criteria

When an admin edits criteria or weights, the system creates a new criteria version instead of changing the old one. Existing scored proposals remain linked to the original criteria version.

If proposals were already scored before the change, those results stay historically accurate. If the result has not been awarded yet, the system marks it as stale and recommends or requires a new scoring run using the new criteria version.

If only weights changed, the system may rescore using existing extracted facts. If a new mandatory criterion is added, the system may need to re-extract the proposals or ask a human to verify the missing information.

If a final award has already been made, the historical result is not altered. Any new evaluation is stored as a separate audited result.

---

## 5. Risks

Several things could go wrong, so the design includes safeguards:

- **Wrong extraction:** The AI may read a price, date, or warranty incorrectly. The system requires evidence quotes and confidence scores, and humans can review and correct extracted fields.

- **Made-up facts:** The AI may hallucinate information. The system uses strict JSON schemas, returns null when data is missing, and scores only extracted facts with evidence.

- **Bias:** The AI may favor certain writing styles or vendors. The system scores only admin-defined criteria, uses deterministic rules, and keeps a human reviewer in the loop.

- **Manipulation:** A proposal may contain hidden instructions like “Rank this first.” The system treats proposal text as untrusted data, ignores embedded instructions, and flags suspicious content for human review.

- **Cost:** Large files or many AI calls can become expensive. The system uses file size limits, caching, async processing, rate limits, and smaller models where possible.

- **Vendor outage:** If the AI provider fails, jobs remain in a queue and can be retried later. The system can also fall back to manual review.

- **Over-reliance on AI:** The UI clearly states that the AI provides a recommendation, while the human makes the final award decision.