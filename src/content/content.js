

const MESSAGE_BODY_SELECTOR = ".a3s";
const SCAN_DELAY = 300;

let hueCueEnabled = true;
let scanTimer = null;

const detectedElements = new WeakMap();

function isVisible(element) {
  const style = getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getClientRects().length > 0
  );
}

function isInsideLink(element) {
  return element.closest("a") !== null;
}

function ownsColor(element) {
  const parent = element.parentElement;

  if (!parent) {
    return false;
  }

  const currentColor = getComputedStyle(element).color;
  const parentColor = getComputedStyle(parent).color;

  return currentColor !== parentColor;
}

function getTextPreview(element) {
  return (element.innerText || element.textContent || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function detectColoredText(messageBody) {
  const elements = messageBody.querySelectorAll("*");

  elements.forEach((element) => {
    if (!isVisible(element)) return;
    if (isInsideLink(element)) return;
    if (isInsideQuotedHistory(element)) return;
    if (!ownsColor(element)) return;

    const color = getComputedStyle(element).color;
    const text = getTextPreview(element);

    const classification = classifyColor(color);

    if (!classification) return;

    if (!text) return;

    // Ignore transparent text
    if (color === "rgba(0, 0, 0, 0)") return;

    // Ignore ordinary dark grey text
    if (color === "rgb(51, 51, 51)") return;

    if (!text) return;

    applyVisualCue(element, classification.family);

    const previousColor = detectedElements.get(element);

    if (previousColor === color) return;

    detectedElements.set(element, color);

    console.log("[HueCue] Colored text detected:", {
        text,
        color,
        family: classification.family,
        hsl: {
            hue: classification.hue,
            saturation: classification.saturation,
            lightness: classification.lightness
        },
        element     
    });
  });
}

function scanGmailMessages() {
  if (!hueCueEnabled) return;

  const messageBodies = document.querySelectorAll(
    MESSAGE_BODY_SELECTOR
  );

  messageBodies.forEach(detectColoredText);
}

function scheduleScan() {
  if (!hueCueEnabled) return;

  clearTimeout(scanTimer);

  scanTimer = setTimeout(() => {
    scanGmailMessages();
  }, SCAN_DELAY);
}

function setHueCueState(enabled) {
  hueCueEnabled = enabled;

  if (enabled) {
    scheduleScan();
  } else {
    clearTimeout(scanTimer);
    clearVisualCues();
  }
}

chrome.storage.sync.get({ enabled: true }).then((settings) => {
  setHueCueState(settings.enabled);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.enabled) {
    setHueCueState(changes.enabled.newValue);
  }
});

function isRelevantMutation(mutation) {
  const target = mutation.target.nodeType === Node.ELEMENT_NODE
    ? mutation.target
    : mutation.target.parentElement;

  // Check whether the change happened inside a Gmail message
  if (target?.closest(MESSAGE_BODY_SELECTOR)) {
    return true;
  }

  // Check whether Gmail added a new message body
  if (mutation.type === "childList") {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      if (
        node.matches(MESSAGE_BODY_SELECTOR) ||
        node.querySelector(MESSAGE_BODY_SELECTOR)
      ) {
        return true;
      }
    }
  }

  return false;
}

const gmailObserver = new MutationObserver((mutations) => {
  if (!hueCueEnabled) return;

  const relevantChange = mutations.some(isRelevantMutation);

  if (relevantChange) {
    scheduleScan();
  }
});

gmailObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["style", "class"]
});

scheduleScan();

function rgbToHsl(color) {
  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );

  if (!match) return null;

  const r = Number(match[1]) / 255;
  const g = Number(match[2]) / 255;
  const b = Number(match[3]) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;

    s = l > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h *= 60;
  }

  return {
    hue: Math.round(h),
    saturation: Math.round(s * 100),
    lightness: Math.round(l * 100)
  };
}

function classifyColor(color) {
  const hsl = rgbToHsl(color);

  if (!hsl) return null;

  const { hue, saturation, lightness } = hsl;

  // Ignore grey and nearly colourless text in Version 1
  if (saturation < 10) return null;

  let family;

  if (hue >= 345 || hue < 15) {
    family = "red";
  } else if (hue >= 15 && hue < 45) {
    family = lightness < 35 ? "brown" : "orange";
  } else if (hue >= 45 && hue < 70) {
    family = "orange";
  } else if (hue >= 70 && hue < 165) {
    family = "green";
  } else if (hue >= 165 && hue < 260) {
    family = "blue";
  } else if (hue >= 260 && hue < 300) {
    family = "purple";
  } else {
    family = "pink";
  }

  return {
    family,
    ...hsl
  };
}

function applyVisualCue(element, family) {
  const parentCue = element.parentElement?.closest(
    "[data-huecue-family]"
  );

  // Avoid duplicate glyphs inside the same color family
  if (
    parentCue &&
    parentCue.getAttribute("data-huecue-family") === family
  ) {
    element.removeAttribute("data-huecue-family");
    return;
  }

  element.setAttribute("data-huecue-family", family);
}

function isInsideQuotedHistory(element) {
  return Boolean(
    element.closest(
      '.gmail_quote, .gmail_extra, blockquote, [class*="gmail_quote"]'
    )
  );
}

function clearVisualCues() {
  document
    .querySelectorAll("[data-huecue-family]")
    .forEach((element) => {
      element.removeAttribute("data-huecue-family");
    });
}