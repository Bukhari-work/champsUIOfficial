import type { Language } from "@/i18n/ui";

interface QuestionnaireContent {
  title: string;
  description: string;
  subtitle: string;
  invitationTitle: string;
  objectives: { heading: string; intro: string; items: string[] };
  informationTitle: string;
  facts: { icon: string; text: string }[];
  actionLabel: string;
  externalNote: string;
  organizerLabel: string;
  body: string;
}

export const questionnaire = {
  href: "https://forms.gle/hFKwvqhVKRjT4yfL6",
  organizer: { name: "CHAMPS UI", href: "https://champs.fkm.ui.ac.id" },
  content: {
    en: {
      title: "Training Needs Assessment (TNA) Survey – CHAMPS UI",
      description:
        "An invitation to participate in CHAMPS UI’s Training Needs Assessment survey to map institutional capacity-building needs in health systems and policy.",
      subtitle: "Capacity Development Questionnaire",
      invitationTitle: "The invitation",
      objectives: {
        heading: "Survey Objectives",
        intro: "This Training Needs Assessment (TNA) aims to:",
        items: [
          "Map training and institutional capacity-building needs.",
          "Serve as the basis for designing relevant, targeted, and practical training programs.",
          "Ensure CHAMPS UI initiatives align with real institutional priorities.",
        ],
      },
      informationTitle: "Survey Information",
      facts: [
        { icon: "LuFileText", text: "Online questionnaire" },
        { icon: "LuClipboardCheck", text: "Training Needs Assessment (TNA)" },
        { icon: "LuClock", text: "Estimated completion time: 5–10 minutes" },
      ],
      actionLabel: "Fill Out the Questionnaire",
      externalNote: "The questionnaire opens in an external form.",
      organizerLabel: "Organized by",
      body: `<div class="not-prose my-10 flex justify-center">
  <figure class="max-w-3xl">
    <img
      src="/images/projects/tna-champs.webp"
      alt="CHAMPS UI Training Needs Assessment Survey Poster"
      class="rounded-2xl border shadow-lg"
      loading="lazy"
    />
    <figcaption class="mt-3 text-center text-sm text-muted-foreground">
      Training Needs Assessment (TNA) Survey Invitation — CHAMPS UI
    </figcaption>
  </figure>
</div>

Dear Sir/Madam,

On behalf of the **Center for Health Administration and Policy Studies (CHAMPS), Universitas Indonesia**, we would like to invite you to participate in our **Training Needs Assessment (TNA)** survey.

**CHAMPS UI** is a research and capacity-development center in health systems and policy that collaborates with ministries and government agencies, local governments, health service providers, and development partners to support evidence-based policymaking and institutional strengthening.

Your participation is extremely valuable in ensuring that future CHAMPS UI programs truly respond to institutional needs. As a form of appreciation, **CHAMPS UI will provide mobile credit / communication incentives to 20 selected respondents**.

Thank you very much for your time and contribution.

Sincerely,<br />
**CHAMPS UI Team**`,
    },
    id: {
      title: "Survei Analisis Kebutuhan Pelatihan (TNA) – CHAMPS UI",
      description:
        "Undangan untuk berpartisipasi dalam Survei Analisis Kebutuhan Pelatihan CHAMPS UI guna memetakan kebutuhan penguatan kapasitas institusi di bidang sistem dan kebijakan kesehatan.",
      subtitle: "Kuesioner Pengembangan Kapasitas",
      invitationTitle: "Tentang undangan",
      objectives: {
        heading: "Tujuan Survei",
        intro: "Survei Analisis Kebutuhan Pelatihan (TNA) ini bertujuan untuk:",
        items: [
          "Memetakan kebutuhan pelatihan dan penguatan kapasitas institusi.",
          "Menjadi dasar perancangan program pengembangan yang relevan, tepat sasaran, dan aplikatif.",
          "Memastikan inisiatif CHAMPS UI selaras dengan prioritas kelembagaan.",
        ],
      },
      informationTitle: "Informasi Survei",
      facts: [
        { icon: "LuFileText", text: "Kuesioner daring" },
        {
          icon: "LuClipboardCheck",
          text: "Analisis Kebutuhan Pelatihan (TNA)",
        },
        { icon: "LuClock", text: "Estimasi waktu pengisian: 5–10 menit" },
      ],
      actionLabel: "Isi Kuesioner",
      externalNote: "Kuesioner dibuka melalui formulir eksternal.",
      organizerLabel: "Diselenggarakan oleh",
      body: `<div class="not-prose my-10 flex justify-center">
  <figure class="max-w-3xl">
    <img
      src="/images/projects/tna-champs.webp"
      alt="Poster Survei Analisis Kebutuhan Pelatihan CHAMPS UI"
      class="rounded-2xl border shadow-lg"
      loading="lazy"
    />
    <figcaption class="mt-3 text-center text-sm text-muted-foreground">
      Undangan Survei Analisis Kebutuhan Pelatihan (TNA) — CHAMPS UI
    </figcaption>
  </figure>
</div>

Yth. Bapak/Ibu,

Perkenankan kami dari **Center for Health Administration and Policy Studies (CHAMPS), Universitas Indonesia** mengundang Bapak/Ibu untuk berpartisipasi dalam pengisian **Survei Analisis Kebutuhan Pelatihan (Training Needs Assessment/TNA)**.

**CHAMPS UI** merupakan pusat riset dan pengembangan kapasitas di bidang sistem dan kebijakan kesehatan yang bekerja sama dengan kementerian/lembaga, pemerintah daerah, fasilitas pelayanan kesehatan, serta mitra pembangunan dalam mendukung kebijakan berbasis bukti dan penguatan kapasitas institusi yang aplikatif dan berkelanjutan.

Partisipasi Bapak/Ibu sangat berarti untuk memastikan bahwa program-program CHAMPS UI ke depan benar-benar sesuai dengan kebutuhan institusi. Sebagai bentuk apresiasi, **CHAMPS UI akan memberikan pulsa/insentif komunikasi kepada 20 responden terpilih**.

Atas perhatian dan partisipasi Bapak/Ibu, kami ucapkan terima kasih.

Hormat kami,<br />
**Tim CHAMPS UI**`,
    },
  } satisfies Record<Language, QuestionnaireContent>,
};
