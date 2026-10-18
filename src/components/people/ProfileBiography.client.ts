class ProfileBiography extends HTMLElement {
  private controller?: AbortController;
  private observer?: ResizeObserver;

  connectedCallback() {
    this.controller?.abort();
    this.observer?.disconnect();
    const controller = (this.controller = new AbortController());
    const content = this.querySelector<HTMLElement>(
      "[data-biography-content]",
    )!;
    const controls = this.querySelector<HTMLElement>(
      "[data-biography-controls]",
    )!;
    const button = this.querySelector<HTMLButtonElement>(
      "[data-biography-toggle]",
    )!;
    const fade = this.querySelector<HTMLElement>("[data-biography-fade]")!;
    let expanded = false;
    let width = -1;

    const update = () => {
      if (controller.signal.aborted) return;
      // Measure the real cutoff at the current font size and available width.
      content.setAttribute("data-collapsed", "");
      const overflowing = content.scrollHeight > content.clientHeight + 1;
      const collapsed = overflowing && !expanded;
      content.toggleAttribute("data-collapsed", collapsed);
      controls.hidden = !overflowing;
      fade.hidden = !collapsed;
      button.setAttribute("aria-expanded", String(!collapsed));
      button.textContent = collapsed ? this.dataset.more! : this.dataset.less!;
    };
    button.addEventListener(
      "click",
      () => {
        expanded = !expanded;
        update();
      },
      { signal: controller.signal },
    );
    this.observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      update();
    });
    this.observer.observe(content);
    update();
    void document.fonts.ready.then(update);
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.observer?.disconnect();
  }
}

if (!customElements.get("profile-biography"))
  customElements.define("profile-biography", ProfileBiography);
