import { getStickySidebarTop } from "./SidebarStickyPosition";

// CSS handles scrolling and the article boundary. JS calculates the inset from
// viewport/header/card sizes, including bottom-aligned sticky for tall cards.
class SidebarSticky extends HTMLElement {
  private controller?: AbortController;
  private observer?: ResizeObserver;
  private frameId?: number;

  connectedCallback() {
    this.cleanup();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const header = document.getElementById("site-header");
    const print = window.matchMedia("print");
    const update = () => {
      this.frameId = undefined;
      if (signal.aborted) return;
      // Read the Tailwind desktop inset, not a previously calculated tall-card
      // inset. Both writes finish in one frame, with no intermediate paint.
      this.style.removeProperty("top");
      const top = Number.parseFloat(getComputedStyle(this).top);
      const gap = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const stickyTop = !print.matches
        ? getStickySidebarTop({
            viewportHeight: window.innerHeight,
            top,
            cardHeight: this.getBoundingClientRect().height,
            bottomGap: gap,
            headerBottom: header?.getBoundingClientRect().bottom ?? 0,
          })
        : undefined;
      this.toggleAttribute("data-sticky-ready", stickyTop !== undefined);
      if (stickyTop !== undefined) this.style.top = `${stickyTop}px`;
    };
    const schedule = () => {
      if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
      this.frameId = requestAnimationFrame(update);
    };
    this.observer = new ResizeObserver(schedule);
    this.observer.observe(this);
    if (header) this.observer.observe(header);
    window.addEventListener("resize", schedule, { signal });
    document.addEventListener("astro:page-load", schedule, { signal });
    print.addEventListener("change", schedule, { signal });
    update();
  }

  private cleanup() {
    this.controller?.abort();
    this.observer?.disconnect();
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
    this.frameId = undefined;
    this.style.removeProperty("top");
    this.removeAttribute("data-sticky-ready");
  }
  disconnectedCallback() {
    this.cleanup();
  }
}
if (!customElements.get("sidebar-sticky"))
  customElements.define("sidebar-sticky", SidebarSticky);
