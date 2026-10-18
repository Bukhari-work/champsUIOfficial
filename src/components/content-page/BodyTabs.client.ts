import { navigate } from "astro:transitions/client";

// One content page, several author-chosen views. Without enhancement all content reads
// in document order.
class BodyTabs extends HTMLElement {
  private controller?: AbortController;

  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const frame = this.closest<HTMLElement>("[data-detail-page]");
    const navigation = this.querySelector<HTMLElement>("[data-body-views]");
    const tablist = this.querySelector<HTMLElement>("[data-body-tablist]");
    const tabs = [
      ...this.querySelectorAll<HTMLAnchorElement>("[data-body-tab]"),
    ];
    const panels = [...this.querySelectorAll<HTMLElement>("[data-body-view]")];
    if (!frame || !navigation || !tablist || !panels.length) return;
    const initialView = panels[0].dataset.bodyView;
    if (!initialView) return;
    let selected = initialView;
    let enhanced = false;
    const printMedia = window.matchMedia("print");
    const hashTarget = () => {
      try {
        return document.getElementById(
          decodeURIComponent(location.hash.slice(1)),
        );
      } catch {
        return null;
      }
    };
    const panelFor = (target: Element | null) =>
      panels.find(
        (panel) => panel === target || (target && panel.contains(target)),
      );
    const select = (key: string, updateUrl = false) => {
      if (!panels.some((panel) => panel.dataset.bodyView === key)) return;
      selected = key;
      for (const panel of panels) {
        panel.hidden = enhanced && panel.dataset.bodyView !== selected;
        if (enhanced) {
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", `${panel.id}-tab`);
          panel.tabIndex = 0;
        } else {
          panel.removeAttribute("role");
          panel.removeAttribute("tabindex");
          panel.setAttribute("aria-labelledby", `${panel.id}-heading`);
        }
      }
      for (const tab of tabs) {
        if (enhanced) {
          tab.setAttribute("role", "tab");
          tab.setAttribute("aria-controls", `body-view-${tab.dataset.bodyTab}`);
          tab.setAttribute(
            "aria-selected",
            String(tab.dataset.bodyTab === selected),
          );
          tab.tabIndex = tab.dataset.bodyTab === selected ? 0 : -1;
        } else {
          for (const attribute of [
            "role",
            "aria-controls",
            "aria-selected",
            "tabindex",
          ])
            tab.removeAttribute(attribute);
        }
      }
      if (updateUrl) {
        const url = new URL(location.href);
        url.hash = `body-view-${selected}`;
        // Keep Astro's same-document history in sync, without moving the reader
        // away from the tab strip when the hash points to the selected panel.
        const { scrollX: left, scrollY: top } = window;
        const focusedTab = tabs.find((tab) => tab === document.activeElement);
        void navigate(url.href).then(() => {
          if (!signal.aborted) {
            focusedTab?.focus({ preventScroll: true });
            window.scrollTo({ left, top, behavior: "instant" });
          }
        });
      }
    };
    const configure = () => {
      enhanced = panels.length > 1 && !printMedia.matches;
      navigation.hidden = !enhanced;
      this.toggleAttribute("data-enhanced", enhanced);
      if (enhanced) tablist.setAttribute("role", "tablist");
      else tablist.removeAttribute("role");
      select(panelFor(hashTarget())?.dataset.bodyView ?? selected);
    };
    const revealHash = () => {
      if (!enhanced) return;
      const target = hashTarget();
      const panel = panelFor(target);
      if (!panel) return;
      select(panel.dataset.bodyView!);
      requestAnimationFrame(() => {
        if (!signal.aborted) target?.scrollIntoView({ block: "start" });
      });
    };
    this.addEventListener(
      "click",
      (event) => {
        const tab =
          event.target instanceof Element
            ? event.target.closest<HTMLAnchorElement>("[data-body-tab]")
            : null;
        if (
          !enhanced ||
          !tab ||
          !this.contains(tab) ||
          (event instanceof MouseEvent &&
            (event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0))
        )
          return;
        event.preventDefault();
        if (tab.dataset.bodyTab !== selected)
          select(tab.dataset.bodyTab!, true);
      },
      { signal },
    );
    this.addEventListener(
      "keydown",
      (event) => {
        if (
          !enhanced ||
          !(event.target instanceof HTMLAnchorElement) ||
          !event.target.matches("[data-body-tab]")
        )
          return;
        const index = tabs.indexOf(event.target);
        const destination =
          event.key === "ArrowRight"
            ? (index + 1) % tabs.length
            : event.key === "ArrowLeft"
              ? (index + tabs.length - 1) % tabs.length
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? tabs.length - 1
                  : -1;
        if (destination >= 0) {
          event.preventDefault();
          tabs.forEach((tab, tabIndex) => {
            tab.tabIndex = tabIndex === destination ? 0 : -1;
          });
          tabs[destination].focus();
        } else if (event.key === " ") {
          event.preventDefault();
          if (event.target.dataset.bodyTab !== selected)
            select(event.target.dataset.bodyTab!, true);
        }
      },
      { signal },
    );
    // Reveal a hidden destination before the browser performs native anchor
    // scrolling, including actions in the shared header and local jump links.
    document.addEventListener(
      "click",
      (event) => {
        if (
          !enhanced ||
          event.defaultPrevented ||
          !(event.target instanceof Element) ||
          (event instanceof MouseEvent &&
            (event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0))
        )
          return;
        const link = event.target.closest<HTMLAnchorElement>("a[href]");
        if (!link || link.matches("[data-body-tab]")) return;
        const url = new URL(link.href);
        if (
          url.origin !== location.origin ||
          url.pathname !== location.pathname ||
          url.search !== location.search ||
          !url.hash
        )
          return;
        let target: HTMLElement | null = null;
        try {
          target = document.getElementById(
            decodeURIComponent(url.hash.slice(1)),
          );
        } catch {
          return;
        }
        const panel = panelFor(target);
        if (panel) select(panel.dataset.bodyView!);
      },
      { signal, capture: true },
    );
    const syncHistory = () => {
      const target = hashTarget();
      if (enhanced && (!location.hash || location.hash === `#${frame.id}`))
        select(panels[0].dataset.bodyView!);
      else if (enhanced && target && panels.includes(target))
        select(target.dataset.bodyView!);
      else revealHash();
    };
    window.addEventListener("hashchange", syncHistory, { signal });
    window.addEventListener("popstate", syncHistory, { signal });
    document.addEventListener("astro:page-load", syncHistory, { signal });
    printMedia.addEventListener("change", configure, { signal });
    configure();
    revealHash();
  }

  disconnectedCallback() {
    this.controller?.abort();
  }
}
if (!customElements.get("body-tabs"))
  customElements.define("body-tabs", BodyTabs);
