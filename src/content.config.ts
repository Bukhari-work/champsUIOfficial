// 1. Import utilities from `astro:content`
import { defineCollection, reference, z } from "astro:content";

// 2. Import loader(s)
import { glob } from "astro/loaders";

// 3. Define your collection(s)
const people = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/people" }),
  schema: z.object({
    name: z.string(),
    role: z.enum(["Experts", "Leadership", "Advisors", "The Team"]),
    index: z.number().min(0).optional(),
    responsibility: z.string().optional(),
    description: z.string().optional(),
    expertise: z.array(z.string()).optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    social: z
      .array(
        z.object({
          platform: z.string(),
          icon: z.string(),
          href: z.string().url(),
          text: z.string().optional(),
          ariaLabel: z.string().optional(),
        }),
      )
      .optional(),
    draft: z.boolean().optional(),
  }),
});

// News collection schema
const news = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/news" }),
  schema: z.object({
    title: z.string(),
    translationKey: z.string(),
    authors: z.array(reference("people")),
    description: z.string().optional(),
    subtitle: z.string().optional(),
    images: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
        }),
      )
      .optional(),
    date: z.coerce.date().optional(),
    categories: z.array(z.string()).default(["others"]),
    tags: z.array(z.string()).default(["others"]),
    relatedPosts: z.array(reference("news")).optional(),
    draft: z.boolean().optional(),
  }),
});

// Projects collection schema
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/projects" }),
  schema: z.object({
    // --- Core Content ---
    title: z.string(),
    description: z.string(),
    isDraft: z.boolean().default(false),

    // --- Page Header ---
    headtitle: z.string().optional(),
    subtitle: z.string().optional(),

    // --- Main Content Blocks (OPTIONAL by type) ---
    takeaways: z
      .object({
        heading: z.string(),
        intro: z.string(),
        items: z.array(z.string()),
      })
      .optional(),

    audience: z
      .object({
        heading: z.string(),
        items: z.array(z.string()),
      })
      .optional(),

    audienceNotes: z
      .array(
        z.object({
          icon: z.string(),
          text: z.string(),
        }),
      )
      .optional(),

    speakers: z
      .array(
        z.object({
          name: z.string(),
          title: z.string(),
          image: z
            .object({
              src: z.string(),
              alt: z.string(),
            })
            .optional(),
        }),
      )
      .optional(),

    // --- Sidebar ---
    sidebarDetails: z
      .object({
        heading: z.string(),
        items: z.array(
          z.object({
            icon: z.string(),
            text: z.string(),
          }),
        ),
      })
      .optional(),

    sidebarFee: z
      .object({
        heading: z.string(),
        items: z.array(
          z.object({
            icon: z.string().optional(),
            details: z.string().optional(),
            price: z.string(),
          }),
        ),
        includes: z.string().optional(),
        excludes: z.string().optional(),
      })
      .optional(),

    sidebarRegister: z
      .object({
        href: z.string().url(),
        buttonText: z.string(),
        deadline: z.string().optional(),
        qrCode: z
          .object({
            src: z.string(),
            alt: z.string(),
          })
          .optional(),
      })
      .optional(),

    sidebarContact: z
      .object({
        heading: z.string(),
        links: z.array(
          z.object({
            href: z.string().url(),
            icon: z.string(),
            text: z.string(),
          }),
        ),
      })
      .optional(),
  }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { people, news, projects };
