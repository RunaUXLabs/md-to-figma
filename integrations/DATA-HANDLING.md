# Data handling

MD to Figma Assistant 0.1.1 contains Markdown instructions, reference files and an optional local Node.js checker. It defines no remote MCP server, authentication flow, network request, telemetry endpoint or lifecycle hook.

The checker reads the file path supplied to it and writes a JSON report to standard output. It does not upload documents or edit the source file. It checks document structure, not the state of a Figma file.

Documents attached to an AI conversation are handled by that AI provider under the user's account settings and provider policies. This package does not change those policies or promise that the host AI runs locally. Users should use an AI environment approved for their design data.

Figma import and export are performed separately by the existing MD to Figma plugin at the user's direction. This document describes this assistant package; it is not a claim about third-party services or their policies.

Project and support: https://github.com/RunaUXLabs/md-to-figma/issues
