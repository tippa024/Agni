import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "edge";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const modelPricing = [
  {
    models: ["gpt-4.5-preview", "gpt-4.5-preview-2025-02-27"],
    input: 75.0,
    cachedInput: 37.5,
    output: 150.0,
  },
  {
    models: ["gpt-4o", "gpt-4o-2024-08-06"],
    input: 2.5,
    cachedInput: 1.25,
    output: 10.0,
  },
  {
    models: ["gpt-4o-audio-preview", "gpt-4o-audio-preview-2024-12-17"],
    input: 2.5,
    cachedInput: null,
    output: 10.0,
  },
  {
    models: ["gpt-4o-realtime-preview", "gpt-4o-realtime-preview-2024-12-17"],
    input: 5.0,
    cachedInput: 2.5,
    output: 20.0,
  },
  {
    models: ["gpt-4o-mini", "gpt-4o-mini-2024-07-18"],
    input: 0.15,
    cachedInput: 0.075,
    output: 0.6,
  },
  {
    models: [
      "gpt-4o-mini-audio-preview",
      "gpt-4o-mini-audio-preview-2024-12-17",
    ],
    input: 0.15,
    cachedInput: null,
    output: 0.6,
  },
  {
    models: [
      "gpt-4o-mini-realtime-preview",
      "gpt-4o-mini-realtime-preview-2024-12-17",
    ],
    input: 0.6,
    cachedInput: 0.3,
    output: 2.4,
  },
  {
    models: ["o1", "o1-2024-12-17"],
    input: 15.0,
    cachedInput: 7.5,
    output: 60.0,
  },
  {
    models: ["o1-pro", "o1-pro-2025-03-19"],
    input: 150.0,
    cachedInput: null,
    output: 600.0,
  },
  {
    models: ["o3-mini", "o3-mini-2025-01-31"],
    input: 1.1,
    cachedInput: 0.55,
    output: 4.4,
  },
  {
    models: ["o1-mini", "o1-mini-2024-09-12"],
    input: 1.1,
    cachedInput: 0.55,
    output: 4.4,
  },
  {
    models: [
      "gpt-4o-mini-search-preview",
      "gpt-4o-mini-search-preview-2025-03-11",
    ],
    input: 0.15,
    cachedInput: null,
    output: 0.6,
  },
  {
    models: ["gpt-4o-search-preview", "gpt-4o-search-preview-2025-03-11"],
    input: 2.5,
    cachedInput: null,
    output: 10.0,
  },
  {
    models: ["computer-use-preview", "computer-use-preview-2025-03-11"],
    input: 3.0,
    cachedInput: null,
    output: 12.0,
  },
];

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI API key is not set", { status: 500 });
  }

  const {
    messages,
    model,
    instructions,
    stream = undefined,
    temperature = undefined,
    text = undefined,
    tool_choice = undefined,
    tools = undefined,
    reasoning = undefined,
  } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response("Messages are required", { status: 400 });
  }

  if (stream) {
    console.log("Starting OpenAI API call with response and stream is on");
    const response = await openai.responses.create({
      input: messages,
      model: model,
      instructions: instructions,
      stream: true,
      temperature: temperature,
      text: text,
      tool_choice: tool_choice,
      tools: tools,
      reasoning: reasoning,
    });

    const [outputStream, usageStream] = response.tee();

    const { readable, writable } = new TransformStream();
    const encoder = new TextEncoder();
    const writer = writable.getWriter();

    (async () => {
      try {
        let costs = {
          inputCost: 0,
          cachedInputCost: 0,
          outputCost: 0,
          totalCost: 0,
        };

        const processCosts = async () => {
          for await (const event of usageStream) {
            if (event.type === "response.completed" && event.response.usage) {
              const { input_tokens, input_tokens_details, output_tokens } =
                event.response.usage;
              const modelName = event.response.model;
              const pricing = modelPricing.find((item) =>
                item.models.includes(modelName)
              );

              if (pricing) {
                const nonCachedTokens =
                  input_tokens - (input_tokens_details?.cached_tokens || 0);
                costs = {
                  inputCost: nonCachedTokens * (pricing.input / 1000000),
                  cachedInputCost: pricing.cachedInput
                    ? (input_tokens_details?.cached_tokens || 0) *
                      (pricing.cachedInput / 1000000)
                    : 0,
                  outputCost: output_tokens * (pricing.output / 1000000),
                  totalCost: 0,
                };
                costs.totalCost =
                  costs.inputCost + costs.cachedInputCost + costs.outputCost;

                await writer.write(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "costs", ...costs })}\n\n`
                  )
                );
              }
            }
          }
        };

        const processContent = async () => {
          for await (const event of outputStream) {
            if (event.type === "response.output_text.delta" && event.delta) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "content",
                    content: event.delta,
                  })}\n\n`
                )
              );
            }
          }
        };
        await Promise.all([processCosts(), processContent()]);
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

  const response = await openai.responses.create({
    input: messages,
    model: model,
    instructions: instructions,
    stream: false,
    temperature: temperature,
    text: text,
    tool_choice: tool_choice,
    tools: tools,
    reasoning: reasoning,
  });

  const usage = response.usage;
  const modelName = response.model;
  const pricing = modelPricing.find((item) => item.models.includes(modelName));

  if (pricing && usage) {
    const cachedTokens = usage.input_tokens_details?.cached_tokens || 0;
    const nonCachedTokens = usage.input_tokens - cachedTokens;
    const inputCost = nonCachedTokens * (pricing.input / 1000000);
    const cachedInputCost = pricing.cachedInput
      ? cachedTokens * (pricing.cachedInput / 1000000)
      : 0;
    const outputCost = usage.output_tokens * (pricing.output / 1000000);

    const totalCost = inputCost + cachedInputCost + outputCost;

    return NextResponse.json({
      response: response.output,
      cost: {
        inputCost: parseFloat(inputCost.toFixed(6)),
        cachedInputCost: parseFloat(cachedInputCost.toFixed(6)),
        outputCost: parseFloat(outputCost.toFixed(6)),
        totalCost: parseFloat(totalCost.toFixed(6)),
        currency: "USD",
      },
    });
  }
  return NextResponse.json({
    response: response.output,
  });
}
