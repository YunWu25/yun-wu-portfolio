// Cloudflare Pages Function: GET /api/photos
// Lists all photos from R2 bucket with KV caching

interface Env {
  PHOTOGRAPHY: R2Bucket;
  PHOTO_CACHE: KVNamespace;
  PHOTO_METADATA: KVNamespace;
}

interface PhotoMetadata {
  title?: string;
  alt?: string;
  artist?: string;
  season?: string;
}

interface PhotoData {
  key: string;
  url: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
}

const CACHE_KEY = "photo-list-v1";
const CACHE_TTL = 300; // 5 minutes in seconds

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // 1. Try cache first
    const cached = await context.env.PHOTO_CACHE.get(CACHE_KEY, "json") as PhotoData[] | null;
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // 2. Cache miss - fetch from R2
    const listed = await context.env.PHOTOGRAPHY.list({ prefix: "public/images/" });

    // 3. Build photo array with metadata from KV
    const photos: PhotoData[] = await Promise.all(
      listed.objects.map(async (obj) => {
        // Get metadata from KV if exists
        const metadata = await context.env.PHOTO_METADATA.get(obj.key, "json") as PhotoMetadata | null;
        
        // Extract filename for default title
        const filename = obj.key.split("/").pop() || obj.key;
        
        return {
          key: obj.key,
          url: `https://media.yunwustudio.com/${obj.key}?auto=format&fit=crop&w=600&h=900&q=80`,
          title: metadata?.title || "Urban Essence",
          alt: metadata?.alt || filename,
          artist: metadata?.artist || "Yun Wu",
          season: metadata?.season || "Fall 2024"
        };
      })
    );

    // 4. Store in cache with TTL
    await context.env.PHOTO_CACHE.put(CACHE_KEY, JSON.stringify(photos), {
      expirationTtl: CACHE_TTL
    });

    return new Response(JSON.stringify(photos), {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch photos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
