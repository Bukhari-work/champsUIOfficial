// Also remembers dismissal during this page session if browser storage is blocked.
const dismissedAnnouncements = new Set<string>();

function isDismissed(key: string) {
  if (dismissedAnnouncements.has(key)) return true;
  try {
    return sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function rememberDismissal(key: string) {
  dismissedAnnouncements.add(key);
  try {
    sessionStorage.setItem(key, "true");
  } catch {
    // The in-memory flag still prevents repeats during client navigation.
  }
}

class AnnouncementBanner extends HTMLElement {
  private controller?: AbortController;
  private frame?: number;

  connectedCallback() {
    this.controller?.abort();
    this.cancelOpening();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const root = this.querySelector<HTMLElement>('[data-slot="dialog"]');
    const content = root?.querySelector<HTMLElement>(
      '[data-slot="dialog-content"]',
    );
    const key = this.dataset.storageKey;
    if (!root || !content || !key) return;

    let opened = false;
    let navigating = false;

    root.addEventListener(
      "dialog:change",
      (event) => {
        const change = event as CustomEvent<{ open: boolean }>;
        if (change.detail.open) opened = true;
        else if (opened) rememberDismissal(key);
      },
      { signal },
    );
    // The portal moves outside the wrapper; bind directly to its content.
    content.addEventListener(
      "click",
      (event) => {
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          event.target instanceof Element &&
          event.target.closest("a[data-announcement-cta]")
        )
          rememberDismissal(key);
        // Leave navigation to Astro, without revealing the outgoing page first.
      },
      { signal },
    );

    const scheduleOpening = () => {
      this.cancelOpening();
      // Shared Dialog initialization finishes in the page-load listeners first.
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        if (
          !this.isConnected ||
          navigating ||
          root.dataset.state !== "closed" ||
          isDismissed(key) ||
          document.querySelector(
            '[data-slot="dialog-content"]:not([hidden]), dialog[open], [data-mobile-menu-handoff]',
          )
        )
          return;
        root.dispatchEvent(
          new CustomEvent("dialog:set", { detail: { open: true } }),
        );
      });
    };

    document.addEventListener(
      "astro:before-preparation",
      () => {
        navigating = true;
        this.cancelOpening();
      },
      { signal },
    );
    document.addEventListener(
      "astro:page-load",
      () => {
        navigating = false;
        scheduleOpening();
      },
      { signal },
    );
    // Also covers a full document load or an element mounted after page-load.
    scheduleOpening();
  }

  private cancelOpening() {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }

  disconnectedCallback() {
    this.cancelOpening();
    this.controller?.abort();
  }
}

if (!customElements.get("site-announcement-banner")) {
  customElements.define("site-announcement-banner", AnnouncementBanner);
}
