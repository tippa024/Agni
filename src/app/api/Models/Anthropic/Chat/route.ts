import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "edge";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("Anthropic API key is not set", { status: 500 });
  }

  try {
    const { messages, model, systemMessage, stream, pricing } =
      await req.json();

    console.log(" Anthropic API route Starting");

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    if (stream) {
      console.log("Anthropic API route: streaming on");
      const response = anthropic.messages.stream({
        model: model,
        system: systemMessage,
        messages: messages,
        max_tokens: 1024,
        temperature: 1,
        stream: true,
      });

      const { readable, writable } = new TransformStream();
      const encoder = new TextEncoder();
      const writer = writable.getWriter();

      (async () => {
        try {
          let costs = {
            inputCost: 0,
            cachedWriteCost: 0,
            cachedHitCost: 0,
            outputCost: 0,
            totalCost: 0,
          };

          for await (const event of response) {
            if (event.type === "message_start") {
              costs.inputCost = parseFloat(
                (
                  (event.message.usage.input_tokens * pricing.input) /
                  1000000
                ).toFixed(6)
              );
              if (event.message.usage.cached_write_tokens !== undefined) {
                costs.cachedWriteCost = parseFloat(
                  (
                    (event.message.usage.cached_write_tokens *
                      pricing.cachedWrite) /
                    1000000
                  ).toFixed(6)
                );
              }
              if (event.message.usage.cached_hit_tokens !== undefined) {
                costs.cachedHitCost = parseFloat(
                  (
                    (event.message.usage.cached_hit_tokens *
                      pricing.cachedHit) /
                    1000000
                  ).toFixed(6)
                );
              }
            } else if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "content",
                    content: event.delta.text,
                  })}\n\n`
                )
              );
            } else if (event.type === "message_delta") {
              costs.outputCost = parseFloat(
                (
                  (event.usage.output_tokens * pricing.output) /
                  1000000
                ).toFixed(6)
              );
              costs.totalCost = parseFloat(
                (
                  costs.inputCost +
                  costs.cachedWriteCost +
                  costs.cachedHitCost +
                  costs.outputCost
                ).toFixed(6)
              );

              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "costs",
                    inputCost: costs.inputCost,
                    cachedInputCost:
                      costs.cachedWriteCost + costs.cachedHitCost, // Combine these for compatibility
                    outputCost: costs.outputCost,
                    totalCost: costs.totalCost,
                  })}\n\n`
                )
              );
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Transfer-Encoding": "chunked",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }

    const response = await anthropic.messages.create({
      model: model,
      system: systemMessage,
      messages: messages,
      max_tokens: 1024,
      temperature: 1,
    });

    const usage = response.usage;

    // const pricing = modelPricing.find((p) => p.model === model);

    const inputCost = usage.input_tokens * (pricing.input / 1000000);

    const outputCost = usage.output_tokens * (pricing.output / 1000000);

    const totalCost = inputCost + outputCost;

    return new Response(
      JSON.stringify({
        response:
          response.content[0].type === "text" ? response.content[0].text : "",
        cost: {
          inputCost: parseFloat(inputCost.toFixed(6)),
          outputCost: parseFloat(outputCost.toFixed(6)),
          totalCost: parseFloat(totalCost.toFixed(6)),
          currency: "USD",
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Anthropic Chat API Error:", error);
    return new Response(error.message || "An error occurred", {
      status: error.status || 500,
    });
  }
}
