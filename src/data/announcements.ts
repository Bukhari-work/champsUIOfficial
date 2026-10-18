import type { Language } from "@/i18n/ui";

export interface AnnouncementContent {
  title: string;
  description: string;
  action?: {
    label: string;
    // Use an unprefixed site path for automatic localization, or an HTTPS URL.
    href: `/${string}` | `https://${string}`;
  };
}

export interface AnnouncementCampaign {
  // Keep this stable for edits; use a new ID for a different campaign.
  id: string;
  enabled: boolean;
  content: Record<Language, AnnouncementContent>;
}

// Change campaign content here; the dialog component and controller stay unchanged.
export const homeAnnouncement: AnnouncementCampaign = {
  id: "tna-champs-ui",
  enabled: true,
  content: {
    en: {
      title: "CHAMPS UI Training Needs Assessment",
      description:
        "We invite institutions to participate in our Training Needs Assessment survey to help shape future capacity-building programs.",
      action: {
        label: "View Invitation",
        href: "/questionnaire",
      },
    },
    id: {
      title: "Survei Analisis Kebutuhan Pelatihan CHAMPS UI",
      description:
        "Kami mengundang institusi untuk berpartisipasi dalam survei Analisis Kebutuhan Pelatihan guna membantu merancang program penguatan kapasitas ke depan.",
      action: {
        label: "Lihat Undangan",
        href: "/questionnaire",
      },
    },
  },
};
