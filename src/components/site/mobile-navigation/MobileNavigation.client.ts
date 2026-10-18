import { bindMenuLinks } from "./MobileNavigationLinks.client";

class MobileNavigation extends HTMLElement {
  private controller?: AbortController;

  connectedCallback() {
    this.controller = new AbortController();
    const root = this.closest<HTMLElement>('[data-slot="dialog"]');
    if (!root) return;

    // Same-page choices dismiss the menu without a redundant page navigation.
    const content = this.querySelector<HTMLElement>(
      '[data-slot="dialog-content"]',
    );
    if (content)
      bindMenuLinks(
        content,
        () => {
          root.dispatchEvent(
            new CustomEvent("dialog:set", { detail: { open: false } }),
          );
        },
        this.controller.signal,
      );

    // All other links keep the modal open until Astro swaps in their destination.
    const desktop = matchMedia("(min-width: 1024px)");
    desktop.addEventListener(
      "change",
      (event) => {
        if (event.matches) {
          root.dispatchEvent(
            new CustomEvent("dialog:set", { detail: { open: false } }),
          );
        }
      },
      { signal: this.controller.signal },
    );
  }

  disconnectedCallback() {
    this.controller?.abort();
  }
}

if (!customElements.get("site-mobile-navigation")) {
  customElements.define("site-mobile-navigation", MobileNavigation);
}
