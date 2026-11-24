# HueCue

**HueCue** is a privacy-first Chrome extension that makes colored text in Gmail easier to distinguish without relying on color alone. It adds small monochrome visual cues—such as symbols, bold, italic, or underline patterns—to colored text, helping users identify color-coded information.

> **Status:** Early development (Version 0.1.0). Gmail support is the current focus. The extension is still being tested and its color-classification rules may not catch every shade accurately.

## The problem
Color is often used to communicate meaning in email—for example, highlighting warnings in red or important information in green. These distinctions can be difficult for people with color vision deficiencies to recognize. HueCue adds a second visual signal while preserving the original text color.

## How HueCue works
1. Detects colored text in Gmail message content.
2. Skips links and text that is not visibly colored (and skips quoted reply history where possible).
3. Classifies detected text into a color family.
4. Adds a corresponding visual cue using text styling and a symbol.
5. Watches for Gmail's dynamically loaded content and scans it as it appears.

HueCue processes email content locally in your browser. It does not send email text to a HueCue server or store email content.

## Color-to-cue guide
| Color family | Visual cue | Formatting |
|---|---|---|
| Red | ▲ | Bold |
| Orange | ◆ | Bold + dotted underline |
| Green | ● | Italic |
| Brown | ■ | Italic + dotted underline |
| Blue | ▼ | Dashed underline |
| Purple | ★ | Bold + italic |
| Pink / Magenta | ✚ | Bold + italic + dashed underline |

The cue is intended to supplement—not replace—the original color. Cues are applied to colored text runs rather than every individual word when possible.

## Features
- Detects colored text in Gmail message bodies
- Adds monochrome symbols and text formatting to provide color-independent cues
- Excludes hyperlinks from cueing to avoid interfering with link appearance
- Avoids duplicate cues on nested elements
- Skips quoted history where possible
- Handles dynamically loaded Gmail messages with a mutation observer and debounced scans
- On/off control for enabling or disabling HueCue
- Local processing; no email-content collection or transmission

## Privacy
HueCue is designed to work locally in the browser:
- Email content is inspected only by the extension's content script to identify colored text and apply cues.
- Email content is not sent to external servers.
- The extension does not intentionally save email content.
- Extension preferences are stored using Chrome's extension storage (`chrome.storage.sync`).

Review the extension's source code and permissions before installing or using it.

## Installation (developer mode)
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the HueCue project folder—the folder containing `manifest.json`.
6. Open or refresh Gmail to test the extension.

After making code changes, return to `chrome://extensions` and click the extension's **Reload** button, then refresh Gmail.

## Testing
To test the current implementation:
1. Open Gmail in Chrome.
2. Open an email containing colored text in its message body.
3. Check that recognized colored text receives its cue.
4. Verify that links are not cued.
5. Verify that quoted reply history is skipped where detectable.
6. Expand other messages in a conversation and check that those messages are scanned too.
7. Toggle HueCue off and confirm cues are removed; toggle it on again and confirm cues return.
8. Test a message containing multiple colors and different shades.

Color recognition is heuristic, so very similar shades, unusual backgrounds, or theme-dependent rendering can be misclassified. Please report reproducible issues with example colors and screenshots that do not expose private email content.

## Project structure
```text
huecue/
├── icons/
│   ├── huecue.png
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── src/
│   ├── content/
│   │   ├── content.js
│   │   └── cues.css
│   └── popup/
│       ├── popup.html
│       ├── popup.css
│       └── popup.js
├── manifest.json
└── README.md
```
*The generated icon-size files may not exist yet in every checkout; create them if your manifest references them.*

## Permissions
HueCue is intended to use only the permissions necessary for its current features:
- `storage` — save extension preferences.
- Gmail site access / content-script match — run the extension on Gmail (`https://mail.google.com/*`).

See `manifest.json` for the exact permissions and host access declared by your local build.

## Current limitations
- Gmail is the supported target at this stage; other email services are not supported.
- Color detection uses heuristic hue ranges and is not a medically or scientifically validated color-vision model.
- Color classification can be affected by background colors, theme rendering, nested formatting, or uncommon shades.
- Some visual cues (especially CSS-generated symbols) may not be announced consistently by screen readers. The extension is not yet a substitute for dedicated assistive-technology testing.
- Options such as CVD profiles, smarter color-distance detection, and expanded settings are planned rather than part of the current core implementation.

## Roadmap
### Version 1 — Core Gmail support
- [x] Colored-text detection and cue styling (initial implementation)
- [x] Cue mapping for the currently implemented color families
- [x] Link exclusion
- [x] Avoid duplicate cues on nested elements
- [x] Skip quoted history where detectable
- [x] Support Gmail dynamic content updates
- [x] Extension enable/disable control
- [ ] Broader shade/background testing and refinement
- [ ] Accessibility testing with screen readers

### Version 2 — Personalization and accessibility
- [ ] Color-vision profile options (protan, deutan, tritan, achromatopsia, unsure)
- [ ] Cue intensity options (Subtle, Balanced, Explicit)
- [ ] Hover explanations/tooltips
- [ ] Per-message cue legend
- [ ] Settings page with live preview
- [ ] More thorough keyboard and assistive-technology testing

### Version 3 — Smarter detection and navigation
- [ ] Background/highlight color support
- [ ] Smart classification using color-vision simulations and color-distance metrics
- [ ] Sender and thread exclusions
- [ ] Navigation for colored/cued items
- [ ] Performance improvements for large threads

### Future ideas
- Compose-time color accessibility helper
- Color labels/chips and configurable palettes
- Image/chart color accessibility
- Support for other email clients (such as Outlook)
- Localization

## Contributing and feedback
HueCue is an early-stage project. Bug reports, accessibility feedback, suggestions for cue mappings, and testing across different Gmail layouts are welcome. Please avoid including private email content in public issues.


## License
No license has been selected yet. Until a license is added to this repository, reuse, redistribution, and modification permissions are not explicitly granted.
