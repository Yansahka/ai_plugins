---
name: microsoft-context
description: Compress local Canvas YAML, Power Fx, Power Automate JSON or Microsoft deployment configuration into a read-only context snapshot. Also use when the user requests such a snapshot from an open Canvas Authoring session.
---

# Microsoft context

Use the common [snapshot workflow](../optimize-context/SKILL.md) with `--skill microsoft` and optional `--select` for exact control names.

For a live Canvas app, use the available Canvas Authoring connector: connect to the user-provided app and sync only into a fresh empty directory dedicated to that capture. Keep output in a sibling directory. If the connector is unavailable, ask for an exported YAML folder; do not substitute mock app code or install/configure unrelated services. Coauthoring and authentication may require user action. Never call `compile_canvas` or write back to Studio for context extraction.

`_EditorState.pa.yaml` is excluded explicitly; control names and types remain even when their retained properties are empty. App initialization and named formulas remain. The selection conservatively includes ancestors, descendants of explicit selections, and textual dependencies across captured YAML files; it is not a Power Fx type checker.

Power Fx compaction preserves strings, quoted identifiers and locale separators. Geometry, colors and other presentation properties are omitted, including dynamic presentation formulas. For a layout task, retrieve those original properties. Canvas custom component definitions outside ordinary Properties/Children trees may require source re-reading.

Flow extraction retains triggers, action inputs, expressions, runAfter, branches and retry settings while stripping action designer metadata. Business fields named metadata under action inputs remain. PowerShell and Bicep are kept verbatim. No .msapp unpacker or automatic remote connection is built into the CLI. Data schemas returned by separate tools are not inferred from YAML or counted in its token baseline; report them separately if requested.
