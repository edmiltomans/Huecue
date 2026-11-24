

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
    if (!ownsColor(element)) return;

    const color = getComputedStyle(element).color;
    const text = getTextPreview(element);

    if (!text) return;

    // Ignore transparent text
    if (color === "rgba(0, 0, 0, 0)") return;

    // Ignore ordinary dark grey text
    if (color === "rgb(51, 51, 51)") return;

    if (!text) return;

    const previousColor = detectedElements.get(element);

    if (previousColor === color) return;

    detectedElements.set(element, color);

    console.log("[HueCue] Colored text detected:", {
      text,
      color,
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
  clearTimeout(scanTimer);

  scanTimer = setTimeout(() => {
    scanGmailMessages();
  }, SCAN_DELAY);
}

function setHueCueState(enabled) {
  hueCueEnabled = enabled;

  if (enabled) {
    scheduleScan();
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

const gmailObserver = new MutationObserver(() => {
  scheduleScan();
});

gmailObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["style", "class"]
});

scheduleScan();
