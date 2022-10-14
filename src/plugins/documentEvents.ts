// keydownイベント
document.body.addEventListener("keydown", function (e) {
  if (!e.target || !(e.target instanceof HTMLElement)) return;
  const hasInput = (e.target as HTMLInputElement).value != "";
  if (e.target.parentElement!.hasAttribute("data-clearable")) {
    // 消去フラグを設定
    e.target.parentElement!.dataset["clearable"] = hasInput ? "1" : "";
  }
}, true);

// 共通ボタン
document.body.addEventListener("click", function (e) {
  if (!e.target || !(e.target instanceof HTMLElement)) return;
  if (e.target.classList.contains("input-clear")) {
    const clearableWrapper = e.target.closest("[data-clearable]") as HTMLElement;
    const input = clearableWrapper.querySelector("input")!;
    if (!input) return;
    input.value = "";
    clearableWrapper.dataset["clearable"] = "";
  }
});

