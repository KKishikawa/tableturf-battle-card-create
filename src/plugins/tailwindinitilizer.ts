const darkMode = {
  /** ダークモードに変更する */
  toDark(save?: boolean) {
    document.documentElement.classList.add("dark");
    if (save) localStorage.theme = "dark";
  },
  /** ライトモードに切り替える */
  toLight(save?: boolean) {
    document.documentElement.classList.remove("dark");
    if (save) localStorage.theme = "light";
  },
  /** ダークモードとライトモードを切り替える  */
  toggle(save?: boolean) {
    if (document.documentElement.classList.contains("dark")) {
      this.toLight(save);
    } else {
      this.toDark(save);
    }
  }
}

{
  // On page load or when changing themes, best to add inline in `head` to avoid FOUC
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    darkMode.toDark();
  } else {
    darkMode.toLight();
  }
}

// initialize event listener
{
  document.getElementById("darkModeToggleButton")!.onclick = darkMode.toggle.bind(darkMode, true);
}
