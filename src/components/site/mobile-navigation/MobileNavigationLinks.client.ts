/** Dismiss a same-page choice; all real navigation stays covered until the swap. */
export function bindMenuLinks(
  content: HTMLElement,
  close: () => void,
  signal: AbortSignal,
) {
  content.addEventListener(
    "click",
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const target = new URL(link.href);
      const normalize = (path: string) => path.replace(/\/+$/, "") || "/";
      if (
        target.origin === location.origin &&
        normalize(target.pathname) === normalize(location.pathname) &&
        target.search === location.search &&
        target.hash === location.hash
      ) {
        event.preventDefault();
        close();
      }
    },
    { signal },
  );
}
