import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { model, apikey, prompt } = await request.json();

    if (!model || !apikey || !prompt) {
      return new Response("Missing fields", { status: 400 });
    }

    let response;

    switch (model) {
      
      //GPT
      case "gpt-4o-mini":
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });
        break;

      //Claude
      case "Claude 3.5 Sonnet":
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apikey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      case "Claude Haiku":
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apikey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      // grok
      case "Grok2":
        response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "grok-2",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
          }),
        });
        break;

      // gemini
      case "Gemini 1.5 Flash":
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        break;

      //cohere
      case "Command R+":
        response = await fetch("https://api.cohere.com/v1/chat", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "command-r-plus",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      //mistral
      case "Mistral Large":
        response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000,
          }),
        });
        break;

      // OpenRouter for proxy models
      case "OpenRouter":
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      case "Llama3":
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "meta-llama/Meta-Llama-3-70B-Instruct",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      case "Codestral":
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "mistral/codestral-latest",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      case "Mixtral 8x7B":
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "mistral/mixtral-8x7b-instruct",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      case "Phi-3":
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${apikey}`,
          },
          body: JSON.stringify({
            model: "microsoft/phi-3-medium-128k-instruct",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        break;

      default:
        return new Response("Invalid model", { status: 400 });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("An error occurred", { status: 500 });
  }
}
