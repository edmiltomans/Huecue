
const popupShell = document.querySelector(".popup-shell");
const enabledToggle = document.getElementById("enabledToggle");
const status = document.getElementById("status");

const openGuide = document.getElementById("openGuide");
const backButton = document.getElementById("backButton");

chrome.storage.sync.get({ enabled: true }).then((settings) => {
  enabledToggle.checked = settings.enabled;
  updateStatus(settings.enabled);
});

enabledToggle.addEventListener("change", async () => {
  const enabled = enabledToggle.checked;

  await chrome.storage.sync.set({ enabled });
  updateStatus(enabled);
});

openGuide.addEventListener("click", () => {
  popupShell.classList.add("show-guide");
});

backButton.addEventListener("click", () => {
  popupShell.classList.remove("show-guide");
});

function updateStatus(enabled) {
  status.textContent = enabled
    ? "Visual cues are active"
    : "Visual cues are turned off";
}
