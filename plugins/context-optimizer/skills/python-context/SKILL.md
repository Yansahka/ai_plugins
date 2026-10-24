---
name: python-context
description: Produce a compact map of Python API or web projects using AST signatures, model fields, decorators and Django urlpatterns, without changing source files.
---

# Python context

Use the [snapshot workflow](../optimize-context/SKILL.md) with `--skill python`. The helper requires Python 3.9+ and parses source with ast; it never imports target modules. Keep imports, decorators, function signatures, class bases, model fields and Django urlpatterns. Omit function bodies and ordinary global values. Caches, virtual environments and local databases are excluded by the scanner.

For business logic changes, put the affected project-relative files in `--focus`; otherwise the agent cannot reconstruct hidden function bodies. Routes registered dynamically or with imperative Flask/FastAPI calls may require original source. Nested models/metadata can still contain substantial definitions. If parsing fails or Python is unavailable, report the error rather than claiming a complete map.
