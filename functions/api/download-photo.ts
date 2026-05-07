// Cloudflare Pages Function: GET /api/download-photo
// Proxy for downloading photos with proper CORS headers

interface Env {
  PHOTOGRAPHY: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');
  const filename = url.searchParams.get('filename') || 'photo.jpg';

  if (!key) {
    return new Response(JSON.stringify({ error: 'Key parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch the object from R2
    const object = await context.env.PHOTOGRAPHY.get(key);

    if (!object) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the content type from the object or default to image/jpeg
    const contentType = object.httpMetadata?.contentType || 'image/jpeg';

    // Return the file with download headers
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: 'Failed to download photo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
