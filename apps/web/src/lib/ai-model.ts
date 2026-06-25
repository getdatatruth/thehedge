// Central Claude model id. Never hardcode a dated, soon-to-be-retired version
// in feature code: import from here so one change updates every call site.
// Override per environment with the CLAUDE_MODEL env var.
//
// Current default: Sonnet 4.6 (fast, capable, good value for insight/suggest
// and content generation). Swap to a heavier model via CLAUDE_MODEL if needed.
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
