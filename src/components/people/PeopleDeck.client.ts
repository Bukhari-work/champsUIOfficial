import { Swiper } from "swiper";
import { Pagination, EffectCoverflow, Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

class PeopleDeck extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    this.cleanup?.();
    const container = this.querySelector<HTMLElement>(".peopleDeck-slider")!;
    const swiper = new Swiper(container, {
      effect: "coverflow",
      slidesPerView: "auto",
      centeredSlides: true,
      modules: [Pagination, Navigation, EffectCoverflow, A11y],
      a11y: {
        prevSlideMessage: this.dataset.previous,
        nextSlideMessage: this.dataset.next,
        firstSlideMessage: this.dataset.first,
        lastSlideMessage: this.dataset.last,
        slideLabelMessage: this.dataset.slide,
      },
      pagination: {
        el: this.querySelector<HTMLElement>(".person-slider-pagination"),
        type: "fraction",
      },
      navigation: {
        nextEl: this.querySelector<HTMLElement>(".swiper-button-next"),
        prevEl: this.querySelector<HTMLElement>(".swiper-button-prev"),
        addIcons: false,
      },
      breakpoints: {
        0: {
          coverflowEffect: {
            rotate: 0,
            stretch: 50,
            depth: 0,
            modifier: -1,
            slideShadows: false,
          },
        },
        1024: {
          coverflowEffect: {
            rotate: 0,
            stretch: 50,
            depth: 10,
            modifier: -1,
            slideShadows: false,
          },
        },
      },
    });
    this.cleanup = () => {
      swiper.destroy(true, true);
    };
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

if (!customElements.get("people-deck"))
  customElements.define("people-deck", PeopleDeck);
