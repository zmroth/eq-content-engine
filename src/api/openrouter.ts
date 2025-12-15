import https from 'https';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private model: string;
  private baseUrl = 'openrouter.ai';

  constructor(apiKey: string, model: string = 'anthropic/claude-opus-4.5') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(messages: Message[]): Promise<string> {
    const data = JSON.stringify({
      model: this.model,
      messages: messages,
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'EQ Content Engine',
        },
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response: OpenRouterResponse = JSON.parse(body);
            if (response.choices && response.choices[0]) {
              resolve(response.choices[0].message.content);
            } else {
              reject(new Error('Invalid response from OpenRouter'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const messages: Message[] = [
      { role: 'system', content: systemPrompt + '\n\nRespond with valid JSON only, no markdown.' },
      { role: 'user', content: userPrompt },
    ];

    const response = await this.chat(messages);

    // Try to extract JSON from the response
    let jsonStr = response;

    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    return JSON.parse(jsonStr.trim());
  }
}
