// Debug endpoint to see what photos are loaded from R2
// GET /api/debug-photos

interface Env {
  PHOTOGRAPHY: R2Bucket;
}

interface PhotoData {
  url: string;
  title: string;
  category: string;
  showInGallery: boolean;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.PHOTOGRAPHY) {
      return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const listed = await context.env.PHOTOGRAPHY.list({
      prefix: 'public/images/',
      include: ['customMetadata'],
    } as R2ListOptions & { include: string[] });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

    const photos: PhotoData[] = listed.objects
      .filter((obj) => {
        if (obj.size === 0 || obj.key.endsWith('/')) return false;
        const key = obj.key.toLowerCase();
        return imageExtensions.some((ext) => key.endsWith(ext));
      })
      .map((obj) => {
        const meta = obj.customMetadata ?? {};
        const filename = obj.key.split('/').pop() ?? 'Photo';

        return {
          url: `https://media.yunwustudio.com/${obj.key}`,
          title: meta.title || filename,
          category: meta.category || 'other',
          showInGallery: meta.showInGallery !== 'false',
        };
      });

    // Group by category
    const byCategory: Record<string, PhotoData[]> = {};
    for (const photo of photos) {
      if (!byCategory[photo.category]) {
        byCategory[photo.category] = [];
      }
      byCategory[photo.category]!.push(photo);
    }

    return new Response(
      JSON.stringify({
        totalPhotos: photos.length,
        categories: Object.keys(byCategory),
        byCategory,
      }, null, 2),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Debug photos error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch photos', details: String(error) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
