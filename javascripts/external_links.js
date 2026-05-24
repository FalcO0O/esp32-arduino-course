// Funkcja dodająca target="_blank" oraz rel="noopener noreferrer" do wszystkich linków zewnętrznych
function makeExternalLinksOpenInNewTab() {
  const links = document.querySelectorAll("a[href^='http']");
  links.forEach(link => {
    if (!link.href.includes(window.location.host)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

// Obsługa standardowego załadowania strony
document.addEventListener("DOMContentLoaded", makeExternalLinksOpenInNewTab);

// Wsparcie dla funkcji instant loading w motywie Material for MkDocs (jeśli zostanie włączona w przyszłości)
if (typeof document$ !== "undefined") {
  document$.subscribe(makeExternalLinksOpenInNewTab);
}
