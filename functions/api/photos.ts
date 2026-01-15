// Cloudflare Pages Function: GET /api/photos
// Lists all photos from R2 bucket directly

interface Env {
  PHOTOGRAPHY: R2Bucket;
}

interface PhotoData {
  key: string;
  url: string;
  title: string;
  alt: string;
  artist: string;
  season: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const listed = await context.env.PHOTOGRAPHY.list({
      prefix: 'public/images/',
      include: ['customMetadata', 'httpMetadata'],
    } as R2ListOptions & { include: string[] });

    // Filter out directory entries and non-image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    const imageObjects = listed.objects.filter((obj) => {
      const key = obj.key.toLowerCase();
      // Exclude directory markers (keys ending with /) and non-image files
      if (key.endsWith('/')) return false;
      return imageExtensions.some((ext) => key.endsWith(ext));
    });

    const photos: PhotoData[] = imageObjects.map((obj) => {
      const filename = obj.key.split('/').pop() || obj.key;

      // R2 custom metadata (will use defaults until metadata is set per-photo)
      const customMeta = obj.customMetadata || {};

      return {
        key: obj.key,
        url: `https://media.yunwustudio.com/${obj.key}`,
        title: customMeta.title || 'Urban Essence',
        alt: customMeta.alt || filename,
        artist: customMeta.artist || 'Yun Wu',
        season: customMeta.season || 'Fall 2024',
      };
    });

    return new Response(JSON.stringify(photos), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120',
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch photos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
