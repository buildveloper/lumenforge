# Workflow & communication

- Wants autonomous execution: make reasonable decisions independently and avoid interrupting with questions the agent can answer itself. Confidence: 0.85
- Insists on never fabricating business facts (pricing, testimonials, customer logos, unsupported claims, legal statements); stop and ask only when the information genuinely cannot be inferred from the repository. Confidence: 0.9
- When blocking input is genuinely required, wants it in a defined format: what is needed, why it cannot be inferred, a recommendation, and what was already completed. Confidence: 0.7
- Requires verification before claims: run the app, interact with it, inspect the console, and fix errors/shifts/overflow rather than asserting something works; a fix must also be validated against the real deployed environment (e.g. simulate the serverless host locally), not only the local dev machine. Confidence: 0.8
- For landing/marketing pages, prioritizes conversion and clarity-first messaging validated by a "stranger test" over visual embellishment; prefers a short page with sharp copy over a long one padded with unnecessary sections. Confidence: 0.8
- Prefers iterative self-critique over shipping the first acceptable version. Confidence: 0.7
- Reports problems as terse symptom statements (e.g. "i cannot signin or signup", or pasting an error string verbatim with no context) and expects the agent to diagnose the root cause itself — reproducing the failure first rather than asking for steps or guessing. Confidence: 0.75
- Wants root causes addressed, not symptoms: when a reported failure has multiple contributing bugs, expects all of them fixed and each called out. Confidence: 0.6
