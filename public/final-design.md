## Overview


Notion is a high-utility productivity workspace characterized by a clean, minimalist 'digital paper' aesthetic. Its interface relies on subtle elevation, a neutral color palette of grays and off-whites, and a strict typographic hierarchy to organize complex information without visual clutter.


## Key Characteristics


- Dual-surface architecture: Bright white document canvas (`--color-white`) against a soft off-white sidebar (`--color-white-2`).
- Signature 'Shadow-Border' treatment: Elevation is achieved using multi-layered shadows combined with a faint 1px orange-tinted stroke (`rgba(42, 28, 0, 0.07)`).
- High-density typography: Extensive use of `--font-size-sm` (13px) and `--font-size-lg` (14px) for UI controls, providing a professional tool-like feel.
- Pill-shaped utility buttons: Floating actions use `--radius-full` (999px) to stand out from the square-radius (`6px`) page content.
- Muted tertiary information: Use of `--color-mid-gray` (#8E8B86) for icons and metadata ensures they don't compete with content.
- Monochromatic hierarchy: A spectrum of nine grays (from `--color-light-gray` to `--color-dark-gray-2`) defines the entire interface structure without needing brand colors.


## Semantic Colors


| Role | Token | Value |
| --- | --- | --- |
| Page Canvas | --color-white | #FFFFFF |
| Sidebar Background | --color-white-2 | #F9F8F7 |
| Primary Text | --color-dark-gray-2 | #2C2C2B |
| Secondary Text | --color-dark-gray | #5F5E59 |
| Tertiary/UI Text | --color-mid-gray | #8E8B86 |
| Action/Link Color | --color-blue | #2783DE |
| Sidebar Border | --color-light-gray-2 | #F0EFED |
| Subtle Shadow Stroke | --color-dark-orange | rgba(42, 28, 0, 0.07) |


## Typography Hierarchy


| Token | Size | Font | Use |
| --- | --- | --- | --- |
| H1 | 40px | ui-sans-serif | Main page title, bold (700) |
| --font-size-xl | 16px | ui-sans-serif | Main body text and sidebar headers |
| --font-size-lg | 14px | ui-sans-serif | UI labels, breadcrumbs, and button text |
| --font-size-sm | 13px | ui-sans-serif | Supporting metadata and property labels |
| --font-size-2xs | 11px | ui-sans-serif | Micro-badges and utility text |


---


# New page | Notion — Design System (Denoised Tokens)

**Source:** https://app.notion.com/p/3b812b9662fb80ae81a7d3f40f6d27ed  
**Generated:** 8/10/2026, 11:24:08 PM  
**Extracted:** 17 colors · 17 type tokens · 17 spacing steps · 4 breakpoints · 12 motion tokens

> This document was auto-extracted by Webmimic from **denoised** raw design tokens.
> It contains design tokens for colors, typography, spacing, borders, elevation, motion, breakpoints, and more — in both human-readable
> tables and machine-readable CSS/JSON formats compatible with Figma Tokens and Style Dictionary.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Borders](#borders)
5. [Elevation — Shadows](#elevation--shadows)
6. [Motion](#motion)
7. [Z-Index](#z-index)
8. [Breakpoints](#breakpoints)
9. [Opacity](#opacity)
10. [Accessibility — Contrast Ratios](#accessibility--contrast-ratios)
11. [CSS Custom Properties (from :root)](#css-custom-properties-from-root)
12. [Design Tokens (CSS Variables)](#design-tokens-css-variables)
13. [Machine-Readable Tokens — DTCG JSON](#machine-readable-tokens--dtcg-json)

---

## Color Palette

### Background Colors

| Token | Value | HSL | Usage |
| --- | --- | --- | --- |
| `--color-white` | `#FFFFFF` | hsl(0, 0%, 100%) | ×23 |
| `--color-dark-orange` | `rgba(42, 28, 0, 0.07)` | hsl(39, 100%, 8%) | ×6 |
| `--color-white-2` | `#F9F8F7` | hsl(30, 14%, 97%) | ×3 |
| `--color-blue` | `#2783DE` | hsl(210, 73%, 51%) | ×2 |
| `--color-dark-red` | `rgba(33, 27, 23, 0.05)` | hsl(0, 32%, 12%) | ×2 |

### Text Colors

| Token | Value | HSL | Usage |
| --- | --- | --- | --- |
| `--color-dark-gray` | `#5F5E59` | hsl(50, 3%, 36%) | ×715 |
| `--color-dark-gray-2` | `#2C2C2B` | hsl(60, 1%, 17%) | ×441 |
| `--color-black` | `#000000` | hsl(0, 0%, 0%) | ×344 |
| `--color-mid-gray` | `#8E8B86` | hsl(37, 3%, 54%) | ×305 |
| `--color-mid-gray-2` | `#7D7A75` | hsl(38, 3%, 47%) | ×76 |
| `--color-mid-gray-3` | `#A19E99` | hsl(38, 4%, 62%) | ×42 |
| `--color-mid-gray-4` | `#ADA9A3` | hsl(36, 6%, 66%) | ×40 |
| `--color-dark-gray-3` | `#383836` | hsl(60, 2%, 22%) | ×27 |
| `--color-light-gray` | `#BCBAB6` | hsl(40, 4%, 73%) | ×18 |

### Border Colors

_None detected._

### Shadow Colors

| Token | Value | HSL | Usage |
| --- | --- | --- | --- |
| `--color-dark-gray-4` | `rgba(25, 25, 25, 0.05)` | hsl(0, 0%, 8%) | ×2 |
| `--color-light-gray-2` | `#F0EFED` | hsl(40, 9%, 94%) | ×1 |

### Fill & Gradient Colors

| Token | Value | HSL | Usage |
| --- | --- | --- | --- |
| `--color-mid-gray-5` | `#91918E` | hsl(60, 1%, 56%) | ×29 |

**Page canvas (body/html):** `#FFFFFF`

---

## Typography

### Font Families (brand)

| Token | Family |
| --- | --- |
| `--font-family-base` | `sans-serif` |
| `--font-family-2` | `ui-sans-serif` |

### Type Scale

| Token | Size | Role |
| --- | --- | --- |
| `--font-size-2xs` | `11px` |  |
| `--font-size-xs` | `12px` |  |
| `--font-size-sm` | `13px` |  |
| `--font-size-lg` | `14px` |  |
| `--font-size-xl` | `16px` |  |

### Font Weights

| Token | Weight |
| --- | --- |
| `--font-weight-regular` | `400` |
| `--font-weight-medium` | `500` |

### Line Heights

| Token | Value |
| --- | --- |
| `--line-height-tight` | `12px` |
| `--line-height-snug` | `13.431px` |
| `--line-height-normal` | `14.4px` |
| `--line-height-relaxed` | `16.8px` |
| `--line-height-loose` | `18px` |
| `--line-height-lh-6` | `20px` |
| `--line-height-lh-7` | `21px` |
| `--line-height-lh-8` | `24px` |

### Letter Spacing

_None detected._

---

## Spacing

| Token | Value | Usage |
| --- | --- | --- |
| `--space-1` | `1px` | ×66 |
| `--space-2` | `2px` | ×36 |
| `--space-3` | `3px` | ×7 |
| `--space-4` | `4px` | ×63 |
| `--space-5` | `5px` | ×26 |
| `--space-6` | `6px` | ×52 |
| `--space-8` | `8px` | ×106 |
| `--space-10` | `10px` | ×5 |
| `--space-12` | `12px` | ×17 |
| `--space-16` | `16px` | ×8 |
| `--space-24` | `24px` | ×1 |
| `--space-50` | `50px` | ×1 |
| `--space-80` | `80px` | ×1 |
| `--space-102` | `102px` | ×1 |
| `--space-120` | `120px` | ×1 |
| `--space-121` | `121px` | ×1 |
| `--space-191` | `191px` | ×1 |

---

## Borders

### Border Widths

| Token | Value | Usage |
| --- | --- | --- |
| `--border-width-hairline` | `1px` | ×5 |
| `--border-width-thin` | `2px` | ×4 |

### Border Radii

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `0px 8px 8px 0px` | ×2 |
| `--radius-lg` | `4px` | ×59 |
| `--radius-xl` | `6px` | ×53 |
| `--radius-2xl` | `16px` | ×1 |
| `--radius-full` | `9999px` | ×15 |

---

## Elevation — Shadows

| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-sm` | `rgba(25, 25, 25, 0.027) 0px 8px 12px 0px, rgba(25, 25, 25, 0.027) 0px 2px 6px 0px, rgba(42, 28, 0, 0.07) 0px 0px 0px 1px` | ×3 |
| `--shadow-md` | `rgba(25, 25, 25, 0.05) 0px 20px 24px 0px, rgba(25, 25, 25, 0.027) 0px 5px 8px 0px, rgba(42, 28, 0, 0.07) 0px 0px 0px 1px` | ×2 |
| `--shadow-lg` | `rgb(240, 239, 237) -1px 0px 0px 0px inset` | ×1 |

---

## Motion

### Durations

| Token | Value | Usage |
| --- | --- | --- |
| `--duration-instant` | `0.02s` | ×42 |
| `--duration-fast` | `0.1s` | ×21 |
| `--duration-normal` | `0.15s` | ×4 |
| `--duration-slow` | `0.16s` | ×5 |
| `--duration-slower` | `0.2s` | ×37 |
| `--duration-duration-6` | `0.25s` | ×1 |
| `--duration-duration-7` | `0.3s` | ×1 |
| `--duration-duration-8` | `0.7s` | ×6 |

### Easing Functions

| Token | Value | Usage |
| --- | --- | --- |
| `--easing-ease-in` | `ease-in` | ×42 |
| `--easing-ease-out` | `ease-out` | ×32 |
| `--easing-ease-in-out` | `ease-in-out` | ×15 |
| `--easing-linear` | `linear` | ×1 |

---

## Z-Index

| Token | Value |
| --- | --- |
| `--z-1` | `-1` |
| `--z-2` | `1` |
| `--z-3` | `2` |
| `--z-4` | `4` |
| `--z-5` | `9` |
| `--z-6` | `85` |
| `--z-7` | `89` |
| `--z-8` | `99` |
| `--z-9` | `100` |
| `--z-10` | `101` |
| `--z-11` | `109` |
| `--z-12` | `111` |
| `--z-13` | `999` |
| `--z-14` | `1000` |
| `--z-15` | `9999` |

---

## Breakpoints

| Token | Value |
| --- | --- |
| `--breakpoint-xs` | `768px` |
| `--breakpoint-sm` | `900px` |
| `--breakpoint-md` | `1020px` |
| `--breakpoint-lg` | `1123px` |

---

## Opacity

| Token | Value | Usage |
| --- | --- | --- |
| `--opacity-40` | `0.4` | ×1 |

---

## Accessibility — Contrast Ratios

Computed between the most-used text and background color pairs.
WCAG 2.1 thresholds: **AA** ≥ 4.5:1 (normal text), **AA Large** ≥ 3:1 (large/bold text), **AAA** ≥ 7:1.

| Text Token | Background Token | Ratio | WCAG Rating |
| --- | --- | --- | --- |
| `--color-dark-gray` | `--color-white` | 6.5:1 | AA |
| `--color-dark-gray` | `--color-dark-orange` | 2.55:1 | Fail |
| `--color-dark-gray` | `--color-white-2` | 6.13:1 | AA |
| `--color-dark-gray` | `--color-blue` | 1.67:1 | Fail |
| `--color-dark-gray` | `--color-dark-red` | 2.7:1 | Fail |
| `--color-dark-gray-2` | `--color-white` | 13.98:1 | AAA |
| `--color-dark-gray-2` | `--color-dark-orange` | 1.18:1 | Fail |
| `--color-dark-gray-2` | `--color-white-2` | 13.18:1 | AAA |
| `--color-dark-gray-2` | `--color-blue` | 3.59:1 | AA Large |
| `--color-dark-gray-2` | `--color-dark-red` | 1.26:1 | Fail |
| `--color-black` | `--color-white` | 21:1 | AAA |
| `--color-black` | `--color-dark-orange` | 1.27:1 | Fail |
| `--color-black` | `--color-white-2` | 19.8:1 | AAA |
| `--color-black` | `--color-blue` | 5.39:1 | AA |
| `--color-black` | `--color-dark-red` | 1.2:1 | Fail |
| `--color-mid-gray` | `--color-white` | 3.39:1 | AA Large |
| `--color-mid-gray` | `--color-dark-orange` | 4.88:1 | AA |
| `--color-mid-gray` | `--color-white-2` | 3.2:1 | AA Large |
| `--color-mid-gray` | `--color-blue` | 1.15:1 | Fail |
| `--color-mid-gray` | `--color-dark-red` | 5.17:1 | AA |
| `--color-mid-gray-2` | `--color-white` | 4.27:1 | AA Large |
| `--color-mid-gray-2` | `--color-dark-orange` | 3.87:1 | AA Large |
| `--color-mid-gray-2` | `--color-white-2` | 4.03:1 | AA Large |
| `--color-mid-gray-2` | `--color-blue` | 1.1:1 | Fail |
| `--color-mid-gray-2` | `--color-dark-red` | 4.11:1 | AA Large |

---

## CSS Custom Properties (from :root)

These are the custom properties already defined in the page's stylesheet(s). They represent the site's own token layer.

| Property | Value |
| --- | --- |
| `--lightningcss-light` | `initial` |
| `--lightningcss-dark` | `` |
| `--ca-palUiBlu50` | `rgba(35,131,226,.035)` |
| `--ca-palUiBlu75` | `rgba(35,131,226,.05)` |
| `--ca-palUiBlu100` | `rgba(35,131,226,.07)` |
| `--ca-palUiBlu200` | `rgba(35,131,226,.14)` |
| `--ca-palUiBlu300` | `rgba(35,131,226,.21)` |
| `--ca-palUiBlu400` | `rgba(35,131,226,.35)` |
| `--ca-palUiBlu500` | `rgba(35,131,226,.57)` |
| `--c-palUiBlu600` | `#2383e2` |
| `--c-palUiBlu700` | `#105fad` |
| `--cl-palPin30` | `rgba(231,147,188,.07)` |
| `--cd-palPin50` | `#fcf1f6` |
| `--cl-palPin100` | `rgba(225,136,179,.27)` |
| `--ca-palPin200` | `rgba(204,92,146,.4)` |
| `--cl-palPin300` | `rgba(209,91,148,.65)` |
| `--ca-palPin400` | `rgba(196,84,138,.82)` |
| `--cd-palPin500` | `#c14c8a` |
| `--cd-palPin600` | `#a2336f` |
| `--cd-palPin700` | `#6f3151` |
| `--c-palPin800` | `#4c2337` |
| `--c-palPin900` | `#2c1420` |
| `--cl-palPur30` | `rgba(206,175,229,.07)` |
| `--cd-palPur50` | `#f8f3fc` |
| `--cl-palPur100` | `rgba(168,129,197,.27)` |
| `--ca-palPur200` | `rgba(141,98,174,.4)` |
| `--cl-palPur300` | `rgba(154,114,185,.65)` |
| `--ca-palPur400` | `rgba(148,103,182,.82)` |
| `--cd-palPur500` | `#9065b0` |
| `--cd-palPur600` | `#754d92` |
| `--cd-palPur700` | `#5a3872` |
| `--c-palPur800` | `#412454` |
| `--c-palPur900` | `#26152e` |
| `--cl-palGre30` | `rgba(123,183,129,.07)` |
| `--cd-palGre50` | `#edf3ec` |
| `--cl-palGre100` | `rgba(123,183,129,.27)` |
| `--ca-palGre200` | `rgba(80,144,103,.4)` |
| `--cl-palGre300` | `rgba(80,144,103,.65)` |
| `--ca-palGre400` | `rgba(66,133,90,.82)` |
| `--cd-palGre500` | `#448361` |
| `--cd-palGre600` | `#33684e` |
| `--cd-palGre700` | `#1f4f3b` |
| `--c-palGre800` | `#1c3829` |
| `--c-palGre900` | `#102416` |
| `--c-palGra0` | `#fff` |
| `--cl-palGra30` | `rgba(84,72,49,.04)` |
| `--c-palGra50` | `#f8f8f7` |
| `--cl-palGra75` | `rgba(84,72,49,.08)` |
| `--cl-palGra90` | `rgba(227,226,224,.7)` |
| `--cl-palGra100` | `rgba(84,72,49,.15)` |
| `--cl-palGra200` | `rgba(81,73,60,.32)` |
| `--cl-palGra300` | `rgba(70,68,64,.45)` |
| `--cl-palGra400` | `rgba(71,70,68,.6)` |
| `--c-palGra500` | `#73726e` |
| `--c-palGra600` | `#5f5e5b` |
| `--c-palGra700` | `#484743` |
| `--c-palGra800` | `#32302c` |
| `--c-palGra900` | `#1d1b16` |
| `--cl-palTraGra30` | `rgba(0,0,0,.01)` |
| `--cl-palTraGra50` | `rgba(0,0,0,.04)` |
| `--ca-palTraGra75` | `rgba(0,0,0,.05)` |
| `--ca-palTraGra100` | `rgba(0,0,0,.06)` |
| `--ca-palTraGra200` | `rgba(0,0,0,.07)` |
| `--ca-palTraGra300` | `rgba(0,0,0,.11)` |
| `--ca-palTraGra400` | `rgba(0,0,0,.157)` |
| `--ca-palTraGra500` | `rgba(0,0,0,.333)` |
| `--ca-palTraGra600` | `rgba(0,0,0,.46)` |
| `--ca-palTraGra700` | `rgba(0,0,0,.62)` |
| `--ca-palTraGra800` | `rgba(0,0,0,.816)` |
| `--ca-palTraGra850` | `rgba(0,0,0,.89)` |
| `--ca-palTraGra900` | `rgba(0,0,0,.99)` |
| `--cl-palOra30` | `rgba(224,124,57,.07)` |
| `--cd-palOra50` | `#fbecdd` |
| `--cl-palOra100` | `rgba(224,124,57,.27)` |
| `--ca-palOra200` | `rgba(217,95,13,.4)` |
| `--cl-palOra300` | `rgba(217,95,13,.65)` |
| `--ca-palOra400` | `rgba(217,95,13,.82)` |
| `--cd-palOra500` | `#d9730d` |
| `--cd-palOra600` | `#8d4e17` |
| `--cd-palOra700` | `#6a3b12` |
| `--c-palOra800` | `#49290e` |
| `--c-palOra900` | `#281809` |
| `--cl-palBro30` | `rgba(210,162,141,.07)` |
| `--cd-palBro50` | `#f4eeee` |
| `--cl-palBro100` | `rgba(210,162,141,.35)` |
| `--ca-palBro200` | `rgba(156,76,40,.32)` |
| `--cl-palBro300` | `rgba(156,76,40,.5)` |
| `--ca-palBro400` | `rgba(156,76,40,.68)` |
| `--cd-palBro500` | `#9f6b53` |
| `--cd-palBro600` | `#80543f` |
| `--cd-palBro700` | `#613e2e` |
| `--c-palBro800` | `#442a1e` |
| `--c-palBro900` | `#2d1506` |
| `--cl-palRed30` | `rgba(243,136,118,.07)` |
| `--cd-palRed50` | `#fdebec` |
| `--cl-palRed100` | `rgba(244,171,159,.4)` |
| `--ca-palRed200` | `rgba(215,38,21,.32)` |
| `--cl-palRed300` | `rgba(215,38,21,.5)` |
| `--ca-palRed400` | `rgba(215,38,21,.68)` |
| `--cd-palRed500` | `#cd3c3a` |
| `--cd-palRed600` | `#ae2f2e` |
| `--cd-palRed700` | `#862120` |
| `--c-palRed800` | `#5d1715` |
| `--c-palRed900` | `#30130f` |
| `--cl-palYel30` | `rgba(215,177,24,.07)` |
| `--cd-palYel50` | `#fbf3db` |
| `--cl-palYel100` | `rgba(236,191,66,.39)` |
| `--ca-palYel200` | `rgba(229,175,25,.55)` |
| `--cl-palYel300` | `rgba(215,150,9,.75)` |
| `--ca-palYel400` | `rgba(192,125,0,.82)` |
| `--cd-palYel500` | `#cb912f` |
| `--cd-palYel600` | `#835e33` |
| `--cd-palYel700` | `#5f4023` |
| `--c-palYel800` | `#402c1b` |
| `--c-palYel900` | `#251910` |
| `--cl-palBlu30` | `rgba(91,166,209,.07)` |
| `--cd-palBlu50` | `#e7f3f8` |
| `--cl-palBlu100` | `rgba(93,165,206,.27)` |
| `--ca-palBlu200` | `rgba(57,135,184,.4)` |
| `--cl-palBlu300` | `rgba(63,137,184,.65)` |
| `--ca-palBlu400` | `rgba(54,129,177,.82)` |
| `--cd-palBlu500` | `#337ea9` |
| `--cd-palBlu600` | `#2d6387` |
| `--cd-palBlu700` | `#1f4a68` |
| `--c-palBlu800` | `#183347` |
| `--c-palBlu900` | `#0c1d2b` |
| `--ca-palPagGla0` | `rgba(255,255,255,.8)` |
| `--ca-palWasGla0` | `rgba(249,249,248,.8)` |
| `--c-bluTexPri` | `#264a72` |
| `--c-bluTexSec` | `#387dc9` |
| `--c-bluTexTer` | `#83abe1` |
| `--c-bluTexDis` | `#9dc0ea` |
| `--c-bluTexAccPri` | `#2783de` |
| `--c-bluTexInvPri` | `#f3f9fd` |
| `--c-bluTexInvSec` | `#b6d4f3` |
| `--ca-bluTexDisTra` | `rgba(0,91,200,.384)` |
| `--c-bluIcoPri` | `#264a72` |
| `--c-bluIcoSec` | `#387dc9` |
| `--c-bluIcoTer` | `#83abe1` |
| `--c-bluIcoDis` | `#9dc0ea` |
| `--c-bluIcoAccPri` | `#2783de` |
| `--c-bluIcoInvPri` | `#f3f9fd` |
| `--c-bluIcoInvSec` | `#b6d4f3` |
| `--c-bluBorPri` | `#cee3f7` |
| `--c-bluBorSec` | `#e5f2fc` |
| `--c-bluBorInvPri` | `#355f8b` |
| `--c-bluBorAccPri` | `#2783de` |
| `--c-bluBorStr` | `#b6d4f3` |
| `--ca-bluBorPriTra` | `rgba(0,118,217,.204)` |
| `--ca-bluBorSecTra` | `rgba(0,124,215,.094)` |
| `--ca-bluBorStrTra` | `rgba(0,112,219,.286)` |
| `--c-bluBacPri` | `#f3f9fd` |
| `--c-bluBacSec` | `#e5f2fc` |
| `--c-bluBacTer` | `#cee3f7` |
| `--c-bluBacEle` | `#fff` |
| `--c-bluBacAccPri` | `#2783de` |
| `--c-bluBacAccSec` | `#5e9fe8` |
| `--ca-bluBacPriTra` | `rgba(0,128,213,.047)` |
| `--ca-bluBacSecTra` | `rgba(0,124,215,.094)` |
| `--ca-bluBacTerTra` | `rgba(0,118,217,.204)` |
| `--ca-bluBacIntTra` | `rgba(0,121,228,.075)` |
| `--c-bluBacInt` | `#ecf5fd` |
| `--c-broTexPri` | `#584437` |
| `--c-broTexSec` | `#9f765a` |
| `--c-broTexTer` | `#bca290` |
| `--c-broTexDis` | `#cfb8a8` |
| `--c-broTexAccPri` | `#b68965` |
| `--c-broTexInvPri` | `#faf8f6` |
| `--c-broTexInvSec` | `#e0cdc0` |
| `--ca-broTexDisTra` | `rgba(114,47,0,.34)` |
| `--c-broIcoPri` | `#584437` |
| `--c-broIcoSec` | `#9f765a` |
| `--c-broIcoTer` | `#bca290` |
| `--c-broIcoDis` | `#cfb8a8` |
| `--c-broIcoAccPri` | `#b68965` |
| `--c-broIcoInvPri` | `#faf8f6` |
| `--c-broIcoInvSec` | `#e0cdc0` |
| `--c-broBorPri` | `#ebdfd7` |
| `--c-broBorSec` | `#f5ede9` |
| `--c-broBorInvPri` | `#6d5340` |
| `--c-broBorAccPri` | `#b68965` |
| `--c-broBorStr` | `#e0cdc0` |
| `--ca-broBorPriTra` | `rgba(127,51,0,.157)` |
| `--ca-broBorSecTra` | `rgba(139,46,0,.086)` |
| `--ca-broBorStrTra` | `rgba(129,52,0,.247)` |
| `--c-broBacPri` | `#faf8f6` |
| `--c-broBacSec` | `#f5ede9` |
| `--c-broBacTer` | `#ebdfd7` |
| `--c-broBacEle` | `#fff` |
| `--c-broBacAccPri` | `#b68965` |
| `--c-broBacAccSec` | `#bd9576` |
| `--ca-broBacPriTra` | `rgba(115,59,3,.035)` |
| `--ca-broBacSecTra` | `rgba(139,46,0,.086)` |
| `--ca-broBacTerTra` | `rgba(127,51,0,.157)` |
| `--ca-broBacIntTra` | `rgba(119,34,0,.06)` |
| `--c-broBacInt` | `#f7f2f0` |
| `--c-graTexPri` | `#494846` |
| `--c-graTexSec` | `#7d7a75` |
| `--c-graTexTer` | `#ada9a3` |
| `--c-graTexDis` | `#bcbab6` |
| `--c-graTexAccPri` | `#8e8b86` |
| `--c-graTexInvPri` | `#f9f8f7` |
| `--c-graTexInvSec` | `#d4d3cf` |
| `--ca-graTexDisTra` | `rgba(21,14,0,.286)` |
| `--c-graIcoPri` | `#494846` |
| `--c-graIcoSec` | `#7d7a75` |
| `--c-graIcoTer` | `#ada9a3` |
| `--c-graIcoDis` | `#bcbab6` |
| `--c-graIcoAccPri` | `#8e8b86` |
| `--c-graIcoInvPri` | `#f9f8f7` |
| `--c-graIcoInvSec` | `#d4d3cf` |
| `--c-graBorPri` | `#e6e5e3` |
| `--c-graBorSec` | `#f0efed` |
| `--c-graBorInvPri` | `#5f5e59` |
| `--c-graBorAccPri` | `#8e8b86` |
| `--c-graBorStr` | `#d4d3cf` |
| `--ca-graBorPriTra` | `rgba(28,19,1,.11)` |
| `--ca-graBorSecTra` | `rgba(42,28,0,.07)` |
| `--ca-graBorStrTra` | `rgba(27,21,0,.19)` |
| `--c-graBacPri` | `#f9f8f7` |
| `--c-graBacSec` | `#f0efed` |
| `--c-graBacTer` | `#e6e5e3` |
| `--c-graBacEle` | `#fff` |
| `--c-graBacAccPri` | `#8e8b86` |
| `--c-graBacAccSec` | `#a19e99` |
| `--ca-graBacPriTra` | `rgba(66,35,3,.03)` |
| `--ca-graBacSecTra` | `rgba(42,28,0,.07)` |
| `--ca-graBacTerTra` | `rgba(28,19,1,.11)` |
| `--ca-graBacIntTra` | `rgba(33,27,23,.05)` |
| `--c-graBacInt` | `#f4f3f3` |
| `--c-greTexPri` | `#2a533c` |
| `--c-greTexSec` | `#50946e` |
| `--c-greTexTer` | `#8bb79d` |
| `--c-greTexDis` | `#a6c7b4` |
| `--c-greTexAccPri` | `#46a171` |
| `--c-greTexInvPri` | `#f6f9f7` |
| `--c-greTexInvSec` | `#bed9c9` |
| `--ca-greTexDisTra` | `rgba(0,95,40,.35)` |
| `--c-greIcoPri` | `#2a533c` |
| `--c-greIcoSec` | `#50946e` |
| `--c-greIcoTer` | `#8bb79d` |
| `--c-greIcoDis` | `#a6c7b4` |
| `--c-greIcoAccPri` | `#46a171` |
| `--c-greIcoInvPri` | `#f6f9f7` |
| `--c-greIcoInvSec` | `#bed9c9` |
| `--c-greBorPri` | `#d7e6dd` |
| `--c-greBorSec` | `#e8f1ec` |
| `--c-greBorInvPri` | `#37674c` |
| `--c-greBorAccPri` | `#46a171` |
| `--c-greBorStr` | `#bed9c9` |
| `--ca-greBorPriTra` | `rgba(0,96,38,.157)` |
| `--ca-greBorSecTra` | `rgba(0,100,45,.09)` |
| `--ca-greBorStrTra` | `rgba(0,106,43,.255)` |
| `--c-greBacPri` | `#f6f9f7` |
| `--c-greBacSec` | `#e8f1ec` |
| `--c-greBacTer` | `#d7e6dd` |
| `--c-greBacEle` | `#fff` |
| `--c-greBacAccPri` | `#46a171` |
| `--c-greBacAccSec` | `#72bc8f` |
| `--ca-greBacPriTra` | `rgba(3,87,31,.035)` |
| `--ca-greBacSecTra` | `rgba(0,100,45,.09)` |
| `--ca-greBacTerTra` | `rgba(0,96,38,.157)` |
| `--ca-greBacIntTra` | `rgba(0,96,32,.063)` |
| `--c-greBacInt` | `#eff5f1` |
| `--c-oraTexPri` | `#6a4222` |
| `--c-oraTexSec` | `#d27b2d` |
| `--c-oraTexTer` | `#cba27d` |
| `--c-oraTexDis` | `#dab798` |
| `--c-oraTexAccPri` | `#d5803b` |
| `--c-oraTexInvPri` | `#fcf7f4` |
| `--c-oraTexInvSec` | `#eaccb2` |
| `--ca-oraTexDisTra` | `rgba(163,77,0,.404)` |
| `--c-oraIcoPri` | `#6a4222` |
| `--c-oraIcoSec` | `#d27b2d` |
| `--c-oraIcoTer` | `#cba27d` |
| `--c-oraIcoDis` | `#dab798` |
| `--c-oraIcoAccPri` | `#d5803b` |
| `--c-oraIcoInvPri` | `#fcf7f4` |
| `--c-oraIcoInvSec` | `#eaccb2` |
| `--c-oraBorPri` | `#f3ddcb` |
| `--c-oraBorSec` | `#fbebde` |
| `--c-oraBorInvPri` | `#88522f` |
| `--c-oraBorAccPri` | `#d5803b` |
| `--c-oraBorStr` | `#eaccb2` |
| `--ca-oraBorPriTra` | `rgba(196,88,0,.204)` |
| `--ca-oraBorSecTra` | `rgba(224,101,1,.13)` |
| `--ca-oraBorStrTra` | `rgba(186,86,0,.3)` |
| `--c-oraBacPri` | `#fcf7f4` |
| `--c-oraBacSec` | `#fbebde` |
| `--c-oraBacTer` | `#f3ddcb` |
| `--c-oraBacEle` | `#fff` |
| `--c-oraBacAccPri` | `#d5803b` |
| `--c-oraBacAccSec` | `#de9255` |
| `--ca-oraBacPriTra` | `rgba(186,72,3,.043)` |
| `--ca-oraBacSecTra` | `rgba(224,101,1,.13)` |
| `--ca-oraBacTerTra` | `rgba(196,88,0,.204)` |
| `--ca-oraBacIntTra` | `rgba(233,100,0,.09)` |
| `--c-oraBacInt` | `#fdf1e8` |
| `--c-pinTexPri` | `#68354e` |
| `--c-pinTexSec` | `#c14c8a` |
| `--c-pinTexTer` | `#c897ad` |
| `--c-pinTexDis` | `#d8afc1` |
| `--c-pinTexAccPri` | `#db6999` |
| `--c-pinTexInvPri` | `#fcf7f9` |
| `--c-pinTexInvSec` | `#eac4d5` |
| `--ca-pinTexDisTra` | `rgba(131,0,57,.314)` |
| `--c-pinIcoPri` | `#68354e` |
| `--c-pinIcoSec` | `#c14c8a` |
| `--c-pinIcoTer` | `#c897ad` |
| `--c-pinIcoDis` | `#d8afc1` |
| `--c-pinIcoAccPri` | `#db6999` |
| `--c-pinIcoInvPri` | `#fcf7f9` |
| `--c-pinIcoInvSec` | `#eac4d5` |
| `--c-pinBorPri` | `#f4d8e4` |
| `--c-pinBorSec` | `#fae9f1` |
| `--c-pinBorInvPri` | `#7b4760` |
| `--c-pinBorAccPri` | `#db6999` |
| `--c-pinBorStr` | `#eac4d5` |
| `--ca-pinBorPriTra` | `rgba(183,0,78,.153)` |
| `--ca-pinBorSecTra` | `rgba(197,0,93,.086)` |
| `--ca-pinBorStrTra` | `rgba(164,0,73,.23)` |
| `--c-pinBacPri` | `#fcf7f9` |
| `--c-pinBacSec` | `#fae9f1` |
| `--c-pinBacTer` | `#f4d8e4` |
| `--c-pinBacEle` | `#fff` |
| `--c-pinBacAccPri` | `#db6999` |
| `--c-pinBacAccSec` | `#df84a8` |
| `--ca-pinBacPriTra` | `rgba(161,3,66,.03)` |
| `--ca-pinBacSecTra` | `rgba(197,0,93,.086)` |
| `--ca-pinBacTerTra` | `rgba(183,0,78,.153)` |
| `--ca-pinBacIntTra` | `rgba(191,0,96,.063)` |
| `--c-pinBacInt` | `#fbeff5` |
| `--c-purTexPri` | `#553b69` |
| `--c-purTexSec` | `#9a6bb4` |
| `--c-purTexTer` | `#b49cc6` |
| `--c-purTexDis` | `#c7b3d5` |
| `--c-purTexAccPri` | `#b577d6` |
| `--c-purTexInvPri` | `#faf7fc` |
| `--c-purTexInvSec` | `#dbc8e8` |
| `--ca-purTexDisTra` | `rgba(67,0,114,.298)` |
| `--c-purIcoPri` | `#553b69` |
| `--c-purIcoSec` | `#9a6bb4` |
| `--c-purIcoTer` | `#b49cc6` |
| `--c-purIcoDis` | `#c7b3d5` |
| `--c-purIcoAccPri` | `#b577d6` |
| `--c-purIcoInvPri` | `#faf7fc` |
| `--c-purIcoInvSec` | `#dbc8e8` |
| `--c-purBorPri` | `#e8dbf2` |
| `--c-purBorSec` | `#f3ebf9` |
| `--c-purBorInvPri` | `#674d7b` |
| `--c-purBorAccPri` | `#b577d6` |
| `--c-purBorStr` | `#dbc8e8` |
| `--ca-purBorPriTra` | `rgba(92,0,163,.14)` |
| `--ca-purBorSecTra` | `rgba(102,0,178,.08)` |
| `--ca-purBorStrTra` | `rgba(88,1,149,.216)` |
| `--c-purBacPri` | `#faf7fc` |
| `--c-purBacSec` | `#f3ebf9` |
| `--c-purBacTer` | `#e8dbf2` |
| `--c-purBacEle` | `#fff` |
| `--c-purBacAccPri` | `#b577d6` |
| `--c-purBacAccSec` | `#bf8eda` |
| `--ca-purBacPriTra` | `rgba(98,3,161,.03)` |
| `--ca-purBacSecTra` | `rgba(102,0,178,.08)` |
| `--ca-purBacTerTra` | `rgba(92,0,163,.14)` |
| `--ca-purBacIntTra` | `rgba(102,0,187,.06)` |
| `--c-purBacInt` | `#f6f0fb` |
| `--c-redTexPri` | `#6d3531` |
| `--c-redTexSec` | `#cf5148` |
| `--c-redTexTer` | `#d0988d` |
| `--c-redTexDis` | `#e0aea6` |
| `--c-redTexAccPri` | `#e56458` |
| `--c-redTexInvPri` | `#fdf6f6` |
| `--c-redTexInvSec` | `#f0c5be` |
| `--ca-redTexDisTra` | `rgba(166,23,0,.35)` |
| `--c-redIcoPri` | `#6d3531` |
| `--c-redIcoSec` | `#cf5148` |
| `--c-redIcoTer` | `#d0988d` |
| `--c-redIcoDis` | `#e0aea6` |
| `--c-redIcoAccPri` | `#e56458` |
| `--c-redIcoInvPri` | `#fdf6f6` |
| `--c-redIcoInvSec` | `#f0c5be` |
| `--c-redBorPri` | `#f7d9d5` |
| `--c-redBorSec` | `#fce9e7` |
| `--c-redBorInvPri` | `#924943` |
| `--c-redBorAccPri` | `#e56458` |
| `--c-redBorStr` | `#f0c5be` |
| `--ca-redBorPriTra` | `rgba(206,24,0,.165)` |
| `--ca-redBorSecTra` | `rgba(223,22,0,.094)` |
| `--ca-redBorStrTra` | `rgba(196,27,0,.255)` |
| `--c-redBacPri` | `#fdf6f6` |
| `--c-redBacSec` | `#fce9e7` |
| `--c-redBacTer` | `#f7d9d5` |
| `--c-redBacEle` | `#fff` |
| `--c-redBacAccPri` | `#e56458` |
| `--c-redBacAccSec` | `#e97366` |
| `--ca-redBacPriTra` | `rgba(199,3,3,.035)` |
| `--ca-redBacSecTra` | `rgba(223,22,0,.094)` |
| `--ca-redBacTerTra` | `rgba(206,24,0,.165)` |
| `--ca-redBacIntTra` | `rgba(223,16,0,.063)` |
| `--c-redBacInt` | `#fdf0ef` |
| `--c-teaTexPri` | `#18505b` |
| `--c-teaTexSec` | `#2c8b9e` |
| `--c-teaTexTer` | `#7eb6c2` |
| `--c-teaTexDis` | `#99c8d3` |
| `--c-teaTexAccPri` | `#37a4b4` |
| `--c-teaTexInvPri` | `#f3fafb` |
| `--c-teaTexInvSec` | `#b0dbe4` |
| `--ca-teaTexDisTra` | `rgba(0,118,145,.4)` |
| `--c-teaIcoPri` | `#18505b` |
| `--c-teaIcoSec` | `#2c8b9e` |
| `--c-teaIcoTer` | `#7eb6c2` |
| `--c-teaIcoDis` | `#99c8d3` |
| `--c-teaIcoAccPri` | `#37a4b4` |
| `--c-teaIcoInvPri` | `#f3fafb` |
| `--c-teaIcoInvSec` | `#b0dbe4` |
| `--c-teaBorPri` | `#cae9f0` |
| `--c-teaBorSec` | `#e0f3f7` |
| `--c-teaBorInvPri` | `#226471` |
| `--c-teaBorAccPri` | `#37a4b4` |
| `--c-teaBorStr` | `#b0dbe4` |
| `--ca-teaBorPriTra` | `rgba(0,149,183,.208)` |
| `--ca-teaBorSecTra` | `rgba(1,157,189,.12)` |
| `--ca-teaBorStrTra` | `rgba(0,139,168,.31)` |
| `--c-teaBacPri` | `#f3fafb` |
| `--c-teaBacSec` | `#e0f3f7` |
| `--c-teaBacTer` | `#cae9f0` |
| `--c-teaBacEle` | `#fff` |
| `--c-teaBacAccPri` | `#37a4b4` |
| `--c-teaBacAccSec` | `#4fb9c9` |
| `--ca-teaBacPriTra` | `rgba(3,150,171,.047)` |
| `--ca-teaBacSecTra` | `rgba(1,157,189,.12)` |
| `--ca-teaBacTerTra` | `rgba(0,149,183,.208)` |
| `--ca-teaBacIntTra` | `rgba(0,155,188,.09)` |
| `--c-teaBacInt` | `#e8f6f9` |
| `--c-yelTexPri` | `#655121` |
| `--c-yelTexSec` | `#cb9434` |
| `--c-yelTexTer` | `#d8c283` |
| `--c-yelTexDis` | `#e2ca88` |
| `--c-yelTexAccPri` | `#d8a32f` |
| `--c-yelTexInvPri` | `#fcfaef` |
| `--c-yelTexInvSec` | `#e8d497` |
| `--ca-yelTexDisTra` | `rgba(193,141,0,.467)` |
| `--c-yelIcoPri` | `#655121` |
| `--c-yelIcoSec` | `#cb9434` |
| `--c-yelIcoTer` | `#d8c283` |
| `--c-yelIcoDis` | `#e8d497` |
| `--c-yelIcoAccPri` | `#d8a32f` |
| `--c-yelIcoInvPri` | `#fcfaef` |
| `--c-yelIcoInvSec` | `#e8d497` |
| `--c-yelBorPri` | `#f2e3b7` |
| `--c-yelBorSec` | `#f9f3dc` |
| `--c-yelBorInvPri` | `#836426` |
| `--c-yelBorAccPri` | `#d8a32f` |
| `--c-yelBorStr` | `#e8d497` |
| `--ca-yelBorPriTra` | `rgba(209,156,0,.282)` |
| `--ca-yelBorSecTra` | `rgba(211,168,0,.137)` |
| `--ca-yelBorStrTra` | `rgba(199,150,0,.408)` |
| `--c-yelBacPri` | `#fcfaef` |
| `--c-yelBacSec` | `#f9f3dc` |
| `--c-yelBacTer` | `#f2e3b7` |
| `--c-yelBacEle` | `#fff` |
| `--c-yelBacAccPri` | `#d8a32f` |
| `--c-yelBacAccSec` | `#eac26b` |
| `--ca-yelBacPriTra` | `rgba(207,175,0,.063)` |
| `--ca-yelBacSecTra` | `rgba(211,168,0,.137)` |
| `--ca-yelBacTerTra` | `rgba(209,156,0,.282)` |
| `--ca-yelBacIntTra` | `rgba(235,163,0,.098)` |
| `--c-yelBacInt` | `#fdf6e6` |
| `--c-texPri` | `#2c2c2b` |
| `--c-texSec` | `#7d7a75` |
| `--c-texTer` | `#a19e99` |
| `--c-texDis` | `#bcbab6` |
| `--c-texAccPri` | `#5f5e59` |
| `--c-texInvPri` | `#f0efed` |
| `--c-texInvSec` | `#ada9a3` |
| `--ca-texDisTra` | `rgba(21,14,0,.286)` |
| `--c-icoPri` | `#383836` |
| `--c-icoSec` | `#8e8b86` |
| `--c-icoTer` | `#ada9a3` |
| `--c-icoDis` | `#bcbab6` |
| `--c-icoAccPri` | `#7d7a75` |
| `--c-icoInvPri` | `#f0efed` |
| `--c-icoInvSec` | `#ada9a3` |
| `--c-borPri` | `#e6e5e3` |
| `--c-borSec` | `#f0efed` |
| `--c-borInvPri` | `#5f5e59` |
| `--c-borAccPri` | `#8e8b86` |
| `--c-borStr` | `#d4d3cf` |
| `--ca-borPriTra` | `rgba(28,19,1,.11)` |
| `--ca-borSecTra` | `rgba(42,28,0,.07)` |
| `--ca-borStrTra` | `rgba(27,21,0,.19)` |
| `--c-bacPri` | `#fff` |
| `--c-bacSec` | `#f9f8f7` |
| `--c-bacTer` | `#f0efed` |
| `--c-bacEle` | `#fff` |
| `--c-bacAccPri` | `#2c2c2b` |
| `--c-bacAccSec` | `#a19e99` |
| `--ca-bacPriTra` | `rgba(255,255,255,0)` |
| `--ca-bacSecTra` | `rgba(66,35,3,.03)` |
| `--ca-bacTerTra` | `rgba(42,28,0,.07)` |
| `--ca-bacIntTra` | `rgba(33,27,23,.05)` |
| `--c-bacInt` | `#f4f3f3` |
| `--c-priBla` | `#000` |
| `--cl-pagTitPlaTexCol` | `rgba(55,53,47,.15)` |
| `--c-tabFroFilDivCol` | `#d5d4d2` |
| `--c-tabFroSelDivCol` | `#cad4e1` |
| `--cl-linDecCol` | `rgba(55,53,47,.25)` |
| `--ca-opaLinDecCol` | `rgba(55,53,47,.4)` |
| `--c-regEmoCol` | `#000` |
| `--c-sidSecCol` | `#91918e` |
| `--ca-sidIteSelBac` | `rgba(0,0,0,.03)` |
| `--ca-sidSecBac` | `rgba(0,0,0,.024)` |
| `--ca-conBacTra` | `rgba(255,255,255,0)` |
| `--ca-carConBacTra` | `rgba(255,255,255,0)` |
| `--ca-oveSmo` | `rgba(15,15,15,.6)` |
| `--c-calIteBac` | `#fff` |
| `--cl-calIteHovBac` | `rgba(84,72,49,.08)` |
| `--c-popBac` | `#fff` |
| `--ca-popWaxPapBac` | `rgba(255,255,255,.9)` |
| `--cd-boaIteDefBac` | `#fff` |
| `--cd-colGalPreCarBac` | `#fff` |
| `--ca-modUndBac` | `rgba(15,15,15,.6)` |
| `--c-beiBanBac` | `#fbf8f3` |
| `--c-darBanBac` | `#eae9e7` |
| `--c-keyDonBarBac` | `#f0f1f2` |
| `--c-keyActBarBac` | `#fff` |
| `--ca-UIUseAvaInnOut` | `rgba(255,255,255,.3)` |
| `--c-UIUseAvaIdlOut` | `#f1f1ef` |
| `--cl-susUIUseAvaBac` | `rgba(84,72,49,.08)` |
| `--cd-codBloBac` | `#f7f6f3` |
| `--c-codStiBloBac` | `#f7f6f3` |
| `--cd-tabHeaRowColBac` | `#f7f6f3` |
| `--cd-embPlaBac` | `#f2f1ee` |
| `--ca-tokInpMenIteBac` | `rgba(242,241,238,.6)` |
| `--cl-hovDisBac` | `rgba(55,53,47,.03)` |
| `--c-hovMarDisBac` | `#f9f9f8` |
| `--c-selMarDisBac` | `#fff` |
| `--ca-butHovBac` | `rgba(55,53,47,.06)` |
| `--ca-tabRowHovBac` | `rgba(55,53,47,.024)` |
| `--ca-outButHovBac` | `rgba(55,53,47,.06)` |
| `--cl-outButPreBac` | `rgba(55,53,47,.16)` |
| `--ca-butPreBac` | `rgba(55,53,47,.16)` |
| `--ca-butPreBacLig` | `rgba(55,53,47,.1)` |
| `--cl-carHovBac` | `rgba(55,53,47,.04)` |
| `--cl-carPreBac` | `rgba(55,53,47,.06)` |
| `--c-bluButHovBac` | `#0077d4` |
| `--c-bluButPreBac` | `#006bc7` |
| `--c-whi` | `#fff` |
| `--c-whiButBac` | `#fff` |
| `--c-assCorButBac` | `#fff` |
| `--c-assCorButBacHov` | `#efefee` |
| `--c-assCorButBacPre` | `#dfdfde` |
| `--ca-ligGraButHovBac` | `rgba(227,226,224,.7)` |
| `--ca-ligGraButPreBac` | `rgba(84,72,49,.15)` |
| `--c-butGroBac` | `#fff` |
| `--c-whiButHovBac` | `#efefee` |
| `--c-whiButPreBac` | `#dfdfde` |
| `--c-timBac` | `#fdfdfd` |
| `--c-peeTimBac` | `#fdfdfd` |
| `--cd-timDarBac` | `#f7f7f7` |
| `--c-topFav` | `#f6c050` |
| `--cl-homEmpStaPreJoiButBac` | `rgba(84,72,49,.04)` |
| `--cl-homEmpStaPreCalInd` | `rgba(84,72,49,.08)` |
| `--c-homScrButBacBas` | `#fff` |
| `--cl-homScrButBacPre` | `rgba(84,72,49,.08)` |
| `--ca-homTilBac` | `rgba(255,255,255,.9)` |
| `--ca-homCarCovPhoBas` | `rgba(84,72,49,.04)` |
| `--cd-homCarBacBas` | `#fff` |
| `--cd-homCarBacHov` | `#fff` |
| `--ca-homCarBacPre` | `rgba(84,72,49,.08)` |
| `--cd-homCarTemCarBacBas` | `#fff` |
| `--cd-homCarTemCarBacHov` | `#fff` |
| `--ca-homCarTemCarBacPre` | `rgba(0,0,0,.024)` |
| `--cl-perHomBacPho` | `rgba(84,72,49,.04)` |
| `--c-sitPagPreWinChrBar` | `#f5f5f5` |
| `--c-seoPreTit` | `#1d13a3` |
| `--c-sitBuiBac` | `#fcfcfc` |
| `--cl-sitInsSte` | `rgba(84,72,49,.08)` |
| `--cl-selLigGra30` | `rgba(249,249,245,.5)` |
| `--cl-selLigGra50` | `rgba(241,241,239,.5)` |
| `--cl-selLigGra100` | `rgba(227,226,224,.5)` |
| `--cl-selLigGra200` | `rgba(199,198,196,.5)` |
| `--cl-selLigGra300` | `rgba(172,171,169,.5)` |
| `--cl-selLigGra400` | `rgba(145,145,142,.5)` |
| `--cl-selLigGra500` | `rgba(120,119,116,.5)` |
| `--cl-selLigGra700` | `rgba(72,71,67,.5)` |
| `--ca-equTemPlaBac` | `rgba(35,131,226,.14)` |
| `--ca-finHigMatSelBac` | `rgba(255,205,56,.9)` |
| `--cl-finHigMatUnsBac` | `rgba(255,205,56,.4)` |
| `--ca-marStaDef` | `rgba(255,177,16,.3)` |
| `--c-marStaSel` | `#ffb110` |
| `--ca-pilBacYel` | `rgba(215,177,24,.07)` |
| `--ca-pilBacBlu` | `rgba(35,131,226,.035)` |
| `--ca-pilBacRed` | `rgba(243,136,118,.07)` |
| `--cl-pilBacWhi` | `rgba(84,72,49,.04)` |
| `--cd-pilBorYel` | `#fbf3db` |
| `--ca-pilBorBlu` | `rgba(35,131,226,.07)` |
| `--c-pilBorRed` | `#fdebec` |
| `--ca-pilBorWhi` | `rgba(84,72,49,.08)` |
| `--c-pilIcoYel` | `#ffb110` |
| `--c-pilIcoBlu` | `#2383e2` |
| `--c-pilIcoRed` | `#cd3c3a` |
| `--cl-pilIcoWhi` | `rgba(71,70,68,.6)` |
| `--ca-pilOutYel` | `rgba(236,191,66,.39)` |
| `--ca-pilOutBlu` | `rgba(35,131,226,.14)` |
| `--ca-pilOutRed` | `rgba(244,171,159,.4)` |
| `--cl-pilOutWhi` | `rgba(84,72,49,.08)` |
| `--c-pilHovBacYel` | `#fbf3db` |
| `--ca-pilHovBacBlu` | `rgba(35,131,226,.14)` |
| `--c-pilHovBacRed` | `#fdebec` |
| `--ca-pilHovBacWhi` | `rgba(0,0,0,.1)` |
| `--cl-pilHovBorYel` | `rgba(236,191,66,.39)` |
| `--ca-pilHovBorBlu` | `rgba(35,131,226,.07)` |
| `--ca-pilHovBorRed` | `rgba(244,171,159,.4)` |
| `--ca-pilHovBorWhi` | `rgba(84,72,49,.15)` |
| `--cd-pilHovTexYel` | `#402c1b` |
| `--c-pilHovTexBlu` | `#2383e2` |
| `--c-pilHovTexRed` | `#cd3c3a` |
| `--c-pilHovTexWhi` | `#73726e` |
| `--ca-pilPreBacYel` | `rgba(236,191,66,.39)` |
| `--ca-pilPreBacBlu` | `rgba(35,131,226,.21)` |
| `--ca-pilPreBacRed` | `rgba(244,171,159,.4)` |
| `--ca-pilPreBacWhi` | `rgba(0,0,0,.2)` |
| `--cl-pilPreBorYel` | `rgba(236,191,66,.39)` |
| `--ca-pilPreBorBlu` | `rgba(35,131,226,.07)` |
| `--cl-pilPreBorRed` | `rgba(244,171,159,.4)` |
| `--ca-pilPreBorWhi` | `rgba(81,73,60,.32)` |
| `--cd-pilSelBacYel` | `#fbf3db` |
| `--cl-pilSelBacBlu` | `rgba(35,131,226,.07)` |
| `--c-pilSelBacRed` | `#fdebec` |
| `--cl-pilSelBacWhi` | `rgba(84,72,49,.08)` |
| `--ca-pilSelBorYel` | `rgba(255,177,16,.5)` |
| `--cl-pilSelBorBlu` | `rgba(35,131,226,.35)` |
| `--ca-pilSelBorRed` | `rgba(215,38,21,.5)` |
| `--ca-pilSelBorWhi` | `rgba(71,70,68,.6)` |
| `--cl-pilSelHovBacYel` | `rgba(236,191,66,.39)` |
| `--ca-pilSelHovBacBlu` | `rgba(35,131,226,.14)` |
| `--ca-pilSelHovBacRed` | `rgba(244,171,159,.4)` |
| `--ca-pilSelHovBacWhi` | `rgba(84,72,49,.15)` |
| `--ca-pilSelHovBorYel` | `rgba(255,177,16,.5)` |
| `--cl-pilSelHovBorBlu` | `rgba(35,131,226,.35)` |
| `--ca-pilSelHovBorRed` | `rgba(215,38,21,.5)` |
| `--ca-pilSelHovBorWhi` | `rgba(71,70,68,.6)` |
| `--c-pilSelPreBacYel` | `#fce2ab` |
| `--ca-pilSelPreBacBlu` | `rgba(35,131,226,.21)` |
| `--cl-pilSelPreBacRed` | `rgba(215,38,21,.32)` |
| `--ca-pilSelPreBacWhi` | `rgba(81,73,60,.32)` |
| `--ca-pilSelPreBorYel` | `rgba(255,177,16,.5)` |
| `--cl-pilSelPreBorBlu` | `rgba(35,131,226,.35)` |
| `--ca-pilSelPreBorRed` | `rgba(215,38,21,.5)` |
| `--ca-pilSelPreBorWhi` | `rgba(71,70,68,.6)` |
| `--c-marTopTexHovRed` | `#f64932` |
| `--c-marTopTexHovYel` | `#ffb110` |
| `--c-marTopTexHovBlu` | `#2383e2` |
| `--cl-marTopTexHovWhi` | `rgba(0,0,0,.65)` |
| `--c-marTopTexPreRed` | `#ba1d08` |
| `--c-marTopTexPreYel` | `#db9400` |
| `--c-marTopTexPreBlu` | `#1761ab` |
| `--c-marTopTexPreWhi` | `#000` |
| `--c-marTopTexDroVieAllRed` | `#cd3c3a` |
| `--c-marTopTexDroVieAllYel` | `#d99e35` |
| `--c-marTopTexDroVieAllBlu` | `#2383e2` |
| `--c-marTopTexDroVieAllWhi` | `#000` |
| `--cl-marEdiIllRed` | `transparent` |
| `--cl-marEdiIllYel` | `transparent` |
| `--cl-marEdiIllBlu` | `transparent` |
| `--cl-marEdiIllWhi` | `transparent` |
| `--c-marEdiIcoRed` | `#f64932` |
| `--c-marEdiIcoYel` | `#ffb110` |
| `--c-marEdiIcoBlu` | `#2383e2` |
| `--cl-marEdiIcoWhi` | `rgba(71,70,68,.6)` |
| `--cd-marEdiBorRed` | `#fdebec` |
| `--cd-marEdiBorYel` | `#fbf3db` |
| `--cd-marEdiBorBlu` | `#f0f6fd` |
| `--ca-marEdiBorWhi` | `rgba(0,0,0,.024)` |
| `--ca-marEdiBorHovRed` | `rgba(244,171,159,.4)` |
| `--ca-marEdiBorHovYel` | `rgba(236,191,66,.39)` |
| `--cd-marEdiBorHovBlu` | `#e0eefb` |
| `--ca-marEdiBorHovWhi` | `rgba(0,0,0,.05)` |
| `--ca-marEdiBorPreRed` | `transparent` |
| `--ca-marEdiBorPreYel` | `transparent` |
| `--ca-marEdiBorPreBlu` | `transparent` |
| `--ca-marEdiBorPreWhi` | `transparent` |
| `--ca-marEdiBacRed` | `rgba(243,136,118,.07)` |
| `--ca-marEdiBacYel` | `rgba(215,177,24,.07)` |
| `--ca-marEdiBacBlu` | `rgba(35,131,226,.035)` |
| `--ca-marEdiBacWhi` | `rgba(84,72,49,.04)` |
| `--c-marEdiBacHovRed` | `#fdebec` |
| `--c-marEdiBacHovYel` | `#fbf3db` |
| `--cd-marEdiBacHovBlu` | `#f0f6fd` |
| `--ca-marEdiBacHovWhi` | `rgba(0,0,0,.08)` |
| `--cl-marEdiBacPreRed` | `rgba(244,171,159,.4)` |
| `--cl-marEdiBacPreYel` | `rgba(236,191,66,.39)` |
| `--cd-marEdiBacPreBlu` | `#d1e5f9` |
| `--ca-marEdiBacPreWhi` | `rgba(84,72,49,.15)` |
| `--c-creProInRevTex` | `#f97b2d` |
| `--c-creProInRevHovTex` | `#c76224` |
| `--c-creProInRevBac` | `#fde6d9` |
| `--c-shaCol` | `#0f0f0f` |
| `--c-botActBarSha` | `0 -1px 0 1px rgba(15,15,15,.05), 0 -3px 6px rgba(15,15,15,.1)` |
| `--c-butBoxSha` | `inset 0 0 0 1px rgba(15,15,15,.1), 0 1px 2px rgba(15,15,15,.1)` |
| `--c-avaBoxSha` | `0 2px 4px rgba(15,15,15,.1)` |
| `--c-butBluFocRin` | `0px 0px 0px 2px #f8f8f7, 0px 0px 0px 4px #2383e2, 0px 0px 0px 6px rgba(255,255,255,.25)` |
| `--c-inpRedFocRin` | `0px 0px 0px 1px #cd3c3a inset, 0px 0px 0px 1px #cd3c3a` |
| `--c-inpBluFocRin` | `0px 0px 0px 1px #2383e2 inset, 0px 0px 0px 1px #2383e2` |
| `--c-topAndSha` | `rgba(15,15,15,.1) 0px 2px 4px, rgba(15,15,15,.15) 0px 2px 8px` |
| `--c-topAndShaCol` | `rgba(15,15,15,.1) 0px 1px 0px, transparent 0px 0px 0px` |
| `--c-homScrButSha` | `0 0 0 1px rgba(15,15,15,.1), 0 2px 4px rgba(15,15,15,.1)` |
| `--c-homShaCarBas` | `0 0 0 1px rgba(0,0,0,.05)` |
| `--c-homShaCarHov` | `0 0 0 1px rgba(0,0,0,.1)` |
| `--c-homShaTemCarBas` | `0 0 0 1px rgba(0,0,0,.06)` |
| `--c-homShaTemCarHov` | `0 0 0 1px rgba(0,0,0,.12)` |
| `--c-focSha` | `rgba(35,131,226,.57) 0px 0px 0px 1px inset, rgba(35,131,226,.35) 0px 0px 0px 2px` |
| `--c-shaSMThiOut` | `0px 4px 12px -2px rgba(0,0,0,.08), 0 0 0 2px rgba(84,72,49,.08)` |
| `--c-shaMDPriOut` | `0px 14px 28px -6px rgba(0,0,0,.1), 0px 2px 4px -1px rgba(0,0,0,.06), 0 0 0 1px rgba(28,19,1,.11)` |
| `--c-shaMDThiOut` | `0px 14px 28px -6px rgba(0,0,0,.1), 0px 2px 4px -1px rgba(0,0,0,.06), 0 0 0 2px rgba(84,72,49,.08)` |
| `--c-shaOutMd` | `0px 8px 12px 0px rgba(25,25,25,.027), 0px 2px 6px 0px rgba(25,25,25,.027), 0px 0px 0px 1px rgba(42,28,0,.07)` |
| `--c-shaOutSm` | `0px 2px 4px 0px rgba(0,0,0,.04), 0px 0px 0px 1px rgba(42,28,0,.07)` |
| `--c-shaOutLg` | `0px 20px 24px 0px rgba(25,25,25,.05), 0px 5px 8px 0px rgba(25,25,25,.027), 0px 0px 0px 1px rgba(42,28,0,.07)` |
| `--c-shaOutDif` | `0px 12px 32px 0px rgba(25,25,25,.027), 0px 0px 0px 1px rgba(42,28,0,.07)` |
| `--c-shaOutScr` | `0px 24px 48px 0px rgba(25,25,25,.24), 0px 4px 12px 0px rgba(25,25,25,.14), 0px 0px 0px 1px rgba(42,28,0,.07)` |
| `--c-shaBasLg` | `0px 20px 24px 0px rgba(25,25,25,.05), 0px 5px 8px 0px rgba(25,25,25,.027)` |
| `--c-shaBasMd` | `0px 8px 12px 0px rgba(25,25,25,.027), 0px 2px 6px 0px rgba(25,25,25,.027)` |
| `--c-shaBasSm` | `0px 4px 12px 0px rgba(25,25,25,.027), 0px 1px 2px 0px rgba(25,25,25,.02)` |
| `--c-shaBasScr` | `0px 24px 48px 0px rgba(25,25,25,.24), 0px 4px 12px 0px rgba(25,25,25,.14)` |
| `--c-shaBasDif` | `0px 12px 32px 0px rgba(25,25,25,.027)` |
| `--ca-aiChaButUns` | `transparent` |
| `--ca-aiChaButUnsHov` | `transparent` |
| `--cd-aiChaButSel` | `#fff` |
| `--cd-aiChaButSelHov` | `#fff` |
| `--cd-aiChaButPre` | `#fff` |
| `--ca-staHov` | `rgba(55,53,47,.04)` |
| `--ca-staPre` | `rgba(55,53,47,.1)` |
| `--ca-glaPag` | `rgba(255,255,255,.8)` |
| `--ca-glaWas` | `rgba(249,249,248,.8)` |
| `--ca-popOveBac` | `rgba(15,15,15,.6)` |
| `--c-froColDivShaBacFil` | `linear-gradient(to right, rgba(135,131,120,.15), rgba(135,131,120,.1), transparent)` |
| `--c-froColDivShaBac` | `linear-gradient(to right, rgba(135,131,120,.35), rgba(135,131,120,.2), transparent)` |
| `--ca-swiButTeaBg` | `rgba(135,131,120,.3)` |
| `--ca-swiTogDesTraBg` | `rgba(135,131,120,.4)` |
| `--ca-swiTogDesTraBgVar` | `rgba(206,205,202,.3)` |
| `--ca-embBloResInnBg` | `rgba(15,15,15,.6)` |
| `--ca-calEveHovBac` | `rgba(55,53,47,.02)` |
| `--full-viewport-height` | `100vh` |
| `--safe-area-inset-top` | `env(safe-area-inset-top,0px)` |
| `--safe-area-inset-right` | `env(safe-area-inset-right,0px)` |
| `--safe-area-inset-left` | `env(safe-area-inset-left,0px)` |
| `--safe-area-inset-bottom` | `env(safe-area-inset-bottom,0px)` |
| `--dynamic-viewport-height` | `100vh` |
| `--btn-adj-dir` | `-1` |
| `--rc-drag-handle-size` | `12px` |
| `--rc-drag-handle-mobile-size` | `24px` |
| `--rc-drag-handle-bg-colour` | `rgba(0,0,0,.2)` |
| `--rc-drag-bar-size` | `6px` |
| `--rc-border-color` | `rgba(255,255,255,0)` |
| `--rc-focus-color` | `#08f` |
| `--drag-handle-offset` | `-6px` |
| `--drag-handle-short-side` | `6px` |
| `--drag-handle-long-side` | `48px` |
| `--drag-handle-corner` | `20px` |
| `--drag-handle-border` | `20px` |
| `--drag-handle-color` | `rgba(0,0,0,.6)` |
| `--drag-handle-opacity` | `.8` |
| `--crop-mask-color` | `white` |
| `--crop-mask-opacity` | `.8` |
| `--corner-handle-svg` | `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none'%3E%3Cpath fill='%23000' stroke='%23fff' d='M15 .5A2.5 2.5 0 0012.5 3v9.5H3a2.5 2.5 0 000 5h12a2.5 2.5 0 002.5-2.5V3A2.5 2.5 0 0015 .5z' %3E%3C/path%3E%3C/svg%3E")` |
| `--cardinal-handle-visibility` | `visible` |

---

## Design Tokens (CSS Variables)

Paste this `:root` block into your project to use all extracted tokens as CSS custom properties.

```css
/* ============================================
 * Design Tokens — New page | Notion
 * Source: https://app.notion.com/p/3b812b9662fb80ae81a7d3f40f6d27ed
 * Generated: 8/10/2026, 11:24:08 PM
 * ============================================ */

:root {
  /* ── Core: Colors ── */
  --color-dark-gray: #5F5E59; /* hsl(50, 3%, 36%) · text */
  --color-dark-gray-2: #2C2C2B; /* hsl(60, 1%, 17%) · text */
  --color-black: #000000; /* hsl(0, 0%, 0%) · text */
  --color-mid-gray: #8E8B86; /* hsl(37, 3%, 54%) · text */
  --color-mid-gray-2: #7D7A75; /* hsl(38, 3%, 47%) · text */
  --color-mid-gray-3: #A19E99; /* hsl(38, 4%, 62%) · text */
  --color-mid-gray-4: #ADA9A3; /* hsl(36, 6%, 66%) · text */
  --color-mid-gray-5: #91918E; /* hsl(60, 1%, 56%) · fill */
  --color-dark-gray-3: #383836; /* hsl(60, 2%, 22%) · text */
  --color-white: #FFFFFF; /* hsl(0, 0%, 100%) · background */
  --color-light-gray: #BCBAB6; /* hsl(40, 4%, 73%) · text */
  --color-dark-orange: rgba(42, 28, 0, 0.07); /* hsl(39, 100%, 8%) · background */
  --color-white-2: #F9F8F7; /* hsl(30, 14%, 97%) · background */
  --color-blue: #2783DE; /* hsl(210, 73%, 51%) · background */
  --color-dark-gray-4: rgba(25, 25, 25, 0.05); /* hsl(0, 0%, 8%) · shadow */
  --color-dark-red: rgba(33, 27, 23, 0.05); /* hsl(0, 32%, 12%) · background */
  --color-light-gray-2: #F0EFED; /* hsl(40, 9%, 94%) · shadow */

  /* ── Core: Typography ── */
  --font-size-2xs: 11px;
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-lg: 14px;
  --font-size-xl: 16px;
  --font-family-base: sans-serif;
  --font-family-2: ui-sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --line-height-tight: 12px;
  --line-height-snug: 13.431px;
  --line-height-normal: 14.4px;
  --line-height-relaxed: 16.8px;
  --line-height-loose: 18px;
  --line-height-lh-6: 20px;
  --line-height-lh-7: 21px;
  --line-height-lh-8: 24px;

  /* ── Layout: Spacing ── */
  --space-1: 1px;
  --space-2: 2px;
  --space-3: 3px;
  --space-4: 4px;
  --space-5: 5px;
  --space-6: 6px;
  --space-8: 8px;
  --space-10: 10px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-50: 50px;
  --space-80: 80px;
  --space-102: 102px;
  --space-120: 120px;
  --space-121: 121px;
  --space-191: 191px;

  /* ── Borders ── */
  --border-width-hairline: 1px;
  --border-width-thin: 2px;
  --radius-sm: 0px 8px 8px 0px;
  --radius-lg: 4px;
  --radius-xl: 6px;
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* ── Surfaces: Shadows ── */
  --shadow-sm: rgba(25, 25, 25, 0.027) 0px 8px 12px 0px, rgba(25, 25, 25, 0.027) 0px 2px 6px 0px, rgba(42, 28, 0, 0.07) 0px 0px 0px 1px;
  --shadow-md: rgba(25, 25, 25, 0.05) 0px 20px 24px 0px, rgba(25, 25, 25, 0.027) 0px 5px 8px 0px, rgba(42, 28, 0, 0.07) 0px 0px 0px 1px;
  --shadow-lg: rgb(240, 239, 237) -1px 0px 0px 0px inset;

  /* ── Motion ── */
  --duration-instant: 0.02s;
  --duration-fast: 0.1s;
  --duration-normal: 0.15s;
  --duration-slow: 0.16s;
  --duration-slower: 0.2s;
  --duration-duration-6: 0.25s;
  --duration-duration-7: 0.3s;
  --duration-duration-8: 0.7s;
  --easing-ease-in: ease-in;
  --easing-ease-out: ease-out;
  --easing-ease-in-out: ease-in-out;
  --easing-linear: linear;

  /* ── Layout: Z-Index ── */
  --z-1: -1;
  --z-2: 1;
  --z-3: 2;
  --z-4: 4;
  --z-5: 9;
  --z-6: 85;
  --z-7: 89;
  --z-8: 99;
  --z-9: 100;
  --z-10: 101;
  --z-11: 109;
  --z-12: 111;
  --z-13: 999;
  --z-14: 1000;
  --z-15: 9999;

  /* ── Breakpoints ── */
  --breakpoint-xs: 768px;
  --breakpoint-sm: 900px;
  --breakpoint-md: 1020px;
  --breakpoint-lg: 1123px;

  /* ── Opacity ── */
  --opacity-40: 0.4;
}
```

---

## Machine-Readable Tokens — DTCG JSON

W3C Design Tokens Community Group format. Compatible with Figma Tokens, Style Dictionary, and similar pipelines.

```json
{
  "$metadata": {
    "source": "https://app.notion.com/p/3b812b9662fb80ae81a7d3f40f6d27ed",
    "title": "New page | Notion",
    "generatedAt": "2026-08-10T17:54:08.770Z"
  },
  "core": {
    "color": {
      "dark-gray": {
        "$value": "#5F5E59",
        "$type": "color",
        "$description": "text · ×715"
      },
      "dark-gray-2": {
        "$value": "#2C2C2B",
        "$type": "color",
        "$description": "text · ×441"
      },
      "black": {
        "$value": "#000000",
        "$type": "color",
        "$description": "text · ×344"
      },
      "mid-gray": {
        "$value": "#8E8B86",
        "$type": "color",
        "$description": "text · ×305"
      },
      "mid-gray-2": {
        "$value": "#7D7A75",
        "$type": "color",
        "$description": "text · ×76"
      },
      "mid-gray-3": {
        "$value": "#A19E99",
        "$type": "color",
        "$description": "text · ×42"
      },
      "mid-gray-4": {
        "$value": "#ADA9A3",
        "$type": "color",
        "$description": "text · ×40"
      },
      "mid-gray-5": {
        "$value": "#91918E",
        "$type": "color",
        "$description": "fill · ×29"
      },
      "dark-gray-3": {
        "$value": "#383836",
        "$type": "color",
        "$description": "text · ×27"
      },
      "white": {
        "$value": "#FFFFFF",
        "$type": "color",
        "$description": "background · ×23"
      },
      "light-gray": {
        "$value": "#BCBAB6",
        "$type": "color",
        "$description": "text · ×18"
      },
      "dark-orange": {
        "$value": "rgba(42, 28, 0, 0.07)",
        "$type": "color",
        "$description": "background · ×6"
      },
      "white-2": {
        "$value": "#F9F8F7",
        "$type": "color",
        "$description": "background · ×3"
      },
      "blue": {
        "$value": "#2783DE",
        "$type": "color",
        "$description": "background · ×2"
      },
      "dark-gray-4": {
        "$value": "rgba(25, 25, 25, 0.05)",
        "$type": "color",
        "$description": "shadow · ×2"
      },
      "dark-red": {
        "$value": "rgba(33, 27, 23, 0.05)",
        "$type": "color",
        "$description": "background · ×2"
      },
      "light-gray-2": {
        "$value": "#F0EFED",
        "$type": "color",
        "$description": "shadow · ×1"
      }
    },
    "fontSize": {
      "font-size-2xs": {
        "$value": "11px",
        "$type": "dimension"
      },
      "font-size-xs": {
        "$value": "12px",
        "$type": "dimension"
      },
      "font-size-sm": {
        "$value": "13px",
        "$type": "dimension"
      },
      "font-size-lg": {
        "$value": "14px",
        "$type": "dimension"
      },
      "font-size-xl": {
        "$value": "16px",
        "$type": "dimension"
      }
    },
    "fontFamily": {
      "font-family-base": {
        "$value": "sans-serif",
        "$type": "fontFamily"
      },
      "font-family-2": {
        "$value": "ui-sans-serif",
        "$type": "fontFamily"
      }
    },
    "fontWeight": {
      "font-weight-regular": {
        "$value": "400",
        "$type": "fontWeight"
      },
      "font-weight-medium": {
        "$value": "500",
        "$type": "fontWeight"
      }
    },
    "lineHeight": {
      "line-height-tight": {
        "$value": "12px",
        "$type": "dimension"
      },
      "line-height-snug": {
        "$value": "13.431px",
        "$type": "dimension"
      },
      "line-height-normal": {
        "$value": "14.4px",
        "$type": "dimension"
      },
      "line-height-relaxed": {
        "$value": "16.8px",
        "$type": "dimension"
      },
      "line-height-loose": {
        "$value": "18px",
        "$type": "dimension"
      },
      "line-height-lh-6": {
        "$value": "20px",
        "$type": "dimension"
      },
      "line-height-lh-7": {
        "$value": "21px",
        "$type": "dimension"
      },
      "line-height-lh-8": {
        "$value": "24px",
        "$type": "dimension"
      }
    },
    "letterSpacing": {}
  },
  "layout": {
    "spacing": {
      "space-1": {
        "$value": "1px",
        "$type": "dimension"
      },
      "space-2": {
        "$value": "2px",
        "$type": "dimension"
      },
      "space-3": {
        "$value": "3px",
        "$type": "dimension"
      },
      "space-4": {
        "$value": "4px",
        "$type": "dimension"
      },
      "space-5": {
        "$value": "5px",
        "$type": "dimension"
      },
      "space-6": {
        "$value": "6px",
        "$type": "dimension"
      },
      "space-8": {
        "$value": "8px",
        "$type": "dimension"
      },
      "space-10": {
        "$value": "10px",
        "$type": "dimension"
      },
      "space-12": {
        "$value": "12px",
        "$type": "dimension"
      },
      "space-16": {
        "$value": "16px",
        "$type": "dimension"
      },
      "space-24": {
        "$value": "24px",
        "$type": "dimension"
      },
      "space-50": {
        "$value": "50px",
        "$type": "dimension"
      },
      "space-80": {
        "$value": "80px",
        "$type": "dimension"
      },
      "space-102": {
        "$value": "102px",
        "$type": "dimension"
      },
      "space-120": {
        "$value": "120px",
        "$type": "dimension"
      },
      "space-121": {
        "$value": "121px",
        "$type": "dimension"
      },
      "space-191": {
        "$value": "191px",
        "$type": "dimension"
      }
    },
    "zIndex": {
      "z-1": {
        "$value": "-1",
        "$type": "number"
      },
      "z-2": {
        "$value": "1",
        "$type": "number"
      },
      "z-3": {
        "$value": "2",
        "$type": "number"
      },
      "z-4": {
        "$value": "4",
        "$type": "number"
      },
      "z-5": {
        "$value": "9",
        "$type": "number"
      },
      "z-6": {
        "$value": "85",
        "$type": "number"
      },
      "z-7": {
        "$value": "89",
        "$type": "number"
      },
      "z-8": {
        "$value": "99",
        "$type": "number"
      },
      "z-9": {
        "$value": "100",
        "$type": "number"
      },
      "z-10": {
        "$value": "101",
        "$type": "number"
      },
      "z-11": {
        "$value": "109",
        "$type": "number"
      },
      "z-12": {
        "$value": "111",
        "$type": "number"
      },
      "z-13": {
        "$value": "999",
        "$type": "number"
      },
      "z-14": {
        "$value": "1000",
        "$type": "number"
      },
      "z-15": {
        "$value": "9999",
        "$type": "number"
      }
    },
    "breakpoint": {
      "breakpoint-xs": {
        "$value": "768px",
        "$type": "dimension"
      },
      "breakpoint-sm": {
        "$value": "900px",
        "$type": "dimension"
      },
      "breakpoint-md": {
        "$value": "1020px",
        "$type": "dimension"
      },
      "breakpoint-lg": {
        "$value": "1123px",
        "$type": "dimension"
      }
    }
  },
  "surfaces": {
    "borderRadius": {
      "radius-sm": {
        "$value": "0px 8px 8px 0px",
        "$type": "dimension"
      },
      "radius-lg": {
        "$value": "4px",
        "$type": "dimension"
      },
      "radius-xl": {
        "$value": "6px",
        "$type": "dimension"
      },
      "radius-2xl": {
        "$value": "16px",
        "$type": "dimension"
      },
      "radius-full": {
        "$value": "9999px",
        "$type": "dimension"
      }
    },
    "borderWidth": {
      "border-width-hairline": {
        "$value": "1px",
        "$type": "dimension"
      },
      "border-width-thin": {
        "$value": "2px",
        "$type": "dimension"
      }
    },
    "shadow": {
      "shadow-sm": {
        "$value": "rgba(25, 25, 25, 0.027) 0px 8px 12px 0px, rgba(25, 25, 25, 0.027) 0px 2px 6px 0px, rgba(42, 28, 0, 0.07) 0px 0px 0px 1px",
        "$type": "shadow"
      },
      "shadow-md": {
        "$value": "rgba(25, 25, 25, 0.05) 0px 20px 24px 0px, rgba(25, 25, 25, 0.027) 0px 5px 8px 0px, rgba(42, 28, 0, 0.07) 0px 0px 0px 1px",
        "$type": "shadow"
      },
      "shadow-lg": {
        "$value": "rgb(240, 239, 237) -1px 0px 0px 0px inset",
        "$type": "shadow"
      }
    }
  },
  "motion": {
    "duration": {
      "duration-instant": {
        "$value": "0.02s",
        "$type": "duration"
      },
      "duration-fast": {
        "$value": "0.1s",
        "$type": "duration"
      },
      "duration-normal": {
        "$value": "0.15s",
        "$type": "duration"
      },
      "duration-slow": {
        "$value": "0.16s",
        "$type": "duration"
      },
      "duration-slower": {
        "$value": "0.2s",
        "$type": "duration"
      },
      "duration-duration-6": {
        "$value": "0.25s",
        "$type": "duration"
      },
      "duration-duration-7": {
        "$value": "0.3s",
        "$type": "duration"
      },
      "duration-duration-8": {
        "$value": "0.7s",
        "$type": "duration"
      }
    },
    "easing": {
      "easing-ease-in": {
        "$value": "ease-in",
        "$type": "cubicBezier"
      },
      "easing-ease-out": {
        "$value": "ease-out",
        "$type": "cubicBezier"
      },
      "easing-ease-in-out": {
        "$value": "ease-in-out",
        "$type": "cubicBezier"
      },
      "easing-linear": {
        "$value": "linear",
        "$type": "cubicBezier"
      }
    }
  },
  "opacity": {
    "opacity-40": {
      "$value": 0.4,
      "$type": "number"
    }
  }
}
```



---


## Components


### Component 1 — Sidebar Nav Item 'Notion Calendar'
- **Purpose:** Primary navigation list items for workspace pages and apps.
- **Geometry:** 239x30px, 6px radius (`--radius-xl`).
- **Typography:** 16px, weight 500, color `--color-dark-gray` (#5F5E59).
- **States:** none authored.

### Component 2 — Primary Accessibility Link 'Skip to content'
- **Purpose:** Hidden focusable link for screen readers.
- **Geometry:** 200x48px, 16px radius (`--radius-2xl`), 12px padding.
- **Styles:** Background `--color-blue` (#2783DE), white text.
- **States:** active: outline: 0px.

### Component 3 — Floating Action Button 'New chat'
- **Purpose:** Pinned utility button for AI/Chat features.
- **Geometry:** 188x40px, 999px radius (`--radius-full`), 0px 12px padding.
- **Styles:** White background with `--shadow-sm` and a 1px border stroke using `--color-dark-orange`.
- **States:** none authored.

### Component 4 — UI Icon Button
- **Purpose:** Small square utility buttons (e.g., search, settings, toggle).
- **Geometry:** 24x24px, 6px radius (`--radius-xl`).
- **Styles:** Transparent background, color `--color-dark-gray-2` (#2C2C2B).
- **States:** none authored.

### Component 5 — Nav Group Toggle 'Recents'
- **Purpose:** Section header in the sidebar that controls visibility.
- **Geometry:** 239x30px, 6px radius, 0px 8px padding.
- **Typography:** weight 500, color `--color-dark-gray` (#5F5E59).
- **States:** none authored.

### Component 6 — Breadcrumb Ellipsis
- **Purpose:** Collapsed navigation path indicator.
- **Geometry:** 21x24px, 6px radius, 0px 6px padding.
- **Styles:** Transparent background, color `--color-dark-gray-2` (#2C2C2B).
- **States:** none authored.

### Component 7 — User Avatar Badge 'G'
- **Purpose:** Compact visual identification.
- **Geometry:** 24x24px, 100% radius.
- **Styles:** White background, 11px text (`--font-size-2xs`), color `--color-mid-gray` (#8E8B86).
- **States:** none authored.

### Component 8 — Sidebar Container
- **Purpose:** Fixed left-hand navigation rail.
- **Geometry:** 270px width, 900px height.
- **Styles:** Background `--color-white-2` (#F9F8F7), 1px inset right shadow (`--shadow-lg`).
- **States:** none authored.


## Layout


### Section 1 — Main Application Interface
Sitting on a white background (`rgb(255, 255, 255)`), this primary section encompasses the entire viewport (900px height). It features a three-column logic: a fixed sidebar on the left, a central main content area for the document editor, and a right-side gutter. The layout is managed via flex-row. The main heading 'New page' uses 40px bold text (`--font-size-xl` variant). It contains the vast majority of interactive elements, including 69 buttons and 82 SVGs.

### Section 2 — Footer Canvas
A 432px tall empty section inheriting the white background from the page canvas. This represents the scrollable overflow area beneath the document content.

### Whitespace & Rhythm
The interface utilizes a modular spacing system where components are typically separated by `8px` (`--space-8`) or `16px` (`--space-16`). The sidebar uses a consistent container gutter of roughly 12px. The vertical rhythm is driven by the document flow rather than section padding, as `paddingTop` and `paddingBottom` were measured at 0px across sections.

Core spacing scale:
8px (`--space-8`) — primary component gap / list spacing
16px (`--space-16`) — secondary layout gap
1px (`--space-1`) — hair-line borders and separators
4px (`--space-4`) — internal icon/text spacing
Other --space-* tokens in the token table are incidental one-off measurements, not part of the core scale.

### Responsive Behavior
| Section(s) | Desktop | Mobile (375px) | Change |
| --- | --- | --- | --- |
| Main App Interface (Section 1) | 3 columns, heading 40px | 3 columns, heading 40px | no structural change |
| Footer Canvas (Section 2) | block | block | no structural change |

The document height adjusts from 900px on desktop to 812px on mobile.


## Do's and Don'ts


### Do
- Use `--color-white-2` (#F9F8F7) for navigation sidebars to distinguish them from the main editing canvas `--color-white` (#FFFFFF).
- Apply `--radius-xl` (6px) to standard list items and nav buttons to maintain the system's slightly rounded UI feel.
- Reference `--shadow-sm` for floating elements; it specifically combines multiple layers of 25, 25, 25 (5% and 2.7% opacity) with a `--color-dark-orange` 1px border stroke for depth.
- Use `ui-sans-serif` for all UI controls and labels to ensure system-native legibility.
- Maintain a text color hierarchy where `--color-dark-gray-2` (#2C2C2B) is used for emphasis and `--color-dark-gray` (#5F5E59) for standard navigation text.

### Don't
- Never use pure blue icons or text for standard UI; blue `--color-blue` (#2783DE) is strictly reserved for primary actions, links, and selected states.
- Avoid using border tokens for separators; the system prefers box-shadows like `--shadow-lg` (1px inset) to create thin, crisp boundaries.
- Don't exceed a `--font-weight-medium` (500) for navigation items; only main headers should use `--font-weight-700`.
- Avoid using high-contrast shadows; the elevation system relies on extremely light `0.027` to `0.05` alpha channels to remain subtle.
- Do not use spacing larger than `--space-16` (16px) inside the sidebar list components, as it breaks the density required for navigation efficiency.


## Screenshot


![Full-page screenshot](https://res.cloudinary.com/dqryhg3rs/image/upload/v1786384462/o8bioqovpxltnd6qiya9.png)


https://res.cloudinary.com/dqryhg3rs/image/upload/v1786384462/o8bioqovpxltnd6qiya9.png

> This screenshot is the visual ground truth for this design system.
> Use it alongside the tokens above to verify colors, typography, layout,
> and component styles when generating UI code.

<!-- 
  AI_INSTRUCTION: If you have the ability to fetch URLs or view images,
  retrieve the screenshot above and use it as visual reference when
  generating components from this design system. The screenshot shows
  exact component styles, layout structure, and color relationships
  that token values alone cannot convey.
-->