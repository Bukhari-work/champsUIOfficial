// Without JavaScript, the anchors lead to four directly readable expertise areas.
class ExpertiseNavigation extends HTMLElement {
  private controller?: AbortController;

  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const list = this.querySelector<HTMLElement>("[data-expertise-tablist]");
    const tabs = [
      ...this.querySelectorAll<HTMLAnchorElement>("[data-expertise-tab]"),
    ];
    const panels = [
      ...this.querySelectorAll<HTMLElement>("[data-expertise-panel]"),
    ];
    if (!list || !tabs.length || tabs.length !== panels.length) return;
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", "horizontal");
    tabs.forEach((tab, index) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[index].id);
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", tab.id);
      panels[index].tabIndex = 0;
    });
    const activate = (index: number, focus = false, syncUrl = false) => {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus({ preventScroll: true });
      if (syncUrl) {
        const url = new URL(window.location.href);
        url.hash = panels[index].id;
        window.history.replaceState(window.history.state, "", url);
      }
    };
    const indexFromHash = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return -1;
      }
      const target = document.getElementById(id);
      const panel = target?.closest<HTMLElement>("[data-expertise-panel]");
      return panel ? panels.indexOf(panel) : -1;
    };
    const initial = indexFromHash();
    activate(initial >= 0 ? initial : 0);
    this.dataset.ready = "";
    tabs.forEach((tab, index) => {
      tab.addEventListener(
        "click",
        (event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          activate(index, true, true);
        },
        { signal },
      );
      tab.addEventListener(
        "keydown",
        (event) => {
          let next: number;
          switch (event.key) {
            case "ArrowRight":
              next = (index + 1) % tabs.length;
              break;
            case "ArrowLeft":
              next = (index - 1 + tabs.length) % tabs.length;
              break;
            case "Home":
              next = 0;
              break;
            case "End":
              next = tabs.length - 1;
              break;
            case " ":
            case "Enter":
              next = index;
              break;
            default:
              return;
          }
          event.preventDefault();
          activate(next, true, true);
        },
        { signal },
      );
    });
    window.addEventListener(
      "hashchange",
      () => {
        const index = indexFromHash();
        if (index >= 0) activate(index);
      },
      { signal },
    );
  }
  disconnectedCallback() {
    this.controller?.abort();
  }
}
if (!customElements.get("expertise-navigation"))
  customElements.define("expertise-navigation", ExpertiseNavigation);
