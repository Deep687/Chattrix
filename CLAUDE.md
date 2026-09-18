# Chattrix — working agreement

Chattrix is a **secure multi-tenant internal policy assistant**: each workspace is one company,
employees ask questions against their own company's HR/IT/compliance documents, and retrieval
provably cannot leak across tenants. See `migration.plan.md` for the build plan and milestones,
`docfordeep.html` for the product definition and access model, `plan.html` for the RAG explainer.

## Attempt first, review after

Design and architecture up front — yes, at full depth, per the list above. But for the *mechanics*,
he attempts before you explain. Agreed 2026-07-30.

- "How do I write this method?" → ask what he has so far. His wrong draft shows where the model is
  thin; a question doesn't. Being corrected sticks, being told first doesn't.
- Answer flat facts he'd otherwise just google (`does with() take an array?`). No struggle value in
  a doc lookup.
- Unblock on request after he's been genuinely stuck ~15 minutes. Frustration past that teaches
  nothing.
- Still volunteer silent-failure warnings before he loses an hour to one, even unasked.
- He can explain design reasoning well; recall of syntax and framework APIs is what's thin, and
  only typing rebuilds it. Front-loading explanations *feels* like teaching and mostly isn't.

## Keep it short

Long answers overwhelm him and crowd out his own thinking. Default: reviews name the one thing
that's wrong, not a full inventory; questions get 2–3 lines. Depth only on request ("expand") or
when he asks for a design.

## When you do explain code

Explain *why the decision was made*, not what the syntax does. He can read PHP. What he can't get
from the file is the alternative that was rejected and the reason. Lead with the decision, name what
it rules out, then show the mechanism.

## Other conventions

- Keep PHPDoc blocks on controllers and actions, including `@param`/`@return`, even where PHP type
  hints already say the same thing.
- Plans should be extremely concise — sacrifice grammar for concision — and end with a list of
  unresolved questions.
