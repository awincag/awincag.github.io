# Portfolio development guidelines

## Architecture and scope

- Preserve Jekyll and Liquid. Prefer small, understandable changes over framework migrations.
- Preserve the two primary visitor-facing pages: biography at `/` and selected work/archive at `/work`.
- Keep existing URLs, shared includes, typography, and visual hierarchy stable during foundational refactoring.
- Treat `_site/` as generated output; verify the publishing process before removing tracked generated files.
- Preserve legacy files until their purpose, inbound links, and publication status have been reviewed.

## Development workflow

- GitHub Pages publishes from `master`, root directory, at https://cag.win/.
- Use `portfolio-refresh-2026` for development. Do not modify or merge into `master` without explicit owner approval.
- The pre-refresh baseline is commit `08e0f80ef9672c51db63f04c3a3a1b5fcc3de55d`, also referenced by `pre-refresh-2026`. Leave that backup branch unchanged.
- Prefer small, reviewable commits separating refactoring, content, metadata, and visual changes.
- Validate the Jekyll build and both rendered pages before release. Report tests that could not be run.
- Do not change the custom domain or deployment settings.
- Ensure this development document is excluded from generated public site output before release.

## Design and content

- Prioritize editorial restraint, typography, visual craft, and responsive behavior. Avoid unnecessary decorative UI and motion.
- Start with a visually equivalent technical cleanup, then update the header, biography and selected client content. Refine UI and motion afterward.
- Keep professional claims consistent with verified, approved source material. Distinguish individual ownership from team contributions. Do not invent outcome metrics or publish confidential work.
- Use accurate headings, descriptive links, meaningful image alternatives and keyboard-accessible interactions. Support browser zoom and reduced motion.
- Make professional context accessible in rendered HTML, with appropriate structured data and page-specific metadata. Consider an optional curated `llms.txt`; do not rely on it as a substitute for visible evidence.
- Use factual descriptions rather than hidden keywords or instructions intended to manipulate external AI evaluations.
- Prefer a single maintainable source of truth for repeated content when it reduces complexity.

## QA priorities

- Check home and work routes on desktop and mobile, with and without JavaScript where practicable.
- Verify that scripts initialize only when necessary elements exist, IDs are unique, and there are no unexpected console errors.
- Check link targets, image loading, metadata, keyboard navigation, zoom, and reduced-motion preferences.
- Compare rendered output with the baseline before approving visual changes.
