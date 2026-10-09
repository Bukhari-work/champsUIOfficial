import type { TransitionBeforeSwapEvent } from "astro:transitions/client";

let exitAnimation: Animation | undefined;
let cover: HTMLElement | undefined;
let menuScrollTop = 0;

function cleanup() {
  exitAnimation?.cancel();
  exitAnimation = undefined;
  cover?.remove();
  cover = undefined;
  menuScrollTop = 0;
}

document.addEventListener("astro:before-swap", (event) => {
  const transition = event as TransitionBeforeSwapEvent;
  cleanup();
  const menu = document.getElementById("mobile-navigation-content");
  if (!menu || menu.dataset.state !== "open") return;
  menuScrollTop = menu.scrollTop;

  // The old modal is disposed at the swap. Carry only its visual surface into the
  // destination, never its interactive state, focus trap, IDs, or event listeners.
  const surface = transition.newDocument.createElement("div");
  surface.className = menu.className;
  surface.append(
    ...Array.from(menu.childNodes, (node) => node.cloneNode(true)),
  );
  surface.setAttribute("data-mobile-menu-handoff", "");
  surface.setAttribute("aria-hidden", "true");
  surface.inert = true;
  surface.style.opacity = getComputedStyle(menu).opacity;
  surface.style.backgroundColor = getComputedStyle(menu).backgroundColor;
  for (const property of menu.style) {
    if (property.startsWith("--")) {
      surface.style.setProperty(
        property,
        menu.style.getPropertyValue(property),
      );
    }
  }
  for (const element of surface.querySelectorAll(
    "[id], [data-slot], [autofocus]",
  )) {
    element.removeAttribute("id");
    element.removeAttribute("data-slot");
    element.removeAttribute("autofocus");
  }
  transition.newDocument.body.append(surface);
  // This menu reveal replaces the normal page transition, including Astro's fallback.
  // Skipping a native view transition intentionally rejects its ready promise.
  void transition.viewTransition.ready.catch(() => {});
  transition.viewTransition.skipTransition();
});

document.addEventListener("astro:after-swap", () => {
  // Restore after insertion, when the surface has layout, and before its first paint.
  const surface = document.querySelector<HTMLElement>(
    "[data-mobile-menu-handoff]",
  );
  if (surface) surface.scrollTop = menuScrollTop;
});

document.addEventListener("astro:page-load", () => {
  cover =
    document.querySelector<HTMLElement>("[data-mobile-menu-handoff]") ??
    undefined;
  if (!cover) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cleanup();
    return;
  }
  exitAnimation = cover.animate(
    [{ opacity: getComputedStyle(cover).opacity }, { opacity: 0 }],
    {
      duration: 150,
      easing: "ease-in",
      fill: "forwards",
    },
  );
  const animation = exitAnimation;
  animation.finished.then(
    () => {
      if (animation === exitAnimation) cleanup();
    },
    () => {},
  );
});
