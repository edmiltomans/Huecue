
function applyHueCueState(enabled) {
  document.documentElement.dataset.huecueEnabled = String(enabled);
}

chrome.storage.sync.get({ enabled: true }).then((settings) => {
  applyHueCueState(settings.enabled);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.enabled) {
    applyHueCueState(changes.enabled.newValue);
  }
});
