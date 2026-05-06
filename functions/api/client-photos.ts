// Cloudflare Pages Function: GET /api/client-photos
// Lists photos from R2 bucket for authenticated clients
// Access code = folder name within OnlyClient/

interface Env {
  PHOTOGRAPHY: R2Bucket;
}

interface ClientPhoto {
  key: string;
  url: string;
  filename: string;
  size: number;
}

interface ClientPhotosResponse {
  photos: ClientPhoto[];
  folderName: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const accessCode = url.searchParams.get('code');

  // Validate access code
  if (!accessCode || accessCode.trim() === '') {
    return new Response(JSON.stringify({ error: 'Access code required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cleanCode = accessCode.trim();
  const prefix = `OnlyClient/${cleanCode}/`;

  try {
    // List objects in the client's folder
    const listed = await context.env.PHOTOGRAPHY.list({
      prefix: prefix,
      include: ['customMetadata', 'httpMetadata'],
    } as R2ListOptions & { include: string[] });

    // If no objects found, the access code is invalid
    if (listed.objects.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid access code' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Filter out directory entries and non-image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.bmp'];
    const imageObjects = listed.objects.filter((obj) => {
      const key = obj.key.toLowerCase();
      if (key.endsWith('/')) return false;
      return imageExtensions.some((ext) => key.endsWith(ext));
    });

    // If no images found (only directories), return invalid code
    if (imageObjects.length === 0) {
      return new Response(JSON.stringify({ error: 'No photos found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const photos: ClientPhoto[] = imageObjects.map((obj) => {
      const filename = obj.key.split('/').pop() || obj.key;

      return {
        key: obj.key,
        url: `https://media.yunwustudio.com/${obj.key}`,
        filename: filename,
        size: obj.size,
      };
    });

    // Sort by filename
    photos.sort((a, b) => a.filename.localeCompare(b.filename));

    const response: ClientPhotosResponse = {
      photos,
      folderName: cleanCode,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        // No caching for client photos - they may be updated
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching client photos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch photos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
