import Anthropic from '@anthropic-ai/sdk'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors })
  }

  try {
    const { image, mimeType } = await request.json()

    if (!image || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing image or mimeType' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: image }
          },
          {
            type: 'text',
            text: 'This is a photo of a mixtape or cassette tape label. Extract all song titles and artist names you can see — including handwritten text. Return ONLY a JSON array where each item has "artist" and "title" fields. Use an empty string for unknown artists. Example: [{"artist":"Madonna","title":"Like a Prayer"},{"artist":"","title":"Unknown Track"}]. Return only valid JSON, no markdown, no explanation.'
          }
        ]
      }]
    })

    const text = response.content[0].text.trim()
    let tracks = []
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      tracks = JSON.parse(jsonMatch ? jsonMatch[1] : text)
      if (!Array.isArray(tracks)) tracks = []
    } catch {
      tracks = []
    }

    return new Response(JSON.stringify({ tracks }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
}

export const config = { path: '/api/analyze' }
