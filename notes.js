/* Small enhancements for the generated notes pages (see tools/build-notes.mjs).
   The pages are complete without this script; it adds tag filtering and reading progress. */
(() => {
  const filters = document.querySelector("#notes-filters");
  if (filters) {
    const rows = [...document.querySelectorAll("#notes-all .note-row")];
    const buttons = [...filters.querySelectorAll("button")];
    const tagOf = (button) => button.dataset.tag ?? null;

    function select(tag, remember) {
      for (const button of buttons) button.setAttribute("aria-pressed", String(tagOf(button) === tag));
      for (const row of rows) row.hidden = tag !== null && !row.dataset.tags.split("|").includes(tag);
      if (!remember) return;
      try {
        const url = new URL(location.href);
        if (tag) url.searchParams.set("tag", tag); else url.searchParams.delete("tag");
        history.replaceState(null, "", url);
      } catch {
        // Some browsers refuse history changes on file:// pages. Filtering still works.
      }
    }

    for (const button of buttons) button.addEventListener("click", () => select(tagOf(button), true));
    const requested = new URLSearchParams(location.search).get("tag");
    select(buttons.some((button) => tagOf(button) === requested) ? requested : null, false);
    filters.hidden = false;
  }

  const progress = document.querySelector("#scroll-progress");
  if (progress) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
