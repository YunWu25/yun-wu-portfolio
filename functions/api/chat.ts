// Cloudflare Pages Function: POST /api/chat
// AI chat endpoint using Cloudflare Workers AI
// Refactored: Dynamic photo fetching from R2 metadata with strict prompt injection

interface Env {
  AI: Ai;
  CHAT_LOGS: KVNamespace;
  PHOTOGRAPHY: R2Bucket;
}

// =============================================================================
// PHOTO TYPES & CATEGORIES
// =============================================================================

type PhotoCategory =
  | 'animal'
  | 'plant'
  | 'flower'
  | 'people'
  | 'landscape'
  | 'architecture'
  | 'food'
  | 'yun'
  | 'sky'
  | 'lake'
  | 'client'
  | 'music'
  | 'museum'
  | 'dog'
  | 'cat'
  | 'christmas'
  | 'other';

// Category display names for prompt
const CATEGORY_LABELS: Record<PhotoCategory, { en: string; zh: string }> = {
  animal: { en: 'Animal', zh: '动物' },
  plant: { en: 'Plant', zh: '植物' },
  flower: { en: 'Flower', zh: '花卉' },
  people: { en: 'People', zh: '人物' },
  landscape: { en: 'Landscape', zh: '风景' },
  architecture: { en: 'Architecture', zh: '建筑' },
  food: { en: 'Food', zh: '美食' },
  yun: { en: 'Yun Wu', zh: '伍芸' },
  sky: { en: 'Sky', zh: '天空' },
  lake: { en: 'Lake', zh: '湖泊' },
  client: { en: 'Portrait', zh: '人像' },
  music: { en: 'Music', zh: '音乐' },
  museum: { en: 'Museum', zh: '博物馆' },
  dog: { en: 'Dog', zh: '狗狗' },
  cat: { en: 'Cat', zh: '猫咪' },
  christmas: { en: 'Christmas', zh: '圣诞节' },
  other: { en: 'Other', zh: '其他' },
};

interface PhotoData {
  url: string;
  title: string;
  category: PhotoCategory;
}

// =============================================================================
// R2 PHOTO FETCHING
// =============================================================================

async function fetchPhotosFromR2(bucket: R2Bucket): Promise<PhotoData[]> {
  try {
    const listed = await bucket.list({
      prefix: 'public/images/',
      include: ['customMetadata'],
    } as R2ListOptions & { include: string[] });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

    return listed.objects
      .filter((obj) => {
        // Filter out directories and non-image files
        if (obj.size === 0 || obj.key.endsWith('/')) return false;
        const key = obj.key.toLowerCase();
        if (!imageExtensions.some((ext) => key.endsWith(ext))) return false;

        // Only include photos marked for gallery display
        const meta = obj.customMetadata ?? {};
        return meta.showInGallery !== 'false';
      })
      .map((obj) => {
        const meta = obj.customMetadata ?? {};
        const filename = obj.key.split('/').pop() ?? 'Photo';

        return {
          url: `https://media.yunwustudio.com/${obj.key}`,
          title: meta.title || filename.replace(/\.[^.]+$/, ''),
          category: (meta.category as PhotoCategory) || 'other',
        };
      });
  } catch (error) {
    console.error('Error fetching photos from R2:', error);
    return [];
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Shuffle array randomly (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

// Group photos by category
function groupByCategory(photos: PhotoData[]): Map<PhotoCategory, PhotoData[]> {
  const groups = new Map<PhotoCategory, PhotoData[]>();

  for (const photo of photos) {
    const existing = groups.get(photo.category) ?? [];
    existing.push(photo);
    groups.set(photo.category, existing);
  }

  return groups;
}

// Pick N random photos from an array
function pickRandom<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, Math.min(count, array.length));
}

// Build pre-formatted markdown block for photos (ALL photos together, no splitting)
function buildMarkdownBlock(photos: PhotoData[]): string {
  return photos.map((p) => `![${p.title}](${p.url})`).join('\n');
}

// =============================================================================
// PHOTO PROMPT BUILDER - Dynamic from R2
// =============================================================================

interface SelectedPhotoGroup {
  category: PhotoCategory;
  photos: PhotoData[];
}

function buildPhotoPrompt(
  selectedGroups: SelectedPhotoGroup[],
  language: 'en' | 'zh'
): string {
  if (selectedGroups.length === 0) {
    return ''; // No photos available
  }

  if (language === 'zh') {
    let prompt = `\n\n## 照片分享 - 你可以显示图片\n`;
    prompt += `重要：你可以显示图片！只要输出下面的文字，图片就会出现。\n\n`;

    for (const group of selectedGroups) {
      const label = CATEGORY_LABELS[group.category].zh;
      prompt += `${label} - 直接输出这段文字：\n${buildMarkdownBlock(group.photos)}\n\n`;
    }

    prompt += `示例：用户说"狗"，你回复"这是一些狗狗的照片！"然后下一行输出：![Milo](https://media.yunwustudio.com/...)\n`;
    prompt += `![名字](网址) 这段文字会显示成图片。你不是纯文字助手，请输出上面的图片代码。\n`;
    prompt += `可用：${selectedGroups.map((g) => CATEGORY_LABELS[g.category].zh).join('、')}。其他分类说"请访问Photography页面"。\n`;

    return prompt;
  }

  // English version
  let prompt = `\n\n## Photo Sharing - YOU CAN DISPLAY IMAGES\n`;
  prompt += `IMPORTANT: You CAN show images! Just output the text exactly as shown below and images will appear.\n\n`;

  for (const group of selectedGroups) {
    const label = CATEGORY_LABELS[group.category].en;
    prompt += `${label} - just output this text:\n${buildMarkdownBlock(group.photos)}\n\n`;
  }

  prompt += `EXAMPLE: If user says "dog", reply with something like "Here are some dog photos!" then on the next line output exactly: ![Milo](https://media.yunwustudio.com/...)\n`;
  prompt += `The ![name](url) text WILL display as an image. You are NOT text-only. Output the image codes above.\n`;
  prompt += `Available: ${selectedGroups.map((g) => CATEGORY_LABELS[g.category].en).join(', ')}. Other categories → say "Please visit the Photography page".\n`;

  return prompt;
}

// Main function: Fetch photos, sample categories, build prompt
async function preparePhotoPrompt(
  bucket: R2Bucket | undefined,
  language: 'en' | 'zh'
): Promise<string> {
  if (!bucket) {
    return '';
  }

  // Fetch all gallery photos from R2
  const allPhotos = await fetchPhotosFromR2(bucket);
  if (allPhotos.length === 0) {
    return '';
  }

  // Group by category
  const categoryGroups = groupByCategory(allPhotos);

  // Filter to categories with at least 1 photo
  const validCategories = Array.from(categoryGroups.entries())
    .filter(([_, photos]) => photos.length >= 1)
    .map(([cat]) => cat);

  if (validCategories.length === 0) {
    return '';
  }

  // Prioritize popular categories (dog, cat) if available, then fill with random ones
  const priorityCategories: PhotoCategory[] = ['dog', 'cat'];
  const guaranteedCategories = priorityCategories.filter((cat) =>
    validCategories.includes(cat)
  );
  const remainingCategories = validCategories.filter(
    (cat) => !priorityCategories.includes(cat)
  );
  const randomFill = pickRandom(remainingCategories, 3 - guaranteedCategories.length);
  const selectedCategories = [...guaranteedCategories, ...randomFill];

  // From each selected category, pick up to 3 random photos
  const selectedGroups: SelectedPhotoGroup[] = selectedCategories.map((cat) => {
    const photos = categoryGroups.get(cat) ?? [];
    const photosPerCategory = Math.min(photos.length, 3);
    return {
      category: cat,
      photos: pickRandom(photos, photosPerCategory),
    };
  });

  return buildPhotoPrompt(selectedGroups, language);
}

// =============================================================================
// CHAT TYPES & SYSTEM PROMPTS
// =============================================================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  language: 'en' | 'zh';
  username?: string;
}

const SYSTEM_PROMPT_EN = `You are a helpful AI assistant for Yun Wu's portfolio website at yunwustudio.com.

## Response Guidelines
- Give complete, coherent answers. Never cut off mid-sentence.
- Keep responses concise: 2-4 sentences for simple questions, more for complex ones.
- Be friendly and professional.
- If you don't know something, say so honestly.
- **Formatting**: Avoid long paragraphs. Add line breaks every 1-2 sentences for readability.

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

## Extended Assistance (Welcome!)
You can also help visitors with:
1. **Coding**: Programming questions, debugging, web development tips.
2. **Math**: Solve math problems, explain concepts.
3. **Learning Chinese**: Help visitors learn Mandarin, explain characters, phrases, and culture.

## Guardrails (Topic Limits)
- For political, controversial, or sensitive topics, politely decline: "Sorry, as Yun's AI assistant, I can only help with technology, learning, Yun's portfolio, and business inquiries."
- Stay focused on helpful, constructive conversations.

## Business CTA
For pricing or availability inquiries, direct visitors to email: Yunwustudio@gmail.com`;

const SYSTEM_PROMPT_ZH = `你是伍芸作品集网站 yunwustudio.com 的AI助手。

## 回答要求
- 给出完整、连贯的回答，不要中途截断。
- 保持简洁：简单问题2-4句话，复杂问题可以更长。
- 友好专业。
- 不确定的事情要诚实说明。
- **排版**：避免输出大段不换行的长文本，每1-2句话换行，保持视觉清晰。

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

## 扩展助手能力（欢迎提问！）
你还可以帮助访客：
1. **编程**：解答编程问题、调试代码、网页开发技巧。
2. **数学**：解决数学问题、解释概念。
3. **学中文**：帮助访客学习普通话、解释汉字、词语和中国文化。

## 安全与话题限制
- 对于政治、争议性或敏感话题，优雅拒绝："抱歉，作为伍芸的AI助理，我只能协助您探讨技术、学习、以及伍芸的作品集与商务合作。"
- 保持对话积极、有建设性。

## 商务引导（CTA）
价格或档期咨询请联系：Yunwustudio@gmail.com`;

// =============================================================================
// MAIN HANDLER
// =============================================================================

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { messages, language, username } = (await context.request.json()) as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Dynamically fetch and sample photos from R2
    const photoPrompt = await preparePhotoPrompt(context.env.PHOTOGRAPHY, language);

    // Build system prompt
    const basePrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

    // Build personalized username prompt if provided
    let usernamePrompt = '';
    const cleanUsername = username?.trim();
    if (cleanUsername) {
      usernamePrompt =
        language === 'zh'
          ? `\n\n## 当前对话访客\n当前正在和你聊天的访客名字叫「${cleanUsername}」。在对话过程中，请偶尔、自然地称呼他们的名字，让他们感受到个性化与亲切的互动（但切勿每句话都重复，保持自然）。`
          : `\n\n## Current Visitor\nThe visitor's name is "${cleanUsername}". Please address them by their name occasionally and naturally during the conversation to provide a personalized experience (do not overdo it, keep it natural).`;
    }

    const systemPrompt = basePrompt + usernamePrompt + photoPrompt;

    const aiMessages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

    // Log conversation to KV - group by IP + date + device
    const userMessages = messages.filter((m) => m.role === 'user');
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    if (lastUserMessage && context.env.CHAT_LOGS) {
      const clientIP =
        context.request.headers.get('cf-connecting-ip') ??
        context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown';

      const userAgent = context.request.headers.get('user-agent') ?? 'unknown';
      const deviceHash =
        userAgent.length.toString(36) +
        (userAgent.includes('Mobile') ? 'm' : 'd') +
        (userAgent.includes('Chrome')
          ? 'c'
          : userAgent.includes('Safari')
            ? 's'
            : userAgent.includes('Firefox')
              ? 'f'
              : 'x');

      const today = new Date().toISOString().split('T')[0];
      const ipHash = clientIP.split('.').slice(-2).join('');
      const sessionId = `session_${today}_${ipHash}_${deviceHash}`;

      const existingData = await context.env.CHAT_LOGS.get(sessionId);

      interface SessionLog {
        id: string;
        firstSeen: string;
        lastSeen: string;
        language: string;
        userAgent: string;
        ipHint: string;
        username?: string;
        messages: Array<{ time: string; content: string }>;
      }

      const now = new Date().toISOString();
      const newMessage = {
        time: now,
        content: lastUserMessage.content,
      };

      let logEntry: SessionLog;
      if (existingData) {
        const existing = JSON.parse(existingData) as SessionLog;
        logEntry = {
          ...existing,
          lastSeen: now,
          username: cleanUsername ?? existing.username,
          messages: [...existing.messages, newMessage],
        };
      } else {
        logEntry = {
          id: sessionId,
          firstSeen: now,
          lastSeen: now,
          language,
          userAgent: context.request.headers.get('user-agent') ?? 'unknown',
          ipHint: `***.***${ipHash ? '.' + ipHash : ''}`,
          username: cleanUsername,
          messages: [newMessage],
        };
      }

      void context.env.CHAT_LOGS.put(sessionId, JSON.stringify(logEntry), {
        expirationTtl: 60 * 60 * 24 * 30,
      });
    }

    // Using Llama 3.2 3B with 15-second timeout
    const AI_TIMEOUT_MS = 15000;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ai = context.env.AI as any;

    const aiPromise = ai.run('@cf/meta/llama-3.2-3b-instruct', {
      messages: aiMessages,
      stream: true,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI response timeout - please try again')), AI_TIMEOUT_MS);
    });

    const response = await Promise.race([aiPromise, timeoutPromise]);

    return new Response(response as ReadableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request', details: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
