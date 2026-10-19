import type { Language } from "./ui";

export const aboutCopy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    introduction: string;
    groupAlt: string;
    groupCaption: string;
    established: string;
    university: string;
    originLabel: string;
    originTitle: string;
    originBody: string;
    exploreLabel: string;
    exploreTitle: string;
    explore: { label: string; description: string; path: string }[];
    ctaLabel: string;
    ctaTitle: string;
    ctaAction: string;
  }
> = {
  en: {
    eyebrow: "About CHAMPS UI",
    title: "Public health progress is a collective effort.",
    introduction:
      "We connect research, policy, and practice to strengthen health systems in Indonesia and Southeast Asia.",
    groupAlt:
      "Participants at a CHAMPS UI global health leadership and diplomacy training",
    groupCaption: "Learning and working across disciplines and borders",
    established: "Established in 2006",
    university: "Faculty of Public Health, Universitas Indonesia",
    originLabel: "01 / Our foundation",
    originTitle: "Rooted in evidence. Built for collaboration.",
    originBody:
      "CHAMPS UI is the Center for Health Administration and Policy Studies at the Faculty of Public Health, Universitas Indonesia. We work with government, health institutions, and communities through research, training, and consultation.",
    exploreLabel: "05 / The people behind CHAMPS",
    exploreTitle: "Meet our people.",
    explore: [
      {
        label: "Our people",
        description: "Advisors, leadership, and team.",
        path: "/about/people",
      },
      {
        label: "Our experts",
        description: "Senior experts and researchers.",
        path: "/about/experts",
      },
    ],
    ctaLabel: "Work with us",
    ctaTitle: "Let's move public health forward, together.",
    ctaAction: "Contact CHAMPS UI",
  },
  id: {
    eyebrow: "Tentang CHAMPS UI",
    title: "Kemajuan kesehatan masyarakat adalah upaya bersama.",
    introduction:
      "Kami menghubungkan riset, kebijakan, dan praktik untuk memperkuat sistem kesehatan di Indonesia dan Asia Tenggara.",
    groupAlt:
      "Para peserta pelatihan kepemimpinan dan diplomasi kesehatan global CHAMPS UI",
    groupCaption: "Belajar dan bekerja lintas disiplin serta batas negara",
    established: "Berdiri sejak 2006",
    university: "Fakultas Kesehatan Masyarakat, Universitas Indonesia",
    originLabel: "01 / Landasan kami",
    originTitle: "Berpijak pada bukti. Bertumbuh melalui kolaborasi.",
    originBody:
      "CHAMPS UI adalah Pusat Kajian Administrasi dan Kebijakan Kesehatan di Fakultas Kesehatan Masyarakat, Universitas Indonesia. Kami bekerja bersama pemerintah, institusi kesehatan, dan masyarakat melalui riset, pelatihan, dan konsultasi.",
    exploreLabel: "05 / Orang-orang di balik CHAMPS",
    exploreTitle: "Kenali tim dan ahli kami.",
    explore: [
      {
        label: "Orang-orang kami",
        description: "Penasihat, pimpinan, dan tim.",
        path: "/about/people",
      },
      {
        label: "Para ahli kami",
        description: "Ahli senior dan peneliti.",
        path: "/about/experts",
      },
    ],
    ctaLabel: "Bekerja bersama kami",
    ctaTitle: "Mari bersama memajukan kesehatan masyarakat.",
    ctaAction: "Hubungi CHAMPS UI",
  },
};

export const aboutSectionCopy: Record<
  Language,
  {
    mission: {
      eyebrow: string;
      title: string;
      introduction: string;
      visionLabel: string;
      commitmentsLabel: string;
      commitmentsIntro: string;
      nextTitle: string;
      nextDescription: string;
      nextAction: string;
    };
    values: {
      eyebrow: string;
      title: string;
      introduction: string;
      principlesLabel: string;
      nextTitle: string;
      nextDescription: string;
      nextAction: string;
    };
    people: {
      eyebrow: string;
      title: string;
      introduction: string;
      advisorsIntro: string;
      leadershipIntro: string;
      teamIntro: string;
      nextTitle: string;
      nextDescription: string;
      nextAction: string;
    };
    experts: {
      eyebrow: string;
      title: string;
      introduction: string;
      expertsIntro: string;
      researchersIntro: string;
      nextTitle: string;
      nextDescription: string;
      nextAction: string;
    };
  }
> = {
  en: {
    mission: {
      eyebrow: "About / Our mission",
      title: "Our mission",
      introduction:
        "We connect research, partnership, and education to help improve health administration and policy in Indonesia and across Southeast Asia.",
      visionLabel: "Our vision",
      commitmentsLabel: "Our five commitments",
      commitmentsIntro:
        "Together, these commitments describe where we focus our knowledge, relationships, and energy.",
      nextTitle: "See the mission in practice.",
      nextDescription:
        "Explore the stories, programmes, and events that give this work its shape.",
      nextAction: "Explore what we do",
    },
    values: {
      eyebrow: "About / Our values",
      title: "The principles behind our work.",
      introduction:
        "Our values shape how we make decisions, work with partners, and learn from the people around us.",
      principlesLabel: "Five values, one way of working",
      nextTitle: "Meet the people behind these principles.",
      nextDescription:
        "Our team brings these values into everyday research, learning, and collaboration.",
      nextAction: "Meet the team",
    },
    people: {
      eyebrow: "About / Our team",
      title: "The people who move the work forward.",
      introduction:
        "Meet the advisors, leadership, and team members who guide and deliver CHAMPS UI's work.",
      advisorsIntro:
        "Guidance and perspective from experienced public health leaders.",
      leadershipIntro: "The people responsible for leading CHAMPS UI.",
      teamIntro:
        "The people supporting research, programmes, and day-to-day work.",
      nextTitle: "Looking for specialist expertise?",
      nextDescription:
        "Explore the wider network of senior experts and researchers connected with CHAMPS UI.",
      nextAction: "Meet our experts",
    },
    experts: {
      eyebrow: "About / Our experts",
      title: "Experience across public health disciplines.",
      introduction:
        "Explore the senior experts and researchers whose knowledge contributes to the CHAMPS UI network.",
      expertsIntro: "Senior expertise across health administration and policy.",
      researchersIntro:
        "Research experience that helps turn questions into evidence.",
      nextTitle: "Start a conversation with us.",
      nextDescription:
        "Tell us what knowledge or collaboration your work calls for.",
      nextAction: "Contact CHAMPS UI",
    },
  },
  id: {
    mission: {
      eyebrow: "Tentang / Misi kami",
      title: "Misi kami",
      introduction:
        "Kami menghubungkan riset, kemitraan, dan pendidikan untuk membantu memajukan administrasi serta kebijakan kesehatan di Indonesia dan Asia Tenggara.",
      visionLabel: "Visi kami",
      commitmentsLabel: "Lima komitmen kami",
      commitmentsIntro:
        "Kelima komitmen ini menunjukkan ke mana kami mengarahkan pengetahuan, hubungan, dan upaya kami.",
      nextTitle: "Lihat misi kami dalam praktik.",
      nextDescription:
        "Jelajahi cerita, program, dan acara yang memperlihatkan wujud pekerjaan ini.",
      nextAction: "Jelajahi layanan kami",
    },
    values: {
      eyebrow: "Tentang / Nilai kami",
      title: "Prinsip di balik pekerjaan kami.",
      introduction:
        "Nilai-nilai kami membentuk cara kami mengambil keputusan, bekerja dengan mitra, dan belajar dari orang-orang di sekitar kami.",
      principlesLabel: "Lima nilai, satu cara bekerja",
      nextTitle: "Kenali orang-orang di balik prinsip ini.",
      nextDescription:
        "Tim kami membawa nilai-nilai ini ke dalam riset, pembelajaran, dan kolaborasi sehari-hari.",
      nextAction: "Temui tim kami",
    },
    people: {
      eyebrow: "Tentang / Tim kami",
      title: "Orang-orang yang menggerakkan pekerjaan kami.",
      introduction:
        "Kenali penasihat, pimpinan, dan anggota tim yang mengarahkan serta menjalankan pekerjaan CHAMPS UI.",
      advisorsIntro:
        "Panduan dan sudut pandang dari pemimpin kesehatan masyarakat yang berpengalaman.",
      leadershipIntro: "Orang-orang yang memimpin CHAMPS UI.",
      teamIntro:
        "Orang-orang yang mendukung riset, program, dan kegiatan sehari-hari.",
      nextTitle: "Mencari keahlian khusus?",
      nextDescription:
        "Jelajahi jejaring ahli senior dan peneliti yang terhubung dengan CHAMPS UI.",
      nextAction: "Temui para ahli kami",
    },
    experts: {
      eyebrow: "Tentang / Para ahli kami",
      title: "Pengalaman dari berbagai bidang kesehatan masyarakat.",
      introduction:
        "Jelajahi para ahli senior dan peneliti yang pengetahuannya berkontribusi pada jejaring CHAMPS UI.",
      expertsIntro:
        "Keahlian senior dalam administrasi dan kebijakan kesehatan.",
      researchersIntro:
        "Pengalaman riset yang membantu mengubah pertanyaan menjadi bukti.",
      nextTitle: "Mulailah percakapan dengan kami.",
      nextDescription:
        "Ceritakan pengetahuan atau kolaborasi yang dibutuhkan pekerjaan Anda.",
      nextAction: "Hubungi CHAMPS UI",
    },
  },
};
