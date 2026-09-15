# Code quality & performance

- Will not trade engineering quality for visual polish; expects production-quality code with sound architecture, maintainability, reusability, accessibility, responsive behavior, and proper error handling. Confidence: 0.8
- Cares that the product feels fast; avoid visually complex effects that meaningfully hurt performance, bundle size, or loading behavior. Confidence: 0.75
- Expects functionality to be preserved unless there is a strong UX reason to change it, even during large redesigns. Confidence: 0.7
- Prefers standard, self-contained implementations over third-party service dependencies when the dependency isn't earning its keep (e.g. chose built-in email/password auth over a hosted provider like Clerk). Confidence: 0.6
- Dislikes silent failures: user-facing errors should surface a specific, actionable message that names the fix (e.g. "run npm run db:migrate") rather than hanging, showing nothing, or saying "something went wrong". A single generic message for every failure is not enough — the message must identify the class of problem (missing tables, stale schema, unopenable/locked file, rejected credentials, unreachable server) while the full error stays in the server log, and an unrecognized error should say so plainly instead of inventing a cause. Confidence: 0.7
- Favors fail-closed, graceful degradation on security-sensitive paths — e.g. an unverifiable session should resolve to signed-out rather than throwing and taking down the page. Confidence: 0.65
- Values first-run / fresh-clone robustness: setup steps should work out of the box (self-creating needed directories) instead of requiring manual platform-specific commands. Confidence: 0.6
