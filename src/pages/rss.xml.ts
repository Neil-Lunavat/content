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
      {
        title: "3 AM Conversations with AI, Vol. 1 — The Laptop Fix",
        pubDate: new Date("2026-03-23"),
        description:
          "Started debugging a throttled HP laptop at 3 AM with Claude. Then the conversation went somewhere else entirely — AI economics, job markets, quant finance, and who actually benefits from all this.",
        link: "/content/3am-vol1-the-laptop-fix",
      },
      {
        title: "3 AM Conversations with AI, Vol. 2 — The Gear Shift",
        pubDate: new Date("2026-03-25"),
        description:
          "A bike gear analogy turned into a full framework for skill acquisition — logarithmic curves, boredom as a signal, and why grinding the wrong coefficient is the most common plateau.",
        link: "/content/3am-vol2-the-gear-shift",
      },
    ],
    customData: `<language>en-us</language>`,
  });
}
