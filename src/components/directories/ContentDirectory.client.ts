import {
  matchesDirectoryYear,
  unknownDirectoryYear,
} from "@/lib/directoryYears";

class ContentDirectory extends HTMLElement {
  private controller?: AbortController;
  connectedCallback() {
    this.controller?.abort();
    const controller = (this.controller = new AbortController());
    const { signal } = controller;
    const form = this.querySelector<HTMLFormElement>("form")!;
    const query = form.querySelector<HTMLInputElement>('[name="q"]')!;
    const year = form.querySelector<HTMLSelectElement>('[name="year"]')!;
    const yearShortcuts = [
      ...this.querySelectorAll<HTMLButtonElement>("[data-directory-year]"),
    ];
    const category = form.querySelector<HTMLSelectElement>('[name="category"]');
    const categoryShortcuts = [
      ...form.querySelectorAll<HTMLButtonElement>("[data-directory-category]"),
    ];
    const filters = this.querySelector<HTMLDetailsElement>(
      "[data-directory-filters]",
    )!;
    const activeFilters = this.querySelector<HTMLElement>(
      "[data-active-filters]",
    )!;
    const reset = this.querySelector<HTMLButtonElement>(
      "[data-directory-reset]",
    )!;
    const defaultSort = this.dataset.defaultSort ?? "newest";
    const sort = form.querySelector<HTMLSelectElement>('[name="sort"]')!;
    const rows = this.querySelector<HTMLElement>("[data-directory-rows]")!;
    const empty = this.querySelector<HTMLElement>("[data-directory-empty]")!;
    const more = this.querySelector<HTMLButtonElement>("[data-directory-more]");
    const status = this.querySelector<HTMLElement>("[data-directory-status]")!;
    const normalize = (text: string) =>
      text.normalize("NFKC").trim().toLocaleLowerCase(this.dataset.language);
    const items = [
      ...rows.querySelectorAll<HTMLElement>("[data-directory-item]"),
    ].map((element, index) => ({
      element,
      index,
      text: normalize(element.dataset.search ?? ""),
      date: Number(element.dataset.date),
    }));
    const pageSize =
      this.dataset.paginate === "false"
        ? Number.POSITIVE_INFINITY
        : Number(this.dataset.pageSize ?? 12);
    const groups = [
      ...rows.querySelectorAll<HTMLElement>("[data-directory-group]"),
    ].map((element) => ({
      element,
      year: element.dataset.groupYear ?? "",
      rows: element.querySelector<HTMLElement>("[data-directory-group-rows]")!,
      header: element.querySelector<HTMLElement>(
        "[data-directory-group-header]",
      )!,
      heading: element.querySelector<HTMLElement>(
        "[data-directory-group-heading]",
      )!,
      headingText: element.querySelector<HTMLElement>(
        "[data-directory-group-heading]",
      )!.textContent!,
      recent: element.querySelector<HTMLElement>("[data-directory-recent]"),
      members: new Set(items.filter((item) => element.contains(item.element))),
    }));
    let limit = pageSize;
    const update = (resetLimit = true) => {
      if (resetLimit) limit = pageSize;
      const terms = normalize(query.value).split(/\s+/).filter(Boolean);
      const ordered = [...items].sort((a, b) => {
        if (!a.date || !b.date)
          return Number(!a.date) - Number(!b.date) || a.index - b.index;
        return (
          (sort.value === "oldest" ? a.date - b.date : b.date - a.date) ||
          a.index - b.index
        );
      });
      const matches = ordered.filter(
        (item) =>
          terms.every((term) => item.text.includes(term)) &&
          matchesDirectoryYear(item.element.dataset.year ?? "", year.value) &&
          (!category?.value ||
            item.element.dataset.category === category.value),
      );
      const visible = new Set(matches.slice(0, limit));
      ordered.forEach((item) => (item.element.hidden = !visible.has(item)));
      if (groups.length) {
        for (const group of groups) {
          const members = ordered.filter((item) => group.members.has(item));
          group.rows.replaceChildren(...members.map((item) => item.element));
          group.element.hidden = members.every((item) => item.element.hidden);
        }
        const sortedGroups = [...groups].sort((a, b) => {
          if (!a.year || !b.year) return Number(!a.year) - Number(!b.year);
          return sort.value === "oldest"
            ? a.year.localeCompare(b.year)
            : b.year.localeCompare(a.year);
        });
        let hasVisibleHeading = false;
        for (const group of sortedGroups) {
          group.header.hidden = Boolean(year.value) && hasVisibleHeading;
          group.heading.textContent =
            year.value && year.value !== unknownDirectoryYear
              ? year.value
              : group.headingText;
          if (group.recent) group.recent.hidden = Boolean(year.value);
          if (!group.element.hidden) hasVisibleHeading = true;
        }
        rows.replaceChildren(...sortedGroups.map((group) => group.element));
      } else rows.replaceChildren(...ordered.map((item) => item.element));
      empty.hidden = matches.length > 0;
      if (more) more.hidden = matches.length <= limit;
      const selected =
        Number(Boolean(query.value.trim())) +
        Number(Boolean(year.value)) +
        Number(Boolean(category?.value)) +
        Number(sort.value !== defaultSort);
      activeFilters.textContent = selected ? String(selected) : "";
      activeFilters.hidden = selected === 0;
      // Keep its space reserved without exposing an inactive control to focus.
      reset.hidden = false;
      reset.classList.toggle("invisible", selected === 0);
      reset.disabled = selected === 0;
      yearShortcuts.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.directoryYear === year.value),
        ),
      );
      categoryShortcuts.forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.directoryCategory === (category?.value ?? "")),
        ),
      );
      status.textContent = this.dataset
        .countLabel!.replace("{shown}", String(visible.size))
        .replace("{count}", String(matches.length));
    };
    form.addEventListener("submit", (event) => event.preventDefault(), {
      signal,
    });
    form.addEventListener("input", () => update(), { signal });
    form.addEventListener("change", () => update(), { signal });
    yearShortcuts.forEach((button) =>
      button.addEventListener(
        "click",
        () => {
          year.value = button.dataset.directoryYear ?? "";
          update();
        },
        { signal },
      ),
    );
    categoryShortcuts.forEach((button) =>
      button.addEventListener(
        "click",
        () => {
          if (!category) return;
          category.value = button.dataset.directoryCategory ?? "";
          update();
        },
        { signal },
      ),
    );
    form.addEventListener(
      "reset",
      (event) => {
        event.preventDefault();
        query.value = year.value = "";
        if (category) category.value = "";
        sort.value = defaultSort;
        update();
        if (filters.open) query.focus();
        else filters.querySelector("summary")?.focus();
      },
      { signal },
    );
    more?.addEventListener(
      "click",
      () => {
        const previouslyVisible = new Set(
          items
            .filter((item) => !item.element.hidden)
            .map((item) => item.element),
        );
        limit += pageSize;
        update(false);
        const next = [
          ...rows.querySelectorAll<HTMLElement>("[data-directory-item]"),
        ].find((element) => !element.hidden && !previouslyVisible.has(element));
        if (next) {
          const link = next.querySelector<HTMLAnchorElement>("a");
          if (link) link.focus();
          else {
            next.tabIndex = -1;
            next.focus();
          }
        }
      },
      { signal },
    );
    update();
    this.querySelectorAll<HTMLElement>("[data-directory-controls]").forEach(
      (element) => (element.hidden = false),
    );
    this.dataset.ready = "";
  }
  disconnectedCallback() {
    this.controller?.abort();
  }
}
if (!customElements.get("content-directory"))
  customElements.define("content-directory", ContentDirectory);
