// Cloudflare Pages Function: GET /api/selling-photos
// Lists photos available for purchase from OnlyClient/Selling/

interface Env {
  PHOTOGRAPHY: R2Bucket;
}

interface SellingPhoto {
  key: string;
  url: string;
  filename: string;
  size: number;
  price?: number;
}

interface SellingPhotosResponse {
  photos: SellingPhoto[];
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const prefix = 'OnlyClient/Selling/';

  try {
    const listed = await context.env.PHOTOGRAPHY.list({
      prefix: prefix,
      include: ['customMetadata', 'httpMetadata'],
    } as R2ListOptions & { include: string[] });

    // Filter out directory entries and non-image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.bmp'];
    const imageObjects = listed.objects.filter((obj) => {
      const key = obj.key.toLowerCase();
      if (key.endsWith('/')) return false;
      return imageExtensions.some((ext) => key.endsWith(ext));
    });

    const photos: SellingPhoto[] = imageObjects.map((obj) => {
      const filename = obj.key.split('/').pop() || obj.key;
      const customMeta = obj.customMetadata || {};

      return {
        key: obj.key,
        url: `https://media.yunwustudio.com/${obj.key}`,
        filename: filename,
        size: obj.size,
        price: customMeta.price ? parseFloat(customMeta.price) : undefined,
      };
    });

    // Sort by filename
    photos.sort((a, b) => a.filename.localeCompare(b.filename));

    const response: SellingPhotosResponse = {
      photos,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching selling photos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch photos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
