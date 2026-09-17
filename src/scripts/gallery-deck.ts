import Swiper from "swiper";
import { A11y, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

class GalleryDeck extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    this.cleanup?.();
    const slider = this.querySelector<HTMLElement>("[data-gallery-slider]")!;
    const slides = Array.from(
      slider.querySelectorAll<HTMLElement>(".swiper-slide"),
    );
    // A single photo is a static image, with no carousel work or dead controls.
    if (slides.length < 2) return;

    const controls = this.querySelector<HTMLElement>(
      "[data-gallery-controls]",
    )!;
    const previous = this.querySelector<HTMLButtonElement>(
      "[data-gallery-prev]",
    )!;
    const next = this.querySelector<HTMLButtonElement>("[data-gallery-next]")!;
    const status = this.querySelector<HTMLElement>("[data-gallery-status]")!;
    const copy = JSON.parse(this.dataset.copy!) as Record<string, string>;
    const format = new Intl.NumberFormat(this.dataset.language);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const events = new AbortController();
    const { signal } = events;

    const update = (swiper: Swiper) => {
      status.textContent = copy.count
        .replace("{current}", format.format(swiper.activeIndex + 1))
        .replace("{total}", format.format(slides.length));
      slides.forEach((slide, index) => {
        slide.setAttribute("aria-hidden", String(index !== swiper.activeIndex));
      });
    };
    const swiper = new Swiper(slider, {
      modules: [A11y, EffectCoverflow],
      effect: "coverflow",
      slidesPerView: "auto",
      centeredSlides: true,
      grabCursor: true,
      // Rewind supports two-photo decks without loop's slide-count constraints.
      rewind: true,
      speed: reducedMotion.matches ? 0 : 300,
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 40,
        modifier: 1,
        slideShadows: false,
      },
      a11y: {
        containerRoleDescriptionMessage: copy.carousel,
        itemRoleDescriptionMessage: copy.photo,
        slideLabelMessage: copy.slide,
        // The explicit counter provides one announcement per change.
        wrapperLiveRegion: false,
      },
      on: { init: update, slideChange: update },
    });
    previous.addEventListener("click", () => swiper.slidePrev(), { signal });
    next.addEventListener("click", () => swiper.slideNext(), { signal });
    this.addEventListener(
      "keydown",
      (event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.isComposing
        )
          return;
        if (
          event.target !== slider &&
          event.target !== previous &&
          event.target !== next
        )
          return;
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            swiper.slidePrev();
            break;
          case "ArrowRight":
            event.preventDefault();
            swiper.slideNext();
            break;
          case "Home":
            event.preventDefault();
            swiper.slideTo(0);
            break;
          case "End":
            event.preventDefault();
            swiper.slideTo(slides.length - 1);
            break;
        }
      },
      { signal },
    );
    reducedMotion.addEventListener(
      "change",
      () => {
        swiper.params.speed = reducedMotion.matches ? 0 : 300;
      },
      { signal },
    );
    controls.hidden = false;
    this.cleanup = () => {
      events.abort();
      swiper.destroy(true, true);
      controls.hidden = true;
      slides.forEach((slide) => slide.removeAttribute("aria-hidden"));
    };
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

if (!customElements.get("gallery-deck"))
  customElements.define("gallery-deck", GalleryDeck);
