# Project Rules & Strict Operational Constraints

Follow these rules strictly on every prompt and task. Do NOT do the following unless explicitly asked:

## GENERAL
- Do not rewrite, refactor, or regenerate any file/component that isn't directly related to the task asked for. Touch only what's necessary.
- Do not change the tech stack, libraries, folder structure, or naming conventions as a "side effect" of a fix.
- Do not remove existing code, comments, or props just because they look unused — check first, confirm with the user if unsure.
- Do not silently change default values, spacing units, breakpoints, or color variables used elsewhere in the app.

## UI
- Do not change existing color palette, typography, border-radius, spacing scale, or shadow styles unless that is the specific task.
- Do not swap out icons, illustrations, or existing image assets.
- Do not resize, reposition, or restyle components that are not part of the current request.
- Do not change button styles, form field styles, or card layouts globally when only one screen needs a fix.
- Do not introduce a new design pattern (e.g. new type of card, new nav style) without matching the existing design system.

## UX
- Do not change navigation flow, routing structure, or the order of steps in any flow (onboarding, checkout, forms, etc.) without approval.
- Do not add, remove, or reorder menu items, tabs, or buttons unless asked.
- Do not change form validation behavior, required fields, or error messaging logic as a side effect.
- Do not alter permission prompts, confirmation dialogs, or destructive-action warnings.

## ANIMATIONS
- Do not remove existing animations/transitions when fixing unrelated bugs.
- Do not add new animations, transitions, or motion effects unless requested.
- Do not change animation timing, easing, or duration on components not part of the task.
- Do not make animations block user interaction (e.g. disabling buttons during a purely decorative animation) unless that is the intended behavior.

## LOADERS / STATES
- Do not remove or alter loading states, skeleton screens, or spinners already implemented.
- Do not change empty-state, error-state, or success-state UI unless directly relevant to the fix.
- Do not introduce new loading patterns inconsistent with what's already used elsewhere in the app.
- Ensure loaders still trigger correctly after any data-fetching or API logic change — test this explicitly.

## PAGES / SECTIONS
- Do not delete, merge, or restructure existing pages/sections unless explicitly instructed.
- Do not change page titles, meta tags, SEO data, or section headings as a side effect.
- Do not alter responsive/mobile layout behavior on pages not related to the current fix.
- Do not break existing scroll behavior, sticky headers/footers, or section anchors.

## BEFORE YOU FINISH
- List every file you changed and exactly why.
- Confirm nothing outside the scope of the request was modified.
- If a fix requires touching a shared component that affects other pages, warn the user BEFORE making the change, not after.
- If unsure whether a change is in scope, ask the user instead of assuming.

## Priority Order for Every Change:
1. Don't break what already works.
2. Fix only what was asked for.
3. Keep visual and behavioral consistency with the rest of the app.
