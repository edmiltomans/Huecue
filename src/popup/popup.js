
const enabledToggle = document.getElementById("enabledToggle");
const status = document.getElementById("status");

chrome.storage.sync.get({ enabled: true }).then((settings) => {
  enabledToggle.checked = settings.enabled;
  updateStatus(settings.enabled);
});

enabledToggle.addEventListener("change", async () => {
  const enabled = enabledToggle.checked;

  await chrome.storage.sync.set({ enabled });
  updateStatus(enabled);
});

function updateStatus(enabled) {
  status.textContent = enabled
    ? "HueCue is enabled."
    : "HueCue is disabled.";
}
