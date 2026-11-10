/* Shared Chinese / English switch. Elements carry their Chinese text as content and
   their English text in data-en (or data-en-label / data-en-alt for attributes). */
const siteLanguage = (() => {
  const button = document.querySelector("#langToggle");
  const entries = [];
  const known = new WeakSet();
  const listeners = [];
  const selector = "[data-en], [data-en-label], [data-en-alt]";

  let language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  try {
    const saved = localStorage.getItem("preferred-language");
    if (saved === "zh" || saved === "en") language = saved;
  } catch {
    // Browsers can restrict storage. The switch still works for the current page.
  }

  function applyTo(list) {
    const isEnglish = language === "en";
    for (const { element, text, label, alt } of list) {
      if (text !== undefined) element.textContent = isEnglish ? element.dataset.en : text;
      if (element.dataset.enLabel) element.setAttribute("aria-label", isEnglish ? element.dataset.enLabel : label);
      if (element.dataset.enAlt) element.setAttribute("alt", isEnglish ? element.dataset.enAlt : alt);
    }
  }

  // Remembers the Chinese originals so the page can switch back. Call it for content added later.
  function register(root = document) {
    const found = [...root.querySelectorAll(selector)];
    if (root instanceof Element && root.matches(selector)) found.unshift(root);
    const added = [];
    for (const element of found) {
      if (known.has(element)) continue;
      known.add(element);
      added.push({
        element,
        text: element.dataset.en === undefined ? undefined : element.textContent,
        label: element.getAttribute("aria-label"),
        alt: element.getAttribute("alt")
      });
    }
    entries.push(...added);
    applyTo(added);
  }

  function apply() {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    applyTo(entries);
    if (button) {
      button.textContent = language === "en" ? "中文" : "English";
      button.lang = language === "en" ? "zh-CN" : "en";
    }
    for (const listener of listeners) listener(language);
  }

  register();
  apply();

  if (button) {
    button.hidden = false;
    button.addEventListener("click", () => {
      language = language === "zh" ? "en" : "zh";
      apply();
      try {
        localStorage.setItem("preferred-language", language);
      } catch {
        // The current page already reflects the selected language.
      }
    });
  }

  return {
    get language() { return language; },
    register,
    apply,
    onChange(listener) { listeners.push(listener); }
  };
})();
