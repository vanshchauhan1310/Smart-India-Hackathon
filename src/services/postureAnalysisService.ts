import { getOpenRouterService, ChatMessage } from './openRouterService';

export interface PostureAnalysisRequest {
  sport: string;
  image_data: string; // base64 encoded image
}

class PostureAnalysisService {
  // Do NOT call getOpenRouterService() at module/class construction time.
  // Instead, lazily obtain the OpenRouter service inside methods so
  // initializeOpenRouter() has a chance to run first (typically from App.tsx).

  // Posture analysis
  async analyzePosture(request: PostureAnalysisRequest): Promise<{
    answer: string;
  }> {
    try {
  const messages: any = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze my posture for ${request.sport}.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${request.image_data}`
              }
            }
          ]
        }
      ];

      // Lazily get the OpenRouter service so we don't throw during module init
      const openRouterService = getOpenRouterService();

      // We need to modify openRouterService to handle multimodal messages.
      // Cast to `any` here to avoid TypeScript complaints until a proper multimodal
      // message type is introduced.
      return await (openRouterService as any).sendMessage(messages as any, {
        // unknown custom flag for server-side handling; cast to any as well
        postureMode: true,
        userSport: request.sport
      } as any);
    } catch (error) {
      console.error('Posture analysis error:', error);
      return {
        answer: 'I apologize, but I\'m having trouble analyzing your posture right now. Please try again later.'
      };
    }
  }
}

// Singleton instance
let postureAnalysisService: PostureAnalysisService | null = null;

export const initializePostureAnalysisService = () => {
  postureAnalysisService = new PostureAnalysisService();
};

export const getPostureAnalysisService = (): PostureAnalysisService => {
  if (!postureAnalysisService) {
    throw new Error('PostureAnalysisService not initialized. Call initializePostureAnalysisService first.');
  }
  return postureAnalysisService;
};

export default PostureAnalysisService;