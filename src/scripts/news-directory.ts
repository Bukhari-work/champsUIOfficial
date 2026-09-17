class NewsDirectory extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    this.cleanup?.();
    const form = this.querySelector<HTMLFormElement>("form")!;
    const input = form.querySelector<HTMLInputElement>('[name="q"]')!;
    const category =
      form.querySelector<HTMLSelectElement>('[name="category"]')!;
    const tag = form.querySelector<HTMLSelectElement>('[name="tag"]');
    const sort = form.querySelector<HTMLSelectElement>('[name="sort"]')!;
    const reset = form.querySelector<HTMLButtonElement>('[type="reset"]')!;
    const status = this.querySelector<HTMLElement>("[data-news-status]")!;
    const empty = this.querySelector<HTMLElement>("[data-news-empty]")!;
    const results = this.querySelector<HTMLElement>("[data-news-rows]")!;
    const featured = this.querySelector<HTMLElement>("[data-news-featured]")!;
    const table = this.querySelector<HTMLElement>("[data-news-table]")!;
    const listTitle = this.querySelector<HTMLElement>(
      "[data-news-list-title]",
    )!;
    const more = this.querySelector<HTMLButtonElement>("[data-news-more]")!;
    const language = this.dataset.language!;
    const copy = JSON.parse(this.dataset.copy!) as Record<string, string>;
    const normalize = (value: string) =>
      value.normalize("NFKC").trim().toLocaleLowerCase(language);
    const articles = Array.from(
      this.querySelectorAll<HTMLElement>("[data-news-item]"),
    ).map((element, index) => ({
      element,
      index,
      date: Number(element.dataset.date),
      promoted: element.dataset.promoted === "true",
      text: normalize(element.dataset.search!),
      categories: new Set<string>(
        (JSON.parse(element.dataset.categories!) as string[]).map(normalize),
      ),
      tags: new Set<string>(
        (JSON.parse(element.dataset.tags!) as string[]).map(normalize),
      ),
    }));
    const events = new AbortController();
    const { signal } = events;
    const pageSize = 10;
    let limit = pageSize;
    const update = (resetPage = true) => {
      const terms = normalize(input.value).split(/\s+/).filter(Boolean);
      const active = !!(terms.length || category.value || tag?.value);
      const showFeatured = !active && sort.value === "newest";
      if (resetPage) limit = pageSize;
      const ordered = [...articles].sort((a, b) => {
        if (!a.date || !b.date)
          return a.date ? -1 : b.date ? 1 : a.index - b.index;
        return (
          (sort.value === "oldest" ? a.date - b.date : b.date - a.date) ||
          a.index - b.index
        );
      });
      const matches = ordered.filter(
        (article) =>
          terms.every((term) => article.text.includes(term)) &&
          (!category.value || article.categories.has(category.value)) &&
          (!tag?.value || article.tags.has(tag.value)),
      );
      const promotedCount = showFeatured
        ? matches.filter((article) => article.promoted).length
        : 0;
      const rows = matches.filter(
        (article) => !showFeatured || !article.promoted,
      );
      const visible = new Set(rows.slice(0, limit));
      ordered.forEach((article) => {
        article.element.hidden = !visible.has(article);
      });
      results.replaceChildren(...ordered.map((article) => article.element));
      empty.hidden = matches.length !== 0;
      featured.hidden = !showFeatured || promotedCount === 0;
      table.hidden = visible.size === 0;
      listTitle.textContent = showFeatured ? copy.remaining : copy.results;
      more.hidden = rows.length <= limit;
      reset.disabled =
        !input.value &&
        !category.value &&
        !tag?.value &&
        sort.value === "newest";
      const format = new Intl.NumberFormat(language);
      status.textContent = copy.count
        .replace("{shown}", format.format(visible.size + promotedCount))
        .replace("{count}", format.format(matches.length));
    };
    form.addEventListener("input", () => update(), { signal });
    form.addEventListener("change", () => update(), { signal });
    form.addEventListener("submit", (event) => event.preventDefault(), {
      signal,
    });
    form.addEventListener(
      "reset",
      (event) => {
        event.preventDefault();
        input.value = category.value = "";
        if (tag) tag.value = "";
        sort.value = "newest";
        update();
        input.focus();
      },
      { signal },
    );
    this.querySelector("[data-news-reset]")!.addEventListener(
      "click",
      () => form.reset(),
      { signal },
    );
    more.addEventListener(
      "click",
      () => {
        const previous = new Set(
          articles
            .filter((article) => !article.element.hidden)
            .map((article) => article.element),
        );
        limit += pageSize;
        update(false);
        Array.from(results.querySelectorAll<HTMLElement>("[data-news-item]"))
          .find((element) => !element.hidden && !previous.has(element))
          ?.querySelector("a")
          ?.focus();
      },
      { signal },
    );
    update();
    form.hidden = false;
    this.cleanup = () => events.abort();
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

if (!customElements.get("news-directory"))
  customElements.define("news-directory", NewsDirectory);
