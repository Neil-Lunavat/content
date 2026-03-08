import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  return rss({
    title: "Neil Lunavat | Developer & Digital Polymath",
    description:
      "Exploring the intersection of AI, development, and human potential. Practical insights for builders navigating the age of artificial intelligence.",
    site: context.site!,
    items: [
      {
        title: "The Mindset Revolution",
        pubDate: new Date("2025-04-30"),
        description:
          "A perspective shift that turns 'hard' into 'unfamiliar' — and familiar into mastered.",
        link: "/content/the-mindset-revolution",
      },
      {
        title: "The Cognitive Framework",
        pubDate: new Date("2025-05-15"),
        description:
          "A complete framework for managing complexity, cognitive load, and accelerated learning with the help of AI.",
        link: "/content/the-cognitive-framework",
      },
      {
        title: "You Are Not the Main Character",
        pubDate: new Date("2026-03-08"),
        description:
          "Neuromancer's quiet truth: the systems around you don't need your consent. They just need your dependency.",
        link: "/content/you-are-not-the-main-character",
      },
    ],
    customData: `<language>en-us</language>`,
  });
}
