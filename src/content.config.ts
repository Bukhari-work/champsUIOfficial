import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const localizedText = z.object({
  en: z.string().min(1),
  id: z.string().min(1),
});
const image = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});
const articleFields = {
  title: z.string(),
  renderMode: z.enum(["section", "component"]).default("section"),
  description: z.string().optional(),
  authors: z.array(reference("people")).default([]),
  date: z.coerce.date().optional(),
  images: z.array(image).optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};
const publicationReferences = z.array(reference("publications")).optional();
const contentSection = z.object({ id: z.string().min(1) });
const contentPlan = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("article"), sections: z.array(contentSection).min(1) }),
  z.object({
    mode: z.literal("tabs"),
    views: z.array(z.object({
      key: z.string().regex(/^[a-z][a-z0-9-]*$/),
      label: localizedText,
      sections: z.array(contentSection).min(1),
    })).min(1),
  }),
]).superRefine((plan, context) => {
  if (plan.mode === "tabs") {
    const keys = plan.views.map((view) => view.key);
    if (new Set(keys).size !== keys.length)
      context.addIssue({ code: "custom", message: "Tab view keys must be unique." });
  }
  const sections = plan.mode === "article"
    ? plan.sections : plan.views.flatMap((view) => view.sections);
  const ids = sections.map((section) => section.id);
  if (new Set(ids).size !== ids.length)
    context.addIssue({ code: "custom", message: "Each content section may appear only once." });
});
const planSections = (plan: z.infer<typeof contentPlan>) =>
  plan.mode === "article" ? plan.sections : plan.views.flatMap((view) => view.sections);

const people = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.enum(["Experts", "Leadership", "Advisors", "The Team"]),
    index: z.number().min(0).optional(),
    responsibility: z.string().optional(),
    description: z.string().optional(),
    expertise: z.array(z.string()).optional(),
    image: image.optional(),
    social: z
      .array(
        z.object({
          platform: z.string(),
          icon: z.string(),
          href: z.url(),
          text: z.string().optional(),
          ariaLabel: z.string().optional(),
        }),
      )
      .optional(),
    draft: z.boolean().optional(),
  }),
});

const stories = defineCollection({
  loader: glob({
    pattern: "*/story.json",
    base: "src/content/stories",
    generateId: ({ entry }) => entry.replace(/\/story\.json$/, ""),
  }),
  schema: z.object({
    title: localizedText,
    description: localizedText,
    subtitle: localizedText.optional(),
    authors: z.object({ en: z.array(reference("people")), id: z.array(reference("people")) }),
    date: z.coerce.date().optional(),
    images: z.array(image).default([]),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    previewOnly: z.boolean().default(false),
    content: contentPlan,
    partner: localizedText.optional(),
    sidebarFacts: z.array(z.object({
      label: localizedText,
      value: localizedText,
    })).max(4).optional(),
    workType: z.enum(["research", "consulting", "capacityBuilding"]).optional(),
    activityPeriod: z
      .object({
        startYear: z.number().int().min(1900).max(2100),
        endYear: z.number().int().min(1900).max(2100).optional(),
      })
      .refine(
        (period) => !period.endYear || period.endYear >= period.startYear,
        {
          message: "The activity period must end on or after its start year.",
        },
      )
      .optional(),
    relatedPosts: z.array(reference("stories")).optional(),
    publications: publicationReferences,
  }),
});

const storyDocuments = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/stories",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),
  schema: z.object({
    draft: z.boolean().default(false),
    renderMode: z.enum(["section", "component"]).default("section"),
  }),
});

// An event folder owns its record plus optional recap/invitation Markdown or MDX documents.
// Documents have no independent public routes; the event page renders them.
const eventDocuments = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "src/content/events",
    generateId: ({ entry }) => entry.replace(/\.(md|mdx)$/, ""),
  }),
  schema: z.object({
    ...articleFields,
    objectives: z
      .object({
        intro: z.string(),
        items: z.array(z.string()),
      })
      .optional(),
    audience: z
      .object({ items: z.array(z.string()) })
      .optional(),
    audienceNotes: z
      .array(z.object({ icon: z.string(), text: z.string() }))
      .optional(),
    speakers: z
      .array(
        z.object({
          name: z.string(),
          title: z.string(),
          image: image.optional(),
        }),
      )
      .optional(),
    practicalDetails: z
      .object({
        items: z.array(z.object({ icon: z.string(), text: z.string() })),
      })
      .optional(),
    fees: z
      .object({
        heading: z.string(),
        items: z.array(
          z
            .object({
              icon: z.string().optional(),
              details: z.string().optional(),
              price: z.string().min(1),
              opensAt: z.iso.datetime({ offset: true }).optional(),
              closesAt: z.iso.datetime({ offset: true }).optional(),
            })
            .refine(
              (rate) =>
                !rate.opensAt ||
                !rate.closesAt ||
                Date.parse(rate.opensAt) < Date.parse(rate.closesAt),
              {
                message: "A pricing period must close after it opens.",
              },
            ),
        ),
        includesSummary: z.string().trim().min(1).max(180).optional(),
        includes: z.string().optional(),
        excludes: z.string().optional(),
      })
      .optional(),
    originalRegistration: z
      .object({
        href: z.url(),
        buttonText: z.string(),
        deadline: z.string().optional(),
        qrCode: image.optional(),
      })
      .optional(),
    contact: z
      .object({
        heading: z.string(),
        links: z.array(
          z.object({ href: z.url(), icon: z.string(), text: z.string() }),
        ),
      })
      .optional(),
  }),
});

const events = defineCollection({
  loader: glob({
    pattern: "*/event.json",
    base: "src/content/events",
    generateId: ({ entry }) => entry.replace(/\/event\.json$/, ""),
  }),
  schema: z
    .object({
      title: localizedText,
      summary: localizedText,
      format: localizedText,
      kind: z.enum(["training", "workshop", "seminar", "policyDialogue"]),
      period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
      startDate: z.iso.date().optional(),
      endDate: z.iso.date().optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]),
      venue: localizedText.optional(),
      partner: localizedText.optional(),
      duration: localizedText.optional(),
      flyers: z.array(z.object({
        src: z.string(),
        alt: localizedText,
        caption: localizedText.optional(),
      })).default([]),
      workFeature: z
        .object({ title: localizedText, contribution: localizedText })
        .optional(),
      topics: z
        .object({ en: z.array(z.string()), id: z.array(z.string()) })
        .optional(),
      recap: z.boolean().optional(),
      invitation: z.boolean().optional(),
      invitationArchive: z
        .object({
          speakerImages: z
            .array(z.object({ src: z.string(), alt: localizedText }))
            .min(1),
          qrCode: z.object({ src: z.string(), alt: localizedText }),
        })
        .optional(),
      listingOnly: z.boolean().default(false),
      // Unlisted demo records can exercise the real detail template without appearing in directories.
      previewOnly: z.boolean().default(false),
      resources: z
        .array(
          z.object({
            title: localizedText,
            href: z.url({ protocol: /^https?$/ }),
            kind: z.enum(["slides", "recording", "document"]),
          }),
        )
        .default([]),
      registration: z
        .object({
          href: z.url({ protocol: /^https?$/ }),
          closesAt: z.iso.datetime({ offset: true }),
        })
        .optional(),
      publications: publicationReferences,
      content: contentPlan.optional(),
      draft: z.boolean().default(false),
    })
    .refine(
      (event) =>
        Boolean(
          event.recap ||
            event.invitation ||
            event.invitationArchive ||
            event.listingOnly,
        ),
      {
        message:
          "An event needs supplied content, or must be a listing-only record.",
      },
    )
    .refine(
      (event) =>
        !event.listingOnly ||
        !(
          event.recap ||
          event.invitation ||
          event.invitationArchive ||
          event.registration ||
          event.workFeature ||
          event.resources.length > 0
        ),
      {
        message:
          "Listing-only records cannot have detail content, registration, resources, or a featured card.",
      },
    )
    .refine(
      (event) => event.listingOnly ? !event.content : Boolean(event.content),
      { message: "Only detail events may declare a content plan, and they must have one." },
    )
    .refine(
      (event) =>
        !event.endDate ||
        Boolean(event.startDate && event.endDate >= event.startDate),
      { message: "An event end date must be on or after its start date." },
    )
    .refine(
      (event) => !event.startDate || event.startDate.startsWith(event.period),
      { message: "The event period must match its start date." },
    )
    .refine(
      (event) => !event.recap || Boolean(event.content && planSections(event.content).some(
        (section) => section.id === "recap",
      )),
      { message: "A declared recap must appear in the event content plan." },
    )
    .refine(
      (event) => !event.invitation || Boolean(event.content && planSections(event.content).some(
        (section) => section.id === "invitation",
      )),
      { message: "A declared invitation must appear in the event content plan." },
    )
    .refine(
      (event) => !event.resources.length || Boolean(event.content && planSections(event.content).some(
        (section) => section.id === "resources",
      )),
      { message: "Event resources must appear in a resources section of the content plan." },
    ),
});

// Ready for real records. Fictional publication previews never enter this collection.
const publications = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/publications" }),
  schema: z.object({
    title: z.string().min(1),
    translationKey: z.string().min(1),
    type: z.enum([
      "researchArticle",
      "report",
      "policyBrief",
      "bookChapter",
      "other",
    ]),
    authors: z
      .array(
        z.object({
          name: z.string().min(1),
          person: reference("people").optional(),
          orcid: z.url({ protocol: /^https?$/ }).optional(),
        }),
      )
      .min(1),
    year: z.number().int().min(1900).max(2100),
    date: z.coerce.date().optional(),
    journal: z.string().optional(),
    publisher: z.string().optional(),
    doi: z.string().min(1).optional(),
    abstract: z.string().optional(),
    summary: z.string().optional(),
    citation: z.string().optional(),
    url: z.url({ protocol: /^https?$/ }).optional(),
    pdf: z
      .union([z.url({ protocol: /^https?$/ }), z.string().regex(/^\/(?!\/)/)])
      .optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  people,
  stories,
  storyDocuments,
  events,
  eventDocuments,
  publications,
};
