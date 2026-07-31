import axios from 'axios'

export async function generateResponse(prompt: string, providerId: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (apiKey) {
    // Map providerId to actual OpenRouter model identifiers
    const models: Record<string, string> = {
      'cheap-llm': 'meta-llama/llama-3.2-1b-instruct:free',
      'balanced-ai': 'meta-llama/llama-3.1-8b-instruct:free',
      'premium-ai': 'google/gemini-2-flash',
    }

    const modelName = models[providerId] || 'meta-llama/llama-3.1-8b-instruct:free'

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )
      
      const content = response.data?.choices?.[0]?.message?.content
      if (content) {
        return `[Real routed output from ${providerId} (${modelName})]\n\n${content}`
      }
    } catch (e: any) {
      console.warn(`OpenRouter failed for ${providerId}:`, e.message || e)
      return `[Provider unavailable]\n\nThe x402 payment was accepted, but the configured OpenRouter model could not respond. Check OPENROUTER_API_KEY and model availability.\n\nDetails: ${e.message || 'unknown provider error'}`
    }
  }

  // Explicit demo fallback. It never claims that a real model generated output.
  const delays: Record<string, number> = {
    'cheap-llm': 280,
    'premium-ai': 180,
    'balanced-ai': 220,
  }

  const delay = delays[providerId] || 200
  await new Promise(resolve => setTimeout(resolve, delay))

  // Generate mock response
  const responses: Record<string, string> = {
    'cheap-llm': `[Demo provider response — no OPENROUTER_API_KEY configured]\n\n${prompt}\n\nAdd OPENROUTER_API_KEY in Render to return a real Llama response after x402 settlement.`,
    'premium-ai': `[Demo provider response — no OPENROUTER_API_KEY configured]\n\n${prompt}\n\nAdd OPENROUTER_API_KEY in Render to return a real Gemini response after x402 settlement.`,
    'balanced-ai': `[Demo provider response — no OPENROUTER_API_KEY configured]\n\n${prompt}\n\nAdd OPENROUTER_API_KEY in Render to return a real Mistral/Llama response after x402 settlement.`,
  }

  return responses[providerId] || `Response to: ${prompt}`
}

export async function callProvider(providerId: string, prompt: string): Promise<{ result: string; latency: number }> {
  const startTime = Date.now()

  try {
    const result = await generateResponse(prompt, providerId)
    const latency = Date.now() - startTime

    return { result, latency }
  } catch (error) {
    throw new Error(`Provider ${providerId} failed: ${error}`)
  }
}
