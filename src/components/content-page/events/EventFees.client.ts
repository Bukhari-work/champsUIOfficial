import { getFeeState } from "./FeeState";

// Static builds can outlive a rate's deadline. Refresh on connection, when a
// background tab returns, and at the next pricing boundary without polling.
class EventFees extends HTMLElement {
  private timer?: ReturnType<typeof setTimeout>;
  private controller?: AbortController;

  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const check = () => {
      clearTimeout(this.timer);
      if (this.dataset.archived === "true") return;
      const now = Date.now();
      let next = Infinity;
      const rates = [...this.querySelectorAll<HTMLElement>("[data-fee-rate]")];
      for (const rate of rates) {
        const state = getFeeState(
          {
            opensAt: rate.dataset.opensAt,
            closesAt: rate.dataset.closesAt,
          },
          now,
        );
        rate.dataset.state = state;
        const status = rate.querySelector<HTMLElement>("[data-fee-status]");
        if (status) {
          status.hidden = state === "standard";
          status.textContent =
            state === "standard" ? "" : (status.dataset[state] ?? "");
        }
        for (const date of [rate.dataset.opensAt, rate.dataset.closesAt]) {
          const boundary = date ? Date.parse(date) : NaN;
          if (boundary > now) next = Math.min(next, boundary);
        }
      }
      const empty = this.querySelector<HTMLElement>("[data-fee-empty]");
      const visibleRateCount = rates.filter(
        (rate) => rate.dataset.state !== "ended",
      ).length;
      if (empty) empty.hidden = !rates.length || visibleRateCount > 0;
      const overflow = this.querySelector<HTMLElement>(
        "[data-fee-overflow-summary]",
      );
      if (overflow) {
        overflow.hidden = visibleRateCount <= 4;
        const count = overflow.querySelector<HTMLElement>(
          "[data-fee-option-count]",
        );
        if (count) count.textContent = String(visibleRateCount);
        const list = this.querySelector<HTMLElement>("[data-fee-list]");
        if (list) list.hidden = visibleRateCount > 4;
      }
      if (Number.isFinite(next))
        this.timer = setTimeout(check, Math.min(next - now, 2147483647));
    };
    document.addEventListener("visibilitychange", check, {
      signal: this.controller.signal,
    });
    check();
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
    this.controller?.abort();
  }
}

if (!customElements.get("event-fees"))
  customElements.define("event-fees", EventFees);
