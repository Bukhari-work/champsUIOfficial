class PartnerMarquee extends HTMLElement {
  private observer?: ResizeObserver;

  connectedCallback() {
    this.observer?.disconnect();
    const marquee = this.querySelector<HTMLElement>("[data-marquee]");
    const track = marquee?.querySelector<HTMLElement>(".marquee-content");
    const speed = Number(this.dataset.speed);
    if (!marquee || !track || !Number.isFinite(speed) || speed <= 0) return;

    const updateDuration = () => {
      // Bejamas translates one complete track per loop, including its padding.
      const width = track.getBoundingClientRect().width;
      if (width > 0)
        marquee.style.setProperty("--duration", `${width / speed}s`);
    };

    updateDuration();
    this.observer = new ResizeObserver(updateDuration);
    this.observer.observe(track);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }
}

if (!customElements.get("partner-marquee"))
  customElements.define("partner-marquee", PartnerMarquee);
