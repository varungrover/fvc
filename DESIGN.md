---
colors:
  primary:
    navy:
      value: "#0d1b3e"
      description: "Deep foundation color used for headers, primary text, and dark mode backgrounds."
    navy-light:
      value: "#1a2d5a"
      description: "Lighter variant of navy for secondary UI elements."
  accent:
    teal:
      value: "#0a9b8a"
      description: "Primary action color for the Chess program and success states."
    amber:
      value: "#f5a623"
      description: "Vibrant accent for CTAs, Finance program, and warnings."
    purple:
      value: "#805ad5"
      description: "Secondary accent used for Arts and creative programs."
    blue:
      value: "#3182ce"
      description: "Informational color used for Math and blue-tinted UI elements."
    green:
      value: "#38a169"
      description: "Success color used for English and positive status indicators."
  neutral:
    bg:
      value: "#f4f6fa"
      description: "Soft blue-gray background for the entire application."
    surface:
      value: "#ffffff"
      description: "Pure white surface for cards and modals."
    gray-50:
      value: "#f9fafb"
    gray-100:
      value: "#f3f4f6"
    gray-500:
      value: "#6b7280"
    gray-900:
      value: "#111827"
typography:
  font-family:
    sans:
      value: "Nunito Sans, system-ui, sans-serif"
  sizes:
    xs:
      value: "11px"
    sm:
      value: "13px"
    base:
      value: "15px"
    lg:
      value: "18px"
    xl:
      value: "20px"
    "2xl":
      value: "30px"
    "3xl":
      value: "48px"
  weights:
    regular:
      value: 400
    semibold:
      value: 600
    bold:
      value: 700
    black:
      value: 900
radii:
  control:
    value: "8px"
    description: "Standard radius for buttons and inputs."
  card:
    value: "12px"
    description: "Softer radius for content containers."
  modal:
    value: "14px"
    description: "Maximum softness for floating overlays."
  pill:
    value: "999px"
    description: "Used for status badges and tags."
shadows:
  card:
    value: "0 1px 4px rgba(13,27,62,0.08)"
  card-hover:
    value: "0 4px 16px rgba(13,27,62,0.14)"
  modal:
    value: "0 20px 60px rgba(0,0,0,0.2)"
spacing:
  section:
    value: "64px"
  container:
    value: "1120px"
---

# Mentora LMS: The Learning Planet

Mentora is designed with a "Cosmic Academy" aesthetic—balancing the professional reliability of a corporate LMS with the vibrant, explorative energy of a children's learning center. The visual identity is built on a "Navy & Neon" foundation, where deep, trustworthy dark blues provide the structure for high-contrast, colorful "Planet" accents.

## The "Planet" Accent System
Each learning subject is treated as a distinct "Planet," assigned a unique color-pairing that carries through from the storefront to the course dashboard:
- **Chess (Teal)**: Strategic and precise.
- **Math (Blue)**: Logical and clear.
- **Arts (Purple)**: Creative and imaginative.
- **Finance (Amber)**: Energy and growth.
- **English (Green)**: Natural and communicative.

These colors are never used in isolation; they are always accompanied by a 10-15% opacity background tint (e.g., `tealLight`) to create soft, legible containers that categorize information without visual fatigue.

## UI Principles
1. **Depth & Hierarchy**: The application uses three levels of elevation:
   - **Background**: Soft gray-blue (`#f4f6fa`) to reduce screen glare.
   - **Cards**: Pure white with a subtle 1px border and tight shadow.
   - **Modals**: High-elevation floating elements with wide, soft shadows.
2. **Typography for Readability**: Nunito Sans is the primary typeface. Its rounded terminals provide a friendly, approachable feel, while the "Black" weight (900) is used for headings to command attention and maintain a premium, high-impact look.
3. **Approachable Rigidity**: Radii are intentional. 8px for controls keeps the UI feeling precise, while 12-14px for larger containers adds the "human" touch necessary for an educational product.
4. **Interactive Micro-feedback**: Every card and button should feel alive. Hover states often involve a deepening of shadows and a slight lift, reinforcing the tactile nature of the "Planet" tiles.

## Design Intent
The goal is to make the user feel like they are exploring a vast educational universe. We avoid generic business UI in favor of a playful yet structured interface where iconography (emojis and symbols) and bold color categorization lead the way.
