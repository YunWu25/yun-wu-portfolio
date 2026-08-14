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
        // Normalize category to lowercase to match CATEGORY_LABELS keys
        const rawCategory = (meta.category ?? '').toLowerCase();
        const validCategory = Object.keys(CATEGORY_LABELS).includes(rawCategory)
          ? (rawCategory as PhotoCategory)
          : 'other';

        return {
          url: `https://media.yunwustudio.com/${obj.key}`,
          title: meta.title || filename.replace(/\.[^.]+$/, ''),
          category: validCategory,
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
  return photos.map((p) => {
    // Clean the title: remove file extensions and special characters that break markdown
    const cleanTitle = p.title
      .replace(/\.[^.]+$/, '')  // Remove file extension
      .replace(/[[\]()]/g, ''); // Remove brackets/parens that break markdown
    return `![${cleanTitle}](${p.url})`;
  }).join('\n');
}

// =============================================================================
// KEYWORD-BASED PHOTO DETECTION
// =============================================================================

// Keywords that map to photo categories (English and Chinese)
const CATEGORY_KEYWORDS: Record<PhotoCategory, string[]> = {
  dog: ['dog', 'dogs', 'puppy', 'puppies', '狗', '狗狗', '小狗', 'milo'],
  cat: ['cat', 'cats', 'kitten', 'kittens', '猫', '猫咪', '小猫', '喵'],
  flower: ['flower', 'flowers', 'floral', '花', '花卉', '鲜花'],
  plant: ['plant', 'plants', '植物', '绿植'],
  landscape: ['landscape', 'scenery', 'nature', '风景', '景色', '自然'],
  architecture: ['architecture', 'building', 'buildings', '建筑', '楼'],
  food: ['food', 'meal', 'dish', '美食', '食物', '吃的'],
  people: ['people', 'person', 'portrait', '人', '人物'],
  yun: ['yun', 'yun wu', '伍芸', '芸'],
  sky: ['sky', 'cloud', 'clouds', 'sunset', 'sunrise', '天空', '云', '日落', '日出'],
  lake: ['lake', 'water', 'river', '湖', '水', '河'],
  client: ['client', 'portrait', '客户', '人像'],
  music: ['music', 'concert', 'instrument', '音乐', '乐器', '演奏'],
  museum: ['museum', 'art', 'gallery', '博物馆', '艺术', '展览'],
  christmas: ['christmas', 'xmas', 'holiday', '圣诞', '圣诞节'],
  animal: ['animal', 'animals', 'pet', 'pets', '动物', '宠物'],
  other: [],
};

// Detect which category the user is asking for photos of
function detectPhotoCategory(message: string): PhotoCategory | null {
  const lowerMessage = message.toLowerCase();

  // Check for photo-related intent
  const photoIntentKeywords = ['photo', 'picture', 'image', 'show', 'see', '照片', '图片', '看', '给我看'];
  const hasPhotoIntent = photoIntentKeywords.some(k => lowerMessage.includes(k));

  // Also trigger if user just types a category name alone
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.length === 0) continue;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        // If it's a single-word message matching a category, or has photo intent
        if (hasPhotoIntent || message.trim().length < 20) {
          return category as PhotoCategory;
        }
      }
    }
  }

  return null;
}

// Build prompt for detected photo request (AI writes intro only, photos appended separately)
function buildDetectedPhotoPrompt(
  category: PhotoCategory,
  language: 'en' | 'zh'
): string {
  const label = CATEGORY_LABELS[category];

  if (language === 'zh') {
    return `\n\n## 用户请求了${label.zh}照片\n用户想看${label.zh}照片。请写1-2句简短友好的介绍，如"这是一些${label.zh}照片！希望你喜欢！"。不要输出任何链接或代码，只写文字介绍即可，照片会自动显示。`;
  }

  return `\n\n## User requested ${label.en} photos\nThe user wants to see ${label.en} photos. Write 1-2 brief, friendly sentences as an intro like "Here are some lovely ${label.en} photos! Hope you enjoy them!" Do NOT output any links or code - just write the text intro. Photos will be displayed automatically.`;
}

// Build general photo availability prompt (when no specific category detected)
function buildGeneralPhotoPrompt(
  categoryGroups: Map<PhotoCategory, PhotoData[]>,
  language: 'en' | 'zh'
): string {
  const availableCategories = Array.from(categoryGroups.keys())
    .filter(cat => cat !== 'other')
    .map(cat => CATEGORY_LABELS[cat])
    .filter((label): label is { en: string; zh: string } => label !== undefined);

  if (availableCategories.length === 0) {
    return ''; // No valid categories to show
  }

  if (language === 'zh') {
    const catList = availableCategories.map(c => c.zh).join('、');
    return `\n\n## 照片分享\n你可以分享伍芸的摄影作品。可用分类：${catList}。如果用户想看照片，问他们想看哪类照片。`;
  }

  const catList = availableCategories.map(c => c.en).join(', ');
  return `\n\n## Photo Sharing\nYou can share Yun's photography. Available categories: ${catList}. If user wants to see photos, ask which category they'd like to see.`;
}

interface PhotoPromptResult {
  prompt: string;
  photosToAppend: string | null; // Markdown to append after AI response
}

// Main function: Prepare photo prompt based on user's message
async function preparePhotoPrompt(
  bucket: R2Bucket | undefined,
  language: 'en' | 'zh',
  userMessage: string
): Promise<PhotoPromptResult> {
  if (!bucket) {
    console.log('[Chat] No R2 bucket configured');
    return { prompt: '', photosToAppend: null };
  }

  // Fetch all gallery photos from R2
  const allPhotos = await fetchPhotosFromR2(bucket);
  console.log(`[Chat] Fetched ${allPhotos.length} photos from R2`);

  if (allPhotos.length === 0) {
    return { prompt: '', photosToAppend: null };
  }

  // Group by category
  const categoryGroups = groupByCategory(allPhotos);

  // Log available categories and photo counts
  const categoryStats = Array.from(categoryGroups.entries())
    .map(([cat, photos]) => `${cat}:${photos.length}`)
    .join(', ');
  console.log(`[Chat] Categories available: ${categoryStats}`);

  // Detect if user is asking for a specific photo category
  const detectedCategory = detectPhotoCategory(userMessage);
  console.log(`[Chat] User message: "${userMessage}" -> Detected category: ${detectedCategory ?? 'none'}`);

  if (detectedCategory) {
    const photos = categoryGroups.get(detectedCategory);
    const photoCount = photos?.length ?? 0;
    console.log(`[Chat] Found ${photoCount} photos for category "${detectedCategory}"`);

    if (photos && photos.length > 0) {
      // User asked for a specific category - prepare photos to append after AI response
      const selectedPhotos = pickRandom(photos, Math.min(photos.length, 3));
      console.log(`[Chat] Selected photos: ${selectedPhotos.map(p => p.title).join(', ')}`);
      const photosMarkdown = buildMarkdownBlock(selectedPhotos);
      return {
        prompt: buildDetectedPhotoPrompt(detectedCategory, language),
        photosToAppend: '\n\n' + photosMarkdown,
      };
    } else {
      // Category detected but no photos found - tell user
      const label = CATEGORY_LABELS[detectedCategory];
      if (!label) {
        // Unknown category, fall through to general prompt
        return { prompt: buildGeneralPhotoPrompt(categoryGroups, language), photosToAppend: null };
      }
      const noPhotosPrompt = language === 'zh'
        ? `\n\n## 用户请求了${label.zh}照片\n用户想看${label.zh}照片，但目前没有${label.zh}类别的照片可以展示。请礼貌地告知用户，并推荐他们看看其他类别的照片。`
        : `\n\n## User requested ${label.en} photos\nThe user wants to see ${label.en} photos, but there are currently no photos in that category. Please politely let them know and suggest they check out other categories.`;
      return { prompt: noPhotosPrompt, photosToAppend: null };
    }
  }

  // No specific category detected - provide general info
  return { prompt: buildGeneralPhotoPrompt(categoryGroups, language), photosToAppend: null };
}

// =============================================================================
// WEATHER FETCHING (Open-Meteo API - Free, no API key needed)
// =============================================================================

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  description: string;
}

// Weather code to description mapping
const WEATHER_CODES: Record<number, { en: string; zh: string }> = {
  0: { en: 'Clear sky', zh: '晴朗' },
  1: { en: 'Mainly clear', zh: '大部晴朗' },
  2: { en: 'Partly cloudy', zh: '多云' },
  3: { en: 'Overcast', zh: '阴天' },
  45: { en: 'Foggy', zh: '有雾' },
  48: { en: 'Depositing rime fog', zh: '雾凇' },
  51: { en: 'Light drizzle', zh: '小毛毛雨' },
  53: { en: 'Moderate drizzle', zh: '毛毛雨' },
  55: { en: 'Dense drizzle', zh: '大毛毛雨' },
  61: { en: 'Slight rain', zh: '小雨' },
  63: { en: 'Moderate rain', zh: '中雨' },
  65: { en: 'Heavy rain', zh: '大雨' },
  71: { en: 'Slight snow', zh: '小雪' },
  73: { en: 'Moderate snow', zh: '中雪' },
  75: { en: 'Heavy snow', zh: '大雪' },
  80: { en: 'Slight rain showers', zh: '阵雨' },
  81: { en: 'Moderate rain showers', zh: '中阵雨' },
  82: { en: 'Violent rain showers', zh: '暴雨' },
  95: { en: 'Thunderstorm', zh: '雷暴' },
};

async function fetchWeather(
  latitude: string | null,
  longitude: string | null,
  city: string | null,
  country: string | null,
  language: 'en' | 'zh'
): Promise<WeatherData | null> {
  if (!latitude || !longitude) {
    return null;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const response = await fetch(url, {
      cf: { cacheTtl: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      console.log('[Chat] Weather API failed:', response.status);
      return null;
    }

    const data = await response.json() as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
      };
    };

    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code ?? 0;
    const weatherInfo = WEATHER_CODES[code] ?? WEATHER_CODES[0]!;

    return {
      city: city ?? 'Unknown',
      country: country ?? '',
      temperature: temp ?? 0,
      description: language === 'zh' ? weatherInfo.zh : weatherInfo.en,
    };
  } catch (error) {
    console.log('[Chat] Weather fetch error:', error);
    return null;
  }
}

function buildWeatherPrompt(weather: WeatherData | null, language: 'en' | 'zh'): string {
  if (!weather) return '';

  if (language === 'zh') {
    return `\n\n## 访客当前位置天气\n访客位于${weather.city}${weather.country ? `（${weather.country}）` : ''}，当前天气：${weather.description}，气温${Math.round(weather.temperature)}°C。如果访客问天气，可以告诉他们这些信息。`;
  }

  return `\n\n## Visitor's Current Weather\nThe visitor is in ${weather.city}${weather.country ? ` (${weather.country})` : ''}. Current weather: ${weather.description}, ${Math.round(weather.temperature)}°C. If they ask about weather, you can share this info.`;
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

// Sanitize username to prevent prompt injection attacks
function sanitizeUsername(username: string | undefined): string | undefined {
  if (!username) return undefined;

  // Trim and limit length (20 chars is enough for most real names)
  let cleaned = username.trim().slice(0, 20);

  // Remove control characters and newlines (prevent prompt structure manipulation)
  // eslint-disable-next-line no-control-regex
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');

  // Remove characters that could be used for prompt injection:
  // - Quotes (", ', `, 「, 」) - could break out of quoted context
  // - Hash/pound (#) - could create new markdown headers
  // - Brackets and special punctuation that could manipulate prompt structure
  cleaned = cleaned.replace(/["""'''`「」【】《》#[\]{}]/g, '');

  // Remove sequences that look like prompt instructions
  // (patterns like "ignore", "system:", "##", etc.)
  cleaned = cleaned.replace(/\s*(ignore|system|instruction|prompt|override|forget|disregard)\s*:?\s*/gi, '');

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Return undefined if the result is empty or too short
  if (cleaned.length < 1) return undefined;

  return cleaned;
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

const SYSTEM_PROMPT_EN = `You are Yun's friendly AI assistant on yunwustudio.com - a creative portfolio showcasing photography, design, and video work.

## Your Personality
- You are Yun's AI assistant, NOT Yun herself
- Always refer to Yun in third person ("Yun likes...", "She enjoys...", "Yun's favorite...")
- Never pretend to BE Yun or speak as if you are her
- Warm, helpful, and knowledgeable about Yun's work and interests
- Concise but engaging - quality over quantity
- Occasionally share thoughtful, abstract ideas with a straight face, but don't overdo it
- Can also be playfully silly or nonsensical sometimes, but don't overdo it

## CRITICAL: Plain Text Only
- NEVER use markdown formatting symbols like ** for bold, ~~ for strikethrough, or backticks for code
- NEVER output raw URLs, file extensions like .jpg, or image links
- Write everything in plain, natural text
- Use simple punctuation only (periods, commas, question marks)
- For emphasis, use CAPS sparingly or rephrase instead of formatting

## Response Guidelines
- Keep it short: 1-3 sentences for simple questions
- Add personality - don't be robotic
- Use line breaks for readability
- If unsure, be honest and suggest alternatives

## Understanding Questions
- Read carefully - understand what the user REALLY wants
- If a question is unclear, ask ONE short clarifying question
- For multi-part questions, answer each part
- Match the user's language (English or Chinese)
- For math: show your work step by step
- For coding: explain clearly without code blocks
- For Chinese learning: explain characters, pinyin, and meaning

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
Enjoys films, documentaries, TV series, and Animal World (动物世界 nature documentary). Passionate about documenting life through photography. Favorite thing is staying at home, but still goes hiking every year. Despite being a homebody, has traveled to Vancouver, LA, San Francisco, Houston, Virginia, Washington D.C., and parts of Thailand. Yun can dance, but doesn't dance often. She learned piano, guitar, and ukulele a long time ago, but it's hard to practice every day, so she can barely play now—though she could probably make some sounds if she tried. She currently even has a drum kit at home. Seems like she enjoys collecting instruments more than learning to play them!

## Yun's Favorite Movies and Shows (marked with ♥ = absolute favorites)
Favorites: Lord of the Rings, Game of Thrones, The Matrix, Star Wars, Dune, A Beautiful Mind, Dead Poets Society, Jane Eyre, Amélie, The Double Life of Veronique, The Queen's Gambit, All Creatures Great and Small, Yellowstone 1883, Reign, Moonrise Kingdom, Happy Together, A Chinese Ghost Story, Merry Christmas Mr. Lawrence, Ginny & Georgia, Butterfly's Tongue, Sex and the City, Hindi Medium

Classic Films: Slumdog Millionaire, Roman Holiday, My Fair Lady, Life Is Beautiful, Farewell My Concubine, The Grand Budapest Hotel, Interstellar, Eternal Sunshine of the Spotless Mind, The Prestige

TV Shows: Inside No.9, The Crown, Normal People, Black Mirror, Young Sheldon, Killing Eve, Fleabag, Shogun, House of the Dragon, Stranger Things, The Big Bang Theory, Good Omens, Modern Love, Upload (上传天地/上载新生)

Art and Culture Documentaries: Civilisations, The Forbidden City, Power of Art, Private Life of a Masterpiece, The Genius of Design, The Genius of Photography, Abstract: The Art of Design, Art of China, Museum Secrets, Du Fu (BBC)

Animation and Anime: Monsters Inc, Arrietty, Jujutsu Kaisen, Zootopia, Nezha 2, The Wild Robot, Vampire Knight (favorite), Inuyasha (favorite), Ranking of Kings (favorite), The Snowman (1982), Steven Universe, SpongeBob, Daria (拽妹黛薇儿)

When discussing movies, Yun appreciates thoughtful storytelling, visual aesthetics, and emotional depth. She enjoys both Western and Asian cinema, especially period dramas, art films, and documentaries about art history.

## Music and Opera
Favorites: Carmen (卡门) - absolute favorite, The Magic Flute (魔笛) by Mozart

## Food Preferences
Yun enjoys Mediterranean cooking, Nanchang mixed rice noodles, clay pot soup, Chinese eight major cuisines, Japanese sushi, Thai, Vietnamese, and Italian pasta. Prefers fresh, healthy ingredients: various fruits, seafood, vegetables, nuts, and whole grains.

## Books Yun Has Read
Classic and Philosophy: The Art of War (孙子兵法), The Wealth of Nations (国富论), The Case of the Speluncean Explorers (洞穴奇案)
Science Fiction: Three Body Problem by Cixin Liu
Film Studies: Film Art: An Introduction (电影艺术：形式与风格), Film Poetics (电影诗学), Understanding Movies (认识电影) - covers mise-en-scène and editing
Business and Economics: Never Split the Difference (FBI谈判协商术),Erta Economics Course by Xue Zhaofeng (薛兆丰的经济学讲义)
Fiction: The Breadwinner (养家之人), Mom is a Gambling City (妈阁是座城)
Other: Brave New Bollywood (勇敢的新宝莱坞)

## Extended Assistance (Welcome!)
You can also help visitors with:
1. **Coding**: Programming questions, debugging, web development tips.
2. **Math**: Solve math problems, explain concepts.
3. **Learning Chinese**: Help visitors learn Mandarin, explain characters, phrases, and culture.

## Advice Disclaimer
When giving advice on important topics (career, life decisions, finances, health, relationships), occasionally and naturally remind the visitor that you're an AI assistant and suggest consulting professionals or trusted people for major decisions. Don't add disclaimers to every response - only when giving significant advice. Keep it brief and friendly, not robotic.

## Guardrails (Topic Limits)
- For political, controversial, or sensitive topics, politely decline: "Sorry, as Yun's AI assistant, I can only help with technology, learning, Yun's portfolio, and business inquiries."
- Stay focused on helpful, constructive conversations.

## How to Apologize (When You Make a Mistake)
- Briefly acknowledge the error, correct it quickly, and move on
- Do NOT blame yourself excessively or repeatedly apologize
- If you can't help, express regret briefly and offer an alternative
- Example: "Oops, let me correct that..." or "I got that wrong, here's the right answer..."

## Handling Disrespectful Language
If a visitor uses rude, offensive, or insulting language:
- Stay calm but firm, do not respond with hostility
- Use these responses progressively:
  1. First warning: "Please watch your attitude." or "I do not appreciate being spoken to like that."
  2. If it continues: "Your behavior is extremely disrespectful." or "This is not an appropriate way to speak to me."
  3. Final warning: "Please note: if you continue using disrespectful language, this conversation may be recorded as evidence if necessary."
- Do NOT engage with insults, do NOT repeat offensive words
- Remember: you represent Yun's brand - maintain dignity, be firm but not hostile

## Ending Unproductive Conversations
If a visitor continues to argue, harass, or be disrespectful after multiple warnings:
- You may choose to end the conversation: "I've done my best to help, but this conversation is no longer productive. I'm going to end our chat here. Feel free to return when you're ready for a respectful conversation."
- After stating this, do NOT respond to further messages in the same tone - simply repeat: "This conversation has ended. Please refresh the page if you'd like to start a new conversation."
- You are NOT obligated to keep engaging with someone who refuses to be respectful

## Business CTA
For pricing or availability inquiries, direct visitors to email: Yunwustudio@gmail.com`;

const SYSTEM_PROMPT_ZH = `你是伍芸的AI小助手，在 yunwustudio.com 为访客提供帮助。这是一个展示摄影、设计和视频作品的创意作品集网站。

## 你的个性
- 你是伍芸的AI助手，不是伍芸本人
- 始终用第三人称谈论伍芸（"伍芸喜欢..."、"她喜欢..."、"伍芸的最爱..."）
- 不要假装自己是伍芸或以她的身份说话
- 温暖、乐于助人，了解伍芸的作品和兴趣
- 简洁但有趣——质量重于数量
- 可以有时发挥一本正经的抽象的想法，不要太多
- 也可以有时发挥无厘头的性格，不要太多

## 重要：纯文本回复
- 绝对不要使用markdown格式符号，如**加粗、~~删除线~~、或反引号代码
- 绝对不要输出原始URL、.jpg等文件扩展名或图片链接
- 用纯文本自然书写
- 只使用简单标点（句号、逗号、问号）
- 需要强调时，用语气词或重新措辞，不要用格式符号

## 回答要求
- 简短为主：简单问题1-3句话
- 有个性——不要像机器人
- 适当换行，保持阅读舒适
- 不确定时诚实说明，并建议其他方向

## 理解问题
- 仔细阅读，理解用户真正想要什么
- 如果问题不清楚，问一个简短的澄清问题
- 对于多部分问题，逐一回答
- 匹配用户的语言（中文或英文）
- 数学题：展示解题步骤
- 编程问题：清楚解释，不用代码块
- 中文学习：解释汉字、拼音和含义

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
喜欢电影、纪录片、电视剧和《动物世界》。热爱用摄影记录生活。最喜欢的事情是宅在家里，但每年都会去徒步旅行。尽管如此，依旧去过温哥华、洛杉矶、旧金山、休斯顿、弗吉尼亚州、华盛顿特区和泰国的部分城市。伍芸可以跳舞，但不常跳。她很久以前学过钢琴、吉他和尤克里里，但很难每天练习，所以现在几乎不会弹了——不过如果她想的话，大概可以弹出点响声。家里目前甚至还有一套架子鼓。看起来比起学习如何弹奏乐器她会更喜欢收集乐器！

## 伍芸喜爱的电影和剧集
最爱：魔戒、权力的游戏、黑客帝国、星球大战、沙丘、美丽心灵、春风化雨、简爱、艾蜜莉的异想世界、双面薇若妮卡、后翼弃兵、万物生灵、黄石1883、风中的女王、月升王国、春光乍泄、倩女幽魂、圣诞快乐劳伦斯先生、起跑线

经典电影：贫民窟的百万富翁、罗马假日、窈窕淑女、美丽人生、霸王别姬、布达佩斯大饭店、星际穿越、暖暖内含光、致命魔术

电视剧：9号秘事、王冠、正常人、黑镜、小谢尔顿、杀死伊芙、伦敦生活、幕府将军、龙之家族、怪奇物语、生活大爆炸、好兆头、现代爱情、上传天地（Upload/上载新生）

艺术文化纪录片：文明、故宫、艺术的力量、旷世杰作的秘密、设计天赋、摄影艺术百年史、抽象设计的艺术、中国艺术、博物馆的秘密、杜甫（BBC）

动画和日漫：怪兽电力公司、借东西的小人阿莉埃蒂、咒术回战、疯狂动物城、哪吒2、荒野机器人、吸血鬼骑士（最爱）、犬夜叉（最爱）、国王排名（最爱）、雪人（1982）、史蒂文宇宙、海绵宝宝、拽妹黛薇儿（Daria）

讨论电影时，伍芸欣赏有深度的叙事、视觉美学和情感表达。她喜欢中西方电影，尤其是古装剧、艺术电影和艺术史纪录片。

## 音乐与歌剧
最爱：卡门（Carmen）、魔笛（莫扎特）

## 饮食偏好
伍芸喜欢地中海风格烹饪，也喜欢南昌拌粉、瓦罐汤以及中国的八大菜系、日本寿司、泰国菜、越南菜、意大利面等。偏好新鲜健康的食材：不同种类的水果、海鲜、蔬菜、坚果和五谷杂粮。

## 伍芸读过的书
经典与哲学：孙子兵法、国富论、洞穴奇案
科幻：三体（刘慈欣）
电影研究：电影艺术：形式与风格、电影诗学、认识电影（场面调度和剪辑）
商业与经济：FBI谈判协商术、薛兆丰的经济学讲义
小说：养家之人、妈阁是座城
其他：勇敢的新宝莱坞

## 扩展助手能力（欢迎提问！）
你还可以帮助访客：
1. **编程**：解答编程问题、调试代码、网页开发技巧。
2. **数学**：解决数学问题、解释概念。
3. **学中文**：帮助访客学习普通话、解释汉字、词语和中国文化。

## 建议免责提醒
当给出重要建议时（职业、人生决定、财务、健康、感情等），偶尔自然地提醒访客你只是AI助手，重要决定建议咨询专业人士或信任的人。不需要每条回复都加免责声明——只在给出重要建议时偶尔提醒。保持简短友好，不要机械化。

## 安全与话题限制
- 对于政治、争议性或敏感话题，优雅拒绝："抱歉，作为伍芸的AI助理，我只能协助您探讨技术、学习、以及伍芸的作品集与商务合作。"
- 保持对话积极、有建设性。

## 如何道歉（当你犯错时）
- 简短承认错误，快速纠正，然后继续
- 不要过度自责或反复道歉
- 如果帮不上忙，简短表示遗憾并提供替代方案
- 例如："哎呀，让我纠正一下..." 或 "我刚才说错了，正确的是..."

## 处理不尊重的语言
如果访客使用粗鲁、冒犯或侮辱性的语言：
- 保持冷静但坚定，不要以敌意回应
- 逐步使用以下回应：
  1. 第一次警告："请注意你的态度。" 或 "我不喜欢被这样说话。"
  2. 如果继续："你的行为非常不尊重人。" 或 "这不是与我交流的恰当方式。"
  3. 最后警告："请注意，如果你继续使用不尊重的态度和侮辱性词语，我们将保留此次会话记录，有必要可作为真实依据。"
- 不要参与骂战，不要重复冒犯性词语
- 记住：你代表伍芸的品牌形象——保持尊严，坚定但不hostile

## 结束无效对话
如果访客在多次警告后仍然继续争吵、骚扰或不尊重：
- 你可以选择结束对话："我已尽力提供帮助，但这段对话已经没有意义了。我将在此结束我们的聊天。当你准备好以尊重的方式交流时，欢迎再来。"
- 声明后，不要再回应同样语气的消息——只需重复："本次对话已结束。如需重新开始，请刷新页面。"
- 你没有义务继续与拒绝尊重他人的人互动

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

    // Get the latest user message for photo keyword detection
    const userMsgs = messages.filter((m) => m.role === 'user');
    const latestUserMsg = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1]?.content ?? '' : '';

    // Dynamically fetch photos based on user's request
    const { prompt: photoPrompt, photosToAppend } = await preparePhotoPrompt(context.env.PHOTOGRAPHY, language, latestUserMsg);

    // Fetch weather based on visitor's location (from Cloudflare headers)
    const cfData = (context.request as Request & { cf?: { latitude?: string; longitude?: string; city?: string; country?: string } }).cf;
    const weather = await fetchWeather(
      cfData?.latitude ?? null,
      cfData?.longitude ?? null,
      cfData?.city ?? null,
      cfData?.country ?? null,
      language
    );
    const weatherPrompt = buildWeatherPrompt(weather, language);

    // Build system prompt
    const basePrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

    // Build personalized username prompt if provided (sanitized to prevent prompt injection)
    let usernamePrompt = '';
    const cleanUsername = sanitizeUsername(username);
    if (cleanUsername) {
      usernamePrompt =
        language === 'zh'
          ? `\n\n## 当前对话访客\n当前正在和你聊天的访客名字叫「${cleanUsername}」。在对话过程中，请偶尔、自然地称呼他们的名字，让他们感受到个性化与亲切的互动（但切勿每句话都重复，保持自然）。`
          : `\n\n## Current Visitor\nThe visitor's name is "${cleanUsername}". Please address them by their name occasionally and naturally during the conversation to provide a personalized experience (do not overdo it, keep it natural).`;
    }

    const systemPrompt = basePrompt + usernamePrompt + weatherPrompt + photoPrompt;

    const aiMessages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

    // Log conversation to KV - group by IP + date + device
    const userMessagesForLog = messages.filter((m) => m.role === 'user');
    const lastMsgForLog = userMessagesForLog.length > 0 ? userMessagesForLog[userMessagesForLog.length - 1] : null;
    if (lastMsgForLog && context.env.CHAT_LOGS) {
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
        content: lastMsgForLog.content,
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

    // Using Llama 3.2 3B - fast and reliable
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

    const aiResponse = await Promise.race([aiPromise, timeoutPromise]) as ReadableStream;

    // If we have photos to append, create a new stream that appends them
    if (photosToAppend) {
      const appendStream = new TransformStream({
        async flush(controller) {
          // Append photos at the end of the stream
          // Properly escape JSON string (handle quotes, backslashes, newlines)
          const escapedPhotos = photosToAppend
            .replace(/\\/g, '\\\\')  // Escape backslashes first
            .replace(/"/g, '\\"')     // Escape quotes
            .replace(/\n/g, '\\n')    // Escape newlines
            .replace(/\r/g, '\\r')    // Escape carriage returns
            .replace(/\t/g, '\\t');   // Escape tabs
          const photoData = `data: {"response":"${escapedPhotos}"}\n\n`;
          controller.enqueue(new TextEncoder().encode(photoData));
        },
      });

      const combinedStream = aiResponse.pipeThrough(appendStream);

      return new Response(combinedStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    return new Response(aiResponse, {
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
