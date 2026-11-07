const languageButton = document.querySelector("#langToggle");
const description = document.querySelector('meta[name="description"]');
const accessDialog = document.querySelector("#access-dialog");
const accessTitle = document.querySelector("#access-title");
const accessDescription = document.querySelector("#access-description");
const accessForm = document.querySelector("#access-form");
const accessKey = document.querySelector("#access-key");
const accessError = document.querySelector("#access-error");
const main = document.querySelector("#main");
const profileMetadata = {
  zh: {
    title: "Xianwei Guo | AI 应用开发与 Agent 工程",
    description: "Xianwei Guo，东南大学软件工程硕士在读，专注 AI 应用开发与 Agent 工程。"
  },
  en: {
    title: "Xianwei Guo | AI Application & Agent Engineering",
    description: "Xianwei Guo, a software engineering master’s student at Southeast University working on AI applications and Agent engineering."
  }
};

const translations = [...document.querySelectorAll("[data-en], [data-en-label], [data-en-alt]")].map((element) => ({
  element,
  text: element.dataset.en === undefined ? undefined : element.textContent,
  label: element.getAttribute("aria-label"),
  alt: element.getAttribute("alt")
}));

function applyLanguage(language) {
  const isEnglish = language === "en";

  document.documentElement.lang = isEnglish ? "en" : "zh-CN";

  for (const { element, text, label, alt } of translations) {
    if (text !== undefined) element.textContent = isEnglish ? element.dataset.en : text;
    if (element.dataset.enLabel) element.setAttribute("aria-label", isEnglish ? element.dataset.enLabel : label);
    if (element.dataset.enAlt) element.setAttribute("alt", isEnglish ? element.dataset.enAlt : alt);
  }

  languageButton.textContent = isEnglish ? "中文" : "English";
  languageButton.lang = isEnglish ? "zh-CN" : "en";

  const profile = profileMetadata[language];
  document.title = main.hidden ? accessTitle.textContent : profile.title;
  description.content = main.hidden ? accessDescription.textContent : profile.description;
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

accessDialog.addEventListener("cancel", (event) => event.preventDefault());

accessKey.addEventListener("input", () => {
  accessKey.removeAttribute("aria-invalid");
  accessError.textContent = "";
});

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // This static site uses a client-side gate for casual visitors.
  if (accessKey.value !== "1234") {
    accessKey.setAttribute("aria-invalid", "true");
    accessError.textContent = language === "en" ? "Incorrect access key. Try again." : "密钥不正确，请重试。";
    accessKey.focus();
    accessKey.select();
    return;
  }

  for (const element of document.querySelectorAll("[data-requires-key]")) {
    element.hidden = false;
  }
  accessForm.reset();
  accessDialog.close();
  applyLanguage(language);
  main.focus({ preventScroll: true });
  document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
});

accessDialog.showModal();
