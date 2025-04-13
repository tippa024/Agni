import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "edge";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const modelPricing = [
  {
    model: "claude-3-7-sonnet-20250219",
    input: 3,
    cachedWrite: 3.75,
    cachedHit: 0.3,
    output: 15,
    currency: "USD",
    unit: 1000000,
  },
  {
    model: "claude-3-5-sonnet-20241022",
    input: 3,
    cachedWrite: 3.75,
    cachedHit: 0.3,
    output: 15,
    currency: "USD",
    unit: 1000000,
  },
  {
    model: "claude-3-5-haiku-20241022",
    input: 0.8,
    cachedWrite: 1,
    cachedHit: 0.08,
    output: 4,
    currency: "USD",
    unit: 1000000,
  },
  {
    model: "claude-3-haiku",
    input: 0.25,
    cachedWrite: 0.3,
    cachedHit: 0.03,
    output: 1.25,
    currency: "USD",
    unit: 1000000,
  },
  {
    model: "claude-3-opus",
    input: 15,
    cachedWrite: 18.75,
    cachedHit: 1.5,
    output: 75,
    currency: "USD",
    unit: 1000000,
  },
];

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("Anthropic API key is not set", { status: 500 });
  }

  try {
    const { messages, model, systemMessage, stream } = await req.json();
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
      const pricing = modelPricing.find((p) => p.model === model);
      console.log("pricing", model, pricing);

      (async () => {
        try {
          let costs = {
            inputCost: 0,
            cachedWriteCost: 0,
            cachedHitCost: 0,
            outputCost: 0,
            totalCost: 0,
          };

          console.log("Starting to process Anthropic stream events");

          for await (const event of response) {
            if (event.type === "message_start") {
              costs.inputCost = parseFloat(
                (
                  (event.message.usage.input_tokens * (pricing?.input || 0)) /
                  1000000
                ).toFixed(6)
              );
              if (event.message.usage.cached_write_tokens !== undefined) {
                costs.cachedWriteCost = parseFloat(
                  (
                    (event.message.usage.cached_write_tokens *
                      (pricing?.cachedWrite || 0)) /
                    1000000
                  ).toFixed(6)
                );
              }
              if (event.message.usage.cached_hit_tokens !== undefined) {
                costs.cachedHitCost = parseFloat(
                  (
                    (event.message.usage.cached_hit_tokens *
                      (pricing?.cachedHit || 0)) /
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
              console.log("event", event);
              costs.outputCost = parseFloat(
                (
                  (event.usage.output_tokens * (pricing?.output || 0)) /
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
          console.log("costs", costs);
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
    const pricing = modelPricing.find((p) => p.model === model);

    if (pricing && usage) {
      const inputCost = usage.input_tokens * (pricing.input / 1000000);
      const outputCost = usage.output_tokens * (pricing.output / 1000000);
      const totalCost = inputCost + outputCost;

      return new Response(
        JSON.stringify({
          response: response.content[0].text,
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
    }

    return new Response(
      JSON.stringify({
        response: response.content[0].text,
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
