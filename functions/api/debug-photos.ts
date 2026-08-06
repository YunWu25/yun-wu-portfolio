// Debug endpoint to see what photos are loaded from R2
// GET /api/debug-photos
// GET /api/debug-photos?category=dog - filter by category
// GET /api/debug-photos?gallery=true - only show gallery photos (what chat uses)

interface Env {
  PHOTOGRAPHY: R2Bucket;
}

interface PhotoData {
  key: string;
  url: string;
  title: string;
  category: string;
  showInGallery: boolean;
  allMetadata: Record<string, string>;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.PHOTOGRAPHY) {
      return new Response(JSON.stringify({ error: 'R2 bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse query params
    const url = new URL(context.request.url);
    const filterCategory = url.searchParams.get('category');
    const galleryOnly = url.searchParams.get('gallery') === 'true';

    const listed = await context.env.PHOTOGRAPHY.list({
      prefix: 'public/images/',
      include: ['customMetadata'],
    } as R2ListOptions & { include: string[] });

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

    let photos: PhotoData[] = listed.objects
      .filter((obj) => {
        if (obj.size === 0 || obj.key.endsWith('/')) return false;
        const key = obj.key.toLowerCase();
        return imageExtensions.some((ext) => key.endsWith(ext));
      })
      .map((obj) => {
        const meta = obj.customMetadata ?? {};
        const filename = obj.key.split('/').pop() ?? 'Photo';

        return {
          key: obj.key,
          url: `https://media.yunwustudio.com/${obj.key}`,
          title: meta.title || filename,
          category: meta.category || 'other',
          showInGallery: meta.showInGallery !== 'false',
          allMetadata: meta,
        };
      });

    // Apply filters
    if (galleryOnly) {
      photos = photos.filter(p => p.showInGallery);
    }
    if (filterCategory) {
      photos = photos.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
    }

    // Group by category
    const byCategory: Record<string, PhotoData[]> = {};
    for (const photo of photos) {
      if (!byCategory[photo.category]) {
        byCategory[photo.category] = [];
      }
      byCategory[photo.category]!.push(photo);
    }

    // Category counts summary
    const categoryCounts: Record<string, number> = {};
    for (const [cat, catPhotos] of Object.entries(byCategory)) {
      categoryCounts[cat] = catPhotos.length;
    }

    return new Response(
      JSON.stringify({
        note: 'This shows what the chat API sees. Use ?gallery=true to see only gallery photos, ?category=dog to filter by category.',
        filters: { category: filterCategory, galleryOnly },
        totalPhotos: photos.length,
        categoryCounts,
        categories: Object.keys(byCategory).sort(),
        byCategory,
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
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
