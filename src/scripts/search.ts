interface SearchResult {
  url: string;
  excerpt: string;
  meta: { title?: string };
}

interface SearchHit {
  data: () => Promise<SearchResult>;
}

interface Pagefind {
  init: () => Promise<void>;
  destroy: () => Promise<void>;
  search: (
    query: string | null,
    options?: { filters: Record<string, string> },
  ) => Promise<{
    results: SearchHit[];
  }>;
}

let engineLanguage: string;
let engineReady: Promise<Pagefind> | undefined;
let importAttempt = 0;

function loadEngine(language: string): Promise<Pagefind> {
  if (!engineReady || engineLanguage !== language) {
    const previous = engineReady;
    engineLanguage = language;
    engineReady = (async () => {
      await previous?.catch(() => undefined);
      // Generated after Astro builds; Vite must leave this import for the browser.
      const suffix = importAttempt ? `?retry=${importAttempt}` : "";
      const path = `${import.meta.env.BASE_URL}pagefind/pagefind.js${suffix}`;
      const engine: Pagefind = await import(/* @vite-ignore */ path).catch(
        (error) => {
          // Browsers cache failed module imports; a retry needs a fresh URL.
          importAttempt++;
          throw error;
        },
      );
      // Astro can switch languages without reloading this module.
      await engine.destroy();
      await engine.init();
      return engine;
    })().catch((error) => {
      if (engineLanguage === language) engineReady = undefined;
      throw error;
    });
  }
  return engineReady;
}

class SiteSearch extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    this.cleanup?.();
    const dialog = this.querySelector<HTMLDialogElement>("dialog")!;
    const input = this.querySelector<HTMLInputElement>("input")!;
    const form = this.querySelector<HTMLFormElement>("form")!;
    const status = this.querySelector<HTMLElement>("[data-search-status]")!;
    const hint = this.querySelector<HTMLElement>("[data-search-hint]")!;
    const list = this.querySelector<HTMLUListElement>("ul")!;
    const content = this.querySelector<HTMLElement>("[data-search-content]")!;
    const clear = this.querySelector<HTMLButtonElement>("[data-search-clear]")!;
    const more = this.querySelector<HTMLButtonElement>("[data-search-more]")!;
    const retry = this.querySelector<HTMLButtonElement>("[data-search-retry]")!;
    const template = this.querySelector<HTMLTemplateElement>("template")!;
    const facets = Array.from(
      this.querySelectorAll<HTMLButtonElement>("[data-search-facet]"),
    );
    const copy: Record<string, string> = JSON.parse(this.dataset.copy!);
    const language = this.dataset.language!;
    const events = new AbortController();
    const { signal } = events;
    let timer: ReturnType<typeof setTimeout>;
    let revision = 0;
    let hits: SearchHit[] = [];
    let displayed = 0;
    let activeFacet = "all";
    let returnFocus: HTMLElement | null = null;
    const pageSize = 8;

    const isCurrent = (id: number) =>
      id === revision && this.isConnected && dialog.open;
    const setBusy = (busy: boolean) => {
      list.setAttribute("aria-busy", String(busy));
      more.disabled = busy;
      list.inert = busy;
    };
    const reset = () => {
      clearTimeout(timer);
      revision++;
      hits = [];
      displayed = 0;
      list.replaceChildren();
      more.hidden = true;
      retry.hidden = true;
      clear.hidden = !input.value;
      hint.hidden = !!input.value.trim() || activeFacet !== "all";
      facets.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.searchFacet === activeFacet),
        );
      });
      setBusy(false);
      status.textContent = copy.idle;
    };
    const summary = (query: string) =>
      (query ? copy.count : copy.browse)
        .replace("{count}", new Intl.NumberFormat(language).format(hits.length))
        .replace("{query}", () => query);

    const renderPage = async (
      id: number,
      query: string,
      focusNew = false,
      replace = false,
    ) => {
      setBusy(true);
      const results = await Promise.all(
        hits.slice(displayed, displayed + pageSize).map((hit) => hit.data()),
      );
      if (!isCurrent(id)) return;
      const fragment = document.createDocumentFragment();
      for (const result of results) {
        const item = template.content.cloneNode(true) as DocumentFragment;
        const link = item.querySelector<HTMLAnchorElement>("a")!;
        const url = new URL(result.url, location.origin);
        if (
          url.origin !== location.origin ||
          !["https:", "http:"].includes(url.protocol)
        )
          continue;
        link.href = url.href;
        item.querySelector("[data-result-title]")!.textContent =
          result.meta.title || url.pathname;
        item.querySelector("[data-result-path]")!.textContent =
          decodeURI(url.pathname).replace(/\/$/, "") || "/";
        // Pagefind escapes excerpt content and adds only its own <mark> tags.
        item.querySelector("[data-result-excerpt]")!.innerHTML = result.excerpt;
        fragment.append(item);
      }
      const firstNewLink = fragment.querySelector<HTMLAnchorElement>("a");
      if (replace) {
        list.replaceChildren(fragment);
        content.scrollTop = 0;
      } else list.append(fragment);
      displayed += results.length;
      more.hidden = displayed >= hits.length;
      status.textContent = summary(query);
      setBusy(false);
      if (focusNew) firstNewLink?.focus();
    };
    const showError = (id: number) => {
      if (!isCurrent(id)) return;
      engineReady = undefined;
      list.replaceChildren();
      setBusy(false);
      more.hidden = true;
      retry.hidden = false;
      status.textContent = copy.error;
    };
    const search = async () => {
      clearTimeout(timer);
      const id = ++revision;
      const query = input.value.trim();
      if (!query && activeFacet === "all") {
        reset();
        return;
      }
      clear.hidden = !input.value;
      hint.hidden = true;
      retry.hidden = true;
      facets.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.searchFacet === activeFacet),
        ),
      );
      status.textContent = copy.loading;
      setBusy(true);
      try {
        const engine = await loadEngine(language);
        if (!isCurrent(id)) return;
        const response = await engine.search(query || null, {
          filters: activeFacet === "all" ? {} : { type: activeFacet },
        });
        if (!isCurrent(id)) return;
        hits = response.results;
        displayed = 0;
        if (!hits.length) {
          list.replaceChildren();
          more.hidden = true;
          content.scrollTop = 0;
          status.textContent =
            activeFacet === "all"
              ? copy.empty.replace("{query}", () => query)
              : copy.emptyFilter;
          setBusy(false);
          return;
        }
        await renderPage(id, query, false, true);
      } catch {
        showError(id);
      }
    };
    const open = () => {
      // Avoid stacking native search over another modal, including its exit animation.
      if (
        dialog.open ||
        document.querySelector('[data-slot="dialog-content"]:not([hidden])')
      )
        return;
      returnFocus =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const tools = document.getElementById("site-tools");
      if (tools instanceof HTMLDetailsElement && tools.open) {
        returnFocus = tools.querySelector("summary");
        tools.open = false;
      }
      dialog.showModal();
      input.focus();
      // Warm the index on demand. Search displays an error if loading fails.
      void loadEngine(language).catch(() => undefined);
    };

    document.querySelectorAll("[data-search-shortcut]").forEach((label) => {
      label.textContent = /Mac|iPhone|iPad/.test(navigator.platform)
        ? "⌘ K"
        : "Ctrl K";
    });
    document.addEventListener(
      "click",
      (event) => {
        if (
          event.target instanceof Element &&
          event.target.closest("[data-open-site-search]")
        )
          open();
      },
      { signal },
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === "k"
        ) {
          event.preventDefault();
          dialog.open ? dialog.close() : open();
        }
      },
      { signal },
    );
    this.querySelector("[data-search-close]")!.addEventListener(
      "click",
      () => dialog.close(),
      { signal },
    );
    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) dialog.close();
      },
      { signal },
    );
    dialog.addEventListener(
      "close",
      () => {
        input.value = "";
        activeFacet = "all";
        reset();
        if (returnFocus?.isConnected) returnFocus.focus();
      },
      { signal },
    );
    input.addEventListener(
      "input",
      () => {
        clearTimeout(timer);
        revision++; // Invalidate earlier requests immediately, before the debounce.
        clear.hidden = !input.value;
        if (!input.value.trim() && activeFacet === "all") {
          reset();
          return;
        }
        hint.hidden = true;
        setBusy(true);
        status.textContent = copy.loading;
        timer = setTimeout(() => void search(), 200);
      },
      { signal },
    );
    clear.addEventListener(
      "click",
      () => {
        input.value = "";
        void search();
        input.focus();
      },
      { signal },
    );
    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        void search();
      },
      { signal },
    );
    more.addEventListener(
      "click",
      () => {
        const id = revision;
        void renderPage(id, input.value.trim(), true).catch(() =>
          showError(id),
        );
      },
      { signal },
    );
    retry.addEventListener("click", () => void search(), { signal });
    facets.forEach((button) =>
      button.addEventListener(
        "click",
        () => {
          if (activeFacet === button.dataset.searchFacet) return;
          activeFacet = button.dataset.searchFacet!;
          void search();
        },
        { signal },
      ),
    );
    dialog.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && !event.isComposing) {
          event.preventDefault();
          dialog.close();
          return;
        }
        if (
          !["ArrowDown", "ArrowUp"].includes(event.key) ||
          event.altKey ||
          event.metaKey ||
          event.ctrlKey ||
          event.isComposing
        )
          return;
        const links = Array.from(list.querySelectorAll<HTMLAnchorElement>("a"));
        const index = links.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        if (document.activeElement !== input && index < 0) return;
        const next = event.key === "ArrowDown" ? index + 1 : index - 1;
        event.preventDefault();
        if (next < 0) input.focus();
        else links[Math.min(next, links.length - 1)]?.focus();
      },
      { signal },
    );
    document.addEventListener("astro:before-swap", () => dialog.close(), {
      signal,
    });
    this.cleanup = () => {
      events.abort();
      clearTimeout(timer);
      revision++;
      dialog.close();
    };
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

if (!customElements.get("site-search"))
  customElements.define("site-search", SiteSearch);
