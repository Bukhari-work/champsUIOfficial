class PhotoGallery extends HTMLElement {
  private controller?: AbortController;
  private heightFrame?: number;

  connectedCallback() {
    this.cleanup();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const viewport = this.querySelector<HTMLElement>("[data-photo-items]");
    const items = [
      ...this.querySelectorAll<HTMLElement>("[data-detail-photo]"),
    ];
    const controls = this.querySelector<HTMLElement>("[data-photo-controls]");
    const thumbnails = this.querySelector<HTMLElement>(
      "[data-photo-thumbnails]",
    );
    const choices = [
      ...this.querySelectorAll<HTMLButtonElement>("[data-photo-thumbnail]"),
    ];
    const previous = this.querySelector<HTMLButtonElement>("[data-photo-prev]");
    const next = this.querySelector<HTMLButtonElement>("[data-photo-next]");
    const status = this.querySelector<HTMLElement>("[data-photo-status]");
    if (!viewport || !items.length) return;
    let index = 0;
    const render = () => {
      const interactive = items.length > 1;
      if (controls) controls.hidden = !interactive;
      if (thumbnails) thumbnails.hidden = !interactive;
      if (interactive) viewport.tabIndex = 0;
      else viewport.removeAttribute("tabindex");
      items.forEach((item, i) => {
        item.hidden = i !== index;
      });
      choices.forEach((choice, i) =>
        choice.setAttribute("aria-pressed", String(i === index)),
      );
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === items.length - 1;
      if (status)
        status.textContent = (this.dataset.photoCounter ?? "")
          .replace("{current}", String(index + 1))
          .replace("{total}", String(items.length));
    };
    const measureStableHeight = () => {
      if (!this.hasAttribute("data-photo-stable-height")) return;
      if (!viewport.getClientRects().length) return;
      // Measure the natural heights at the current width, including after shrinking.
      viewport.style.minHeight = "";
      items.forEach((item) => (item.hidden = false));
      const height = Math.max(...items.map((item) => item.offsetHeight));
      items.forEach((item, i) => (item.hidden = i !== index));
      viewport.style.minHeight = `${height}px`;
    };
    const select = (target: number) => {
      index = Math.max(0, Math.min(items.length - 1, target));
      render();
    };
    previous?.addEventListener("click", () => select(index - 1), { signal });
    next?.addEventListener("click", () => select(index + 1), { signal });
    choices.forEach((choice, i) =>
      choice.addEventListener("click", () => select(i), { signal }),
    );
    viewport.addEventListener(
      "keydown",
      (event) => {
        if (
          event.target !== viewport ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.isComposing
        )
          return;
        const target =
          event.key === "ArrowLeft"
            ? index - 1
            : event.key === "ArrowRight"
              ? index + 1
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? items.length - 1
                  : undefined;
        if (target !== undefined) {
          event.preventDefault();
          select(target);
        }
      },
      { signal },
    );
    render();
    if (this.hasAttribute("data-photo-stable-height")) {
      const scheduleMeasurement = () => {
        if (this.heightFrame !== undefined)
          cancelAnimationFrame(this.heightFrame);
        this.heightFrame = requestAnimationFrame(() => {
          this.heightFrame = undefined;
          measureStableHeight();
        });
      };
      window.addEventListener("resize", scheduleMeasurement, { signal });
      scheduleMeasurement();
      void document.fonts.ready.then(() => {
        if (!signal.aborted) scheduleMeasurement();
      });
    }
    this.dataset.ready = "";
  }

  private cleanup() {
    this.controller?.abort();
    if (this.heightFrame !== undefined) cancelAnimationFrame(this.heightFrame);
    this.heightFrame = undefined;
  }
  disconnectedCallback() {
    this.cleanup();
  }
}
if (!customElements.get("photo-gallery"))
  customElements.define("photo-gallery", PhotoGallery);
