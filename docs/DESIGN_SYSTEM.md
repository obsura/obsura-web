# Obsura Web Design System

This document defines the current design system baseline for reusable, scalable UI work.

## Goals

- Make UI building fast with reusable primitives.
- Preserve a distinct brand identity for a "redaction studio" product direction.
- Support both light and dark themes from shared tokens.
- Reduce style drift across features.

## Brand Direction

- Personality: precise, trustworthy, modern, technical.
- Primary hue family: stone + indigo.
- Surface model: soft bordered cards with gentle elevation.
- Typography:
  - Sans: Inter
  - Mono: JetBrains Mono

## Token Architecture

Tokens are defined in src/index.css as CSS variables for both :root and .dark.

### Core Tokens

- Brand
  - --brand-primary
  - --brand-primary-strong
  - --brand-accent
- Surfaces
  - --bg-canvas
  - --bg-elevated
  - --bg-surface
  - --bg-subtle
- Borders
  - --line-subtle
  - --line-strong
- Text
  - --text-primary
  - --text-secondary
  - --text-muted
- Interaction
  - --focus-ring
- Effects
  - gentle shadow scale via utility classes

## Reusable Primitives

Defined in src/components/common/UI.tsx:

- Button
  - variants: primary, secondary, outline, ghost, danger
  - sizes: sm, md, lg, icon
  - loading state included
- Card
  - semantic surface container using tokenized styles
- Badge
  - variants for status and labels
- ThemeToggleButton
  - reusable icon button for dark/light switching
- FieldLabel
  - shared label primitive for inputs
- Input
  - base text field style with focus ring
- Textarea
  - base multiline field style with focus ring
- Select
  - base dropdown style with focus ring
- Checkbox
  - shared checkbox primitive for option controls

## Theme System

- Theme state is stored in local storage key: obsura_theme.
- App sets/removes the dark class on documentElement.
- Header provides user theme toggle.

## Migration Guidance

Some existing components still use older utility color classes.
A compatibility bridge is included in src/index.css for dark mode consistency
while migration to primitives continues.

For new work:

1. Prefer semantic tokens over hardcoded color utilities.
2. Prefer reusable primitives from common/UI.tsx.
3. Use text-primary, text-secondary, and text-muted semantics.
4. Use surface or Card for container backgrounds.

## Contribution Rules for UI Work

- Build reusable components before one-off styling.
- Add or update token docs when introducing visual semantics.
- Validate light and dark themes before opening PR.
- Keep accessibility visible: focus ring, contrast, and keyboard support.
