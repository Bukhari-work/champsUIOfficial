import type { Language } from "@/i18n/ui";
import { useTranslations } from "@/i18n/utils";

// The current page and design previews share the same capabilities and wording.
const categories = [
  {
    id: "research",
    image: "/images/what-we-do/research.webp",
    programmes: [
      ["whatWeDo.research.prog1", "FaScaleBalanced"],
      ["whatWeDo.research.prog2", "FaHospital"],
      ["whatWeDo.research.prog3", "FaHandHoldingDollar"],
      ["whatWeDo.research.prog4", "FaShieldHalved"],
    ],
  },
  {
    id: "capacity",
    image: "/images/what-we-do/capacity-building.webp",
    programmes: [
      ["whatWeDo.capacity.prog1", "FaChalkboardUser"],
      ["whatWeDo.capacity.prog2", "FaUsers"],
      ["whatWeDo.capacity.prog3", "IoBed"],
    ],
  },
  {
    id: "consultation",
    image: "/images/what-we-do/consultation.webp",
    programmes: [
      ["whatWeDo.consultation.prog1", "FaMagnifyingGlass"],
      ["whatWeDo.consultation.prog2", "FaCheckDouble"],
      ["whatWeDo.consultation.prog3", "FaLifeRing"],
      ["whatWeDo.consultation.prog4", "FaHandshakeAngle"],
    ],
  },
  {
    id: "csr",
    image: "/images/what-we-do/corporate.webp",
    programmes: [
      ["whatWeDo.csr.prog1", "FaCompass"],
      ["whatWeDo.csr.prog2", "FaHouseMedicalCircleCheck"],
      ["whatWeDo.csr.prog3", "FaSquarePersonConfined"],
      ["whatWeDo.csr.prog4", "FaBuildingCircleArrowRight"],
    ],
  },
] as const;

export function getProgrammeCategories(lang: Language) {
  const t = useTranslations(lang);
  return categories.map(({ id, image, programmes }) => ({
    id,
    image,
    category: t(`whatWeDo.${id}.title`),
    description: t(`whatWeDo.${id}.description`),
    programmes: programmes.map(([key, icon]) => ({
      title: t(`${key}.title`),
      description: t(`${key}.description`),
      icon,
    })),
  }));
}

export type ProgrammeCategory = ReturnType<
  typeof getProgrammeCategories
>[number];
