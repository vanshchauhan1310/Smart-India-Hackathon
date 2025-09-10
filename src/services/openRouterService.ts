// ...existing code...

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}


export interface SportGuidanceRequest {
  sport: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  focusArea: string;
  userGoals?: string;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private model: string;

  /**
   * apiKey: OpenRouter API key
   * model?: optional model id string (if omitted, set later or default to one you have access to)
   */
  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'openai/gpt-3.5-turbo';
  }

  // System prompts for different functionalities
  private getSystemPrompt(type: 'faq' | 'sports' | 'emergency' | 'recruiter' | 'general'): string {
    const prompts = {
      faq: `You are an AI assistant for a sports talent assessment app. Help users with:
- App navigation and usage
- Test procedures and requirements
- Performance analysis interpretation
- Technical troubleshooting
- Account management
Keep responses concise and helpful.`,

      sports: `You are a specialized sports guidance AI assistant. Provide expert advice on:
Always personalize advice based on the user's sport, skill level, and goals.`,
  // add a short directive to prefer concise, friendly replies

      emergency: `You are an emergency response AI for sports-related incidents. Provide:
Always prioritize user safety and recommend professional medical help when needed.`,

      recruiter: `You are a talent connection AI that helps match recruiters with athletes. Assist with:
Maintain professionalism and confidentiality.`,

      general: `You are an AI Sports Assistant for a talent assessment app. You help with:

Always be helpful, encouraging, and provide actionable advice. Adapt your responses to the user's specific sport and experience level.`
    };

    return prompts[type];
  }

  // Main chat completion method
  /**
   * Returns a text response only. Video search should be handled by a separate service/model.
   */
  async sendMessage(
    messages: ChatMessage[],
    context?: {
      userSport?: string;
      skillLevel?: string;
      recentTests?: any[];
      emergencyMode?: boolean;
      recruiterMode?: boolean;
  // allow callers to request a larger raw response from the model
  maxResponseTokens?: number;
  // if true (default) we post-process to keep replies short; if false, return more of the raw text
  preferConcise?: boolean;
    }
  ): Promise<{ answer: string }> {
    try {
      // Log configured model for runtime visibility
      console.info('[OpenRouter] configured model:', this.model);

      // Determine the appropriate system prompt based on context
      let systemPromptType: 'faq' | 'sports' | 'emergency' | 'recruiter' | 'general' = 'general';
      if (context?.emergencyMode) {
        systemPromptType = 'emergency';
      } else if (context?.recruiterMode) {
        systemPromptType = 'recruiter';
      } else if (context?.userSport) {
        systemPromptType = 'sports';
      }

      // Always include a system prompt as the first message
      const systemPrompt: ChatMessage = {
        role: 'system',
        content: this.getSystemPrompt(systemPromptType) +
          (context?.userSport ? `\n\nUser's primary sport: ${context.userSport}` : '') +
          (context?.skillLevel ? `\nSkill level: ${context.skillLevel}` : '') +
          (context?.recentTests ? `\nRecent test performance: ${JSON.stringify(context.recentTests)}` : '')
      };
      // Remove any previous system prompts from messages
      const filteredMessages = messages.filter(m => m.role !== 'system');
      const conversationMessages: ChatMessage[] = [systemPrompt, ...filteredMessages];

      // fallback candidates to try if current model is invalid
      const fallbackModels = [
        'openrouter/sonoma-sky-alpha',
        'openrouter/llama-3-8b-instruct',
        'openai/gpt-3.5-turbo'
      ];

      // Helper to perform the HTTP request using a specific model
      const attemptWithModel = async (modelToUse: string) => {
        console.info('[OpenRouter] attempting with model:', modelToUse);
        const maxRetries = 2;
        let attempt = 0;
        while (true) {
          attempt++;
          try {
            const resp = await fetch(`${this.baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://your-app-domain.com',
                'X-Title': 'Sports Talent Assessment App'
              },
              body: JSON.stringify({
                model: modelToUse,
                messages: conversationMessages,
                // prefer concise replies by default; allow larger raw responses when requested
                temperature: 0.25,
                max_tokens: context?.maxResponseTokens ?? 200,
                top_p: 0.7,
                frequency_penalty: 0.0,
                presence_penalty: 0.0
              })
            });

            if (!resp.ok) {
              // Try to extract useful server error info
              let errorBody: any = null;
              try {
                errorBody = await resp.json();
              } catch (e) {
                try {
                  const txt = await resp.text();
                  errorBody = { message: txt };
                } catch {}
              }
              const serverMsg = errorBody?.error?.message || errorBody?.message || `status ${resp.status}`;

              // If transient server error or provider error, retry a few times
              const lower = String(serverMsg).toLowerCase();
              const isTransient = resp.status >= 500 || lower.includes('provider') || lower.includes('timeout') || lower.includes('temporar');
              if (isTransient && attempt <= maxRetries) {
                const backoff = 200 * Math.pow(2, attempt - 1);
                console.warn(`[OpenRouter] transient error from model ${modelToUse} (attempt ${attempt}). Retrying in ${backoff}ms.`, serverMsg);
                await new Promise(res => setTimeout(res, backoff));
                continue; // retry
              }

              // Non-transient or exhausted retries -> throw
              throw new Error(`status ${resp.status}: ${serverMsg}`);
            }

            const parsed: OpenRouterResponse = await resp.json();
            return parsed;
          } catch (err) {
            // network or other fetch-level error
            const errMsg = String((err as Error).message || err);
            if (attempt <= maxRetries && (errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('failed') || errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('provider'))) {
              const backoff = 200 * Math.pow(2, attempt - 1);
              console.warn(`[OpenRouter] fetch error for model ${modelToUse} (attempt ${attempt}). Retrying in ${backoff}ms.`, errMsg);
              await new Promise(res => setTimeout(res, backoff));
              continue;
            }
            throw err;
          }
        }
      };

      // Primary attempt with configured model, then try fallbacks if server says model invalid
      let data: OpenRouterResponse | null = null;
      try {
        data = await attemptWithModel(this.model);
      } catch (err: any) {
        const msg = String(err?.message || err);
        console.warn('[OpenRouter] initial model error:', msg);

        // If this is an authentication/permission error, don't try fallbacks
        const lower = msg.toLowerCase();
        const isAuthError = lower.includes('unauthorized') || lower.includes('invalid api key') || lower.includes('401') || lower.includes('403') || lower.includes('forbidden');
        if (isAuthError) {
          console.error('[OpenRouter] authentication/permission error detected, will not try fallback models.');
          throw err;
        }

        // For other errors (provider errors, invalid model, transient server errors), try fallbacks
        let tried: string[] = [];
        for (const candidate of fallbackModels) {
          if (candidate === this.model) continue;
          tried.push(candidate);
          try {
            const attempt = await attemptWithModel(candidate);
            // persist working model
            this.model = candidate;
            data = attempt;
            console.info('[OpenRouter] switched to working model:', candidate);
            break;
          } catch (e) {
            console.warn('[OpenRouter] model candidate failed:', candidate, String((e as Error).message));
            continue;
          }
        }

        if (!data) {
          // No fallback worked
          const attempted = [this.model, ...tried].join(', ');
          const finalMsg = `All model attempts failed. Tried: ${attempted}. Last error: ${msg}`;
          console.error('[OpenRouter] ' + finalMsg);
          throw new Error(finalMsg);
        }
      }

      // Post-process to keep replies short, friendly and fluent
      const raw = data!.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      /*
      const shortenAnswer = (text: string, preferConcise = true): string => {
        if (!text) return text;
        // collapse whitespace
        let t = text.replace(/\s+/g, ' ').trim();
        // if caller prefers raw/long responses, return trimmed raw text (but still collapse whitespace)
        if (!preferConcise) {
          // cap to a reasonable safety length to avoid returning extremely large blobs
          return t.slice(0, 4000).trim();
        }
        // split into sentences (rough)
        const parts = t.match(/[^.!?]+[.!?]?/g) || [t];
        // keep first 1-2 sentences depending on length
        let keep = parts.slice(0, 1).join(' ').trim();
        if (keep.length < 80 && parts.length > 1) {
          keep = parts.slice(0, 2).join(' ').trim();
        }
        // ensure friendly closing if not present
        if (!/[.!?]$/.test(keep)) keep = keep + '.';
        return keep;
      };

      const finalAnswer = shortenAnswer(raw, context?.preferConcise ?? true);
      */
      return { answer: raw };
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      return { answer: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.' };
    }
  }

  // Sports guidance (text only)
  async getSportsGuidance(request: SportGuidanceRequest): Promise<{
    answer: string;
  }> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: `I need guidance for ${request.sport}. My skill level is ${request.skillLevel} and I want to focus on ${request.focusArea}. ${request.userGoals ? `My goals are: ${request.userGoals}` : ''}`
        }
      ];
      return await this.sendMessage(messages, {
        userSport: request.sport,
        skillLevel: request.skillLevel
      });
    } catch (error) {
      console.error('Sports guidance error:', error);
      return {
        answer: 'I apologize, but I\'m having trouble providing guidance right now. Please try again later.'
      };
    }
  }


  // Emergency response handler
  async handleEmergency(injuryDescription: string, location?: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `EMERGENCY: ${injuryDescription}${location ? ` Location: ${location}` : ''}`
      }
    ];
    const result = await this.sendMessage(messages, { emergencyMode: true });
    return result.answer;
  }

  // Recruiter-candidate matching
  async findCandidates(criteria: {
    sport: string;
    performanceLevel: string;
    location?: string;
    ageRange?: string;
  }): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `I'm a recruiter looking for ${criteria.sport} athletes with ${criteria.performanceLevel} performance level${criteria.location ? ` in ${criteria.location}` : ''}${criteria.ageRange ? ` aged ${criteria.ageRange}` : ''}`
      }
    ];
    const result = await this.sendMessage(messages, { recruiterMode: true });
    return result.answer;
  }

  // FAQ handler
  async handleFAQ(question: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: question
      }
    ];
    const result = await this.sendMessage(messages);
    return result.answer;
  }

  // Personalized response based on user context
  async getPersonalizedResponse(
    message: string,
    userContext: {
      sport?: string;
      skillLevel?: string;
      recentTests?: any[];
      goals?: string[];
      preferences?: any;
    }
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: message
      }
    ];
    const result = await this.sendMessage(messages, {
      userSport: userContext.sport,
      skillLevel: userContext.skillLevel,
      recentTests: userContext.recentTests
    });
    return result.answer;
  }
}

// Singleton instance
let openRouterService: OpenRouterService | null = null;

export const initializeOpenRouter = (apiKey: string, model?: string) => {
  openRouterService = new OpenRouterService(apiKey, model);
};

export const getOpenRouterService = (): OpenRouterService => {
  if (!openRouterService) {
    // Do not throw here — return a safe stub implementation so callers
    // (UI components, services) don't crash or spam errors when the app
    // is running without an API key configured. This stub returns friendly
    // messages and allows the app to function without fatal errors.
    console.warn('[OpenRouter] service not initialized. Using fallback stub.');
    const stub: Partial<OpenRouterService> = {
      async sendMessage(_messages: any, _context?: any) {
        return { answer: 'AI service not configured. Please set OPENROUTER_API_KEY in your environment or app config.' } as any;
      },
      async getSportsGuidance(_request: any) {
        return { answer: 'AI service not configured. Please set OPENROUTER_API_KEY.' } as any;
      },
      async handleEmergency(_injuryDescription: string, _location?: string) {
        return 'AI service not configured.';
      },
      async findCandidates(_criteria: any) {
        return 'AI service not configured.';
      },
      async handleFAQ(_question: string) {
        return 'AI service not configured.';
      },
      async getPersonalizedResponse(_message: string, _userContext: any) {
        return 'AI service not configured.';
      }
    };
    return stub as OpenRouterService;
  }
  return openRouterService;
};

export default OpenRouterService;