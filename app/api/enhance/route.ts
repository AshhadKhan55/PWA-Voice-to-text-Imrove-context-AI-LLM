import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import https from "https"
import axios from "axios"

const httpsAgent = new https.Agent({ rejectUnauthorized: false })
interface LLMConfig {
    url: string;
    name: string;
    secretKey: string;
}

type ChatRequest = {
  prompt: string
  model: string
  messagesModel: { role: string; content: string }[]
  temperature: number
}

export async function POST(req: Request) {
  try {
    const { content, action = "improve" } = await req.json()

    console.log(content)

    if (!content) {
      return Response.json({ error: "No content provided" }, { status: 400 })
    }

    const prompts = {
      improve: `Improve and polish this text while maintaining its core message and tone. Make it more clear and concise:\n\n${content}`,
      summarize: `Create a concise summary of this text:\n\n${content}`,
      expand: `Expand on this text with more details and context:\n\n${content}`,
      tags: `Generate 3-5 relevant tags for this content. Return only the tags as a comma-separated list:\n\n${content}`,
    }

    const ollama = createOpenAI({
      apiKey: "ollama", // Ollama doesn't require an API key, but the SDK needs something
      baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
    })

     const payload1 = {
      model: "llama3.2",
      messages: [{ role: 'user', content: prompts[action as keyof typeof prompts] || prompts.improve }],
      temperature: 0.7,
    }

    const response = await axios.post('http://localhost:11434/v1/chat/completions', payload1, {
      // responseType: "stream",
      httpsAgent: httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("Ollama response data:", response.data?.choices[0]?.message?.content)

    // const { text } = await generateText({
    //   model: ollama(process.env.OLLAMA_MODEL || "llama3.2"),
    //   prompt: prompts[action as keyof typeof prompts] || prompts.improve,
    //   maxOutputTokens: 1000,
    //   temperature: 0.7,
    // })

    return Response.json({ result: response.data?.choices[0]?.message.content || "" })
  } catch (error) {
    console.error("[v0] Enhancement error:", JSON.stringify(error))
    return Response.json({ error: "Failed to enhance content" }, { status: 500 })
  }
}

async function streamOllamaResponse(modelConfig: LLMConfig | null, payload: any, writer: WritableStreamDefaultWriter) {
  try {
    const url = "http://localhost:11434/v1" + "/chat/completions"
    const API_KEY = "sk-12345"
    const response = await axios.post(url, payload, {
      responseType: "stream",
      httpsAgent: httpsAgent,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
    })


    const decoder = new TextDecoder()
    const stream = response.data

    // Process each chunk from Ollama
    for await (const chunk of stream) {
      const text = decoder.decode(chunk, { stream: true })

      // Write the chunk to our stream
      await writer.write(new TextEncoder().encode(`${text}\n\n`))
    }

    // Close the stream when done
    await writer.close()
  } catch (error) {
    console.error("Streaming error:", error)
    await writer.abort(error)
  }
}
