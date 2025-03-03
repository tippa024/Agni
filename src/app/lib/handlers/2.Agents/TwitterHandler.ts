import { Page, BrowserContext, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

export async function main({}: {}) {
  const stagehand = new Stagehand();
  await stagehand.page.goto(
    "https://www.google.com/search?q=trump+latest+news"
  );
  await stagehand.page.waitForSelector("div.g");

  const newsResults = await stagehand.page.extract({
    instruction:
      "extract the top 5 news results about Trump, including the headline, source, and brief description",
    schema: z.object({
      articles: z.array(
        z.object({
          headline: z.string(),
          source: z.string(),
          description: z.string(),
          date: z.string().optional(),
        })
      ),
    }),
  });

  console.log(newsResults);

  return newsResults;
}
