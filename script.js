const languageButton = document.querySelector("#langToggle");
const description = document.querySelector('meta[name="description"]');
const defaultTitle = document.title;
const defaultDescription = description.content;

const translations = [...document.querySelectorAll("[data-en], [data-en-label], [data-en-alt]")].map((element) => ({
  element,
  text: element.dataset.en === undefined ? undefined : element.textContent,
  label: element.getAttribute("aria-label"),
  alt: element.getAttribute("alt")
}));

function applyLanguage(language) {
  const isEnglish = language === "en";

  document.documentElement.lang = isEnglish ? "en" : "zh-CN";
  document.title = isEnglish ? "Xianwei Guo | AI Application & Agent Engineering" : defaultTitle;
  description.content = isEnglish
    ? "Xianwei Guo, a software engineering master’s student at Southeast University working on AI applications and Agent engineering."
    : defaultDescription;

  for (const { element, text, label, alt } of translations) {
    if (text !== undefined) element.textContent = isEnglish ? element.dataset.en : text;
    if (element.dataset.enLabel) element.setAttribute("aria-label", isEnglish ? element.dataset.enLabel : label);
    if (element.dataset.enAlt) element.setAttribute("alt", isEnglish ? element.dataset.enAlt : alt);
  }

  languageButton.textContent = isEnglish ? "中文" : "English";
  languageButton.lang = isEnglish ? "zh-CN" : "en";
}

let language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
try {
  const savedLanguage = localStorage.getItem("preferred-language");
  if (savedLanguage === "zh" || savedLanguage === "en") language = savedLanguage;
} catch {
  // Browsers can restrict storage. The switch still works for the current page.
}

applyLanguage(language);
languageButton.hidden = false;
languageButton.addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  applyLanguage(language);
  try {
    localStorage.setItem("preferred-language", language);
  } catch {
    // The current page already reflects the selected language.
  }
});
