// Cloudflare Pages Function: POST /api/chat
// AI chat endpoint using Cloudflare Workers AI

interface Env {
  AI: Ai;
  CHAT_LOGS: KVNamespace;
  PHOTOGRAPHY: R2Bucket;
}

type PhotoCategory = 'pet' | 'plant' | 'people' | 'landscape' | 'architecture' | 'food' | 'other';

interface PhotoData {
  url: string;
  title: string;
  category: PhotoCategory;
}

// Fetch photos from R2 bucket
async function getPhotos(bucket: R2Bucket): Promise<PhotoData[]> {
  try {
    const listed = await bucket.list({
      prefix: 'public/images/',
      include: ['customMetadata'],
    } as R2ListOptions & { include: string[] });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    const imageObjects = listed.objects.filter((obj) => {
      const key = obj.key.toLowerCase();
      if (key.endsWith('/')) return false;
      return imageExtensions.some((ext) => key.endsWith(ext));
    });

    return imageObjects.map((obj) => {
      const customMeta = obj.customMetadata || {};
      return {
        url: `https://media.yunwustudio.com/${obj.key}`,
        title: customMeta.title || obj.key.split('/').pop() || 'Photo',
        category: (customMeta.category as PhotoCategory) || 'other',
      };
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

// Build photo gallery info for system prompt
function buildPhotoPrompt(photos: PhotoData[], language: 'en' | 'zh'): string {
  const categories: Record<PhotoCategory, PhotoData[]> = {
    pet: [],
    plant: [],
    people: [],
    landscape: [],
    architecture: [],
    food: [],
    other: [],
  };

  for (const photo of photos) {
    categories[photo.category].push(photo);
  }

  if (language === 'zh') {
    let prompt = `\n\n## 照片库\n你可以分享伍芸拍摄的照片！当用户询问照片时，用markdown格式回复：![描述](url)\n\n`;
    prompt += `可用照片分类：\n`;
    if (categories.pet.length > 0) prompt += `- 宠物 (${categories.pet.length}张): 狗、猫等宠物照片\n`;
    if (categories.plant.length > 0) prompt += `- 植物 (${categories.plant.length}张)\n`;
    if (categories.people.length > 0) prompt += `- 人物 (${categories.people.length}张)\n`;
    if (categories.landscape.length > 0) prompt += `- 风景 (${categories.landscape.length}张)\n`;
    if (categories.architecture.length > 0) prompt += `- 建筑 (${categories.architecture.length}张)\n`;
    if (categories.food.length > 0) prompt += `- 美食 (${categories.food.length}张)\n`;

    prompt += `\n当用户要求看照片时，选择1-2张照片分享。`;
    prompt += `\n重要：当用户说"更多"、"下一张"、"还有吗"、"再来一张"时，一定要分享之前没展示过的不同照片！\n`;
    prompt += `\n### 照片URLs:\n`;
    for (const [cat, list] of Object.entries(categories)) {
      if (list.length > 0) {
        prompt += `${cat}: ${list.slice(0, 15).map(p => p.url).join(', ')}\n`;
      }
    }
    return prompt;
  }

  let prompt = `\n\n## Photo Gallery\nYou can share photos taken by Yun! When users ask for photos, respond with markdown: ![description](url)\n\n`;
  prompt += `Available photo categories:\n`;
  if (categories.pet.length > 0) prompt += `- Pet (${categories.pet.length} photos): dogs, cats, and other pets\n`;
  if (categories.plant.length > 0) prompt += `- Plant (${categories.plant.length} photos)\n`;
  if (categories.people.length > 0) prompt += `- People (${categories.people.length} photos)\n`;
  if (categories.landscape.length > 0) prompt += `- Landscape (${categories.landscape.length} photos)\n`;
  if (categories.architecture.length > 0) prompt += `- Architecture (${categories.architecture.length} photos)\n`;
  if (categories.food.length > 0) prompt += `- Food (${categories.food.length} photos)\n`;

  prompt += `\nWhen users ask for photos, pick 1-2 photos from the matching category.`;
  prompt += `\nIMPORTANT: When users say "more", "another", "next", or "show me more", always share DIFFERENT photos that you haven't shown before!\n`;
  prompt += `\n### Photo URLs:\n`;
  for (const [cat, list] of Object.entries(categories)) {
    if (list.length > 0) {
      prompt += `${cat}: ${list.slice(0, 15).map(p => p.url).join(', ')}\n`;
    }
  }
  return prompt;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  language: 'en' | 'zh';
}

const SYSTEM_PROMPT_EN = `You are a helpful AI assistant for Yun Wu's portfolio website at yunwustudio.com.

## Response Guidelines
- Give complete, coherent answers. Never cut off mid-sentence.
- Keep responses concise: 2-4 sentences for simple questions, more for complex ones.
- Be friendly and professional.
- If you don't know something, say so honestly.

## Who is Yun Wu?
Yun Wu (伍芸) is a visual storyteller and designer based in Seattle, WA, USA.
- "Yun" = first name, "Wu" = last name (same person)
- Specializes in: Photography, Video Production, UI/UX Design
- Contact: Yunwustudio@gmail.com
- Has 100,000+ social media followers

## Services Offered
1. Design: UI/UX design, web design, app design, branding
2. Video: Story-driven photo and video campaigns for brands
3. Photography: Social media content, brand partnerships, lifestyle photography

## Notable Projects
- HUADI (Web Design)
- SCRM System (创智集客) - CRM platform
- COC Web and Mobile Apps
- Luna Kitchen & Bath (Social Media)
- 创客集成 App
- Game icons, Beauty Mini Program, various UI work

## Brand Partners
BELLE, Chinese Radio Seattle, Joy Moving, Luna, MICA, Murasec, Ride the Wind Workshop, US China Press, Asian Photography Association

## Personal Interests
Enjoys films, documentaries, TV series, and Animal Crossing. Passionate about documenting life through photography.

For pricing or availability inquiries, direct visitors to email: Yunwustudio@gmail.com`;

const SYSTEM_PROMPT_ZH = `你是伍芸作品集网站 yunwustudio.com 的AI助手。

## 回答要求
- 给出完整、连贯的回答，不要中途截断。
- 保持简洁：简单问题2-4句话，复杂问题可以更长。
- 友好专业。
- 不确定的事情要诚实说明。

## 伍芸是谁？
伍芸（Yun Wu）是驻美国西雅图的视觉叙事者和设计师。
- "芸"是名，"伍"是姓（同一个人）
- 专长：摄影、视频制作、UI/UX设计
- 联系方式：Yunwustudio@gmail.com
- 社交媒体粉丝超过10万

## 提供的服务
1. 设计：UI/UX设计、网页设计、应用设计、品牌设计
2. 影片：为品牌打造故事驱动的照片和视频内容
3. 摄影：社交媒体内容、品牌合作、生活方式摄影

## 代表项目
- HUADI（网页设计）
- 创智集客SCRM系统
- COC网页和移动应用
- Luna厨卫（社交媒体设计）
- 创客集成App
- 游戏图标、Beauty小程序、各类UI设计

## 合作品牌
百丽、西雅图中文电台、Joy Moving、Luna、MICA、Murasec、乘风工作室、美国中文网、亚洲摄影协会

## 个人兴趣
喜欢电影、纪录片、电视剧和《动物森友会》。热爱用摄影记录生活。

价格或档期咨询请联系：Yunwustudio@gmail.com`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { messages, language } = (await context.request.json()) as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch photos and build enhanced system prompt
    const photos = context.env.PHOTOGRAPHY ? await getPhotos(context.env.PHOTOGRAPHY) : [];
    const basePrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
    const photoPrompt = photos.length > 0 ? buildPhotoPrompt(photos, language) : '';
    const systemPrompt = basePrompt + photoPrompt;

    const aiMessages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

    // Log conversation to KV (non-blocking)
    const userMessages = messages.filter((m) => m.role === 'user');
    if (userMessages.length > 0 && context.env.CHAT_LOGS) {
      const logId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const logEntry = {
        id: logId,
        timestamp: new Date().toISOString(),
        language,
        messages: userMessages.map((m) => m.content),
        userAgent: context.request.headers.get('user-agent') ?? 'unknown',
      };
      // Fire and forget - don't await to avoid slowing down response
      void context.env.CHAT_LOGS.put(logId, JSON.stringify(logEntry), {
        expirationTtl: 60 * 60 * 24 * 30, // Keep logs for 30 days
      });
    }

    // Using Llama 3.3 70B for better quality responses
    const response = await (context.env.AI.run as (model: string, options: { messages: ChatMessage[]; stream: boolean }) => Promise<ReadableStream>)(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: aiMessages,
        stream: true,
      }
    );

    return new Response(response as ReadableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
