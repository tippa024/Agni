import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "edge";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI API key is not set", { status: 500 });
  }

  const {
    messages,
    model,
    instructions,
    pricing,
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

              const nonCachedTokens =
                input_tokens - (input_tokens_details.cached_tokens || 0);
              costs = {
                inputCost: nonCachedTokens * (pricing.input / 1000000),
                cachedInputCost:
                  input_tokens_details.cached_tokens *
                  (pricing.cacheread / 1000000),
                outputCost: output_tokens * (pricing.output / 1000000),
                totalCost: 0,
              };
              costs.totalCost =
                costs.inputCost + costs.cachedInputCost + costs.outputCost;

              console.log("costs", costs);

              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "costs", ...costs })}\n\n`
                )
              );
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

  if (usage) {
    const cachedTokens = usage.input_tokens_details?.cached_tokens || 0;
    const nonCachedTokens = usage.input_tokens - cachedTokens;
    const inputCost = nonCachedTokens * (pricing.input / 1000000);
    const cachedInputCost = cachedTokens * (pricing.cacheread / 1000000);
    const outputCost = usage.output_tokens * (pricing.output / 1000000);

    const totalCost = inputCost + cachedInputCost + outputCost;

    console.log("costs", {
      inputCost,
      cachedInputCost,
      outputCost: usage.output_tokens * (pricing.output / 1000000),
      totalCost: inputCost + cachedInputCost + outputCost,
    });

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
