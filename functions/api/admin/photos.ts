// Cloudflare Pages Function: Admin API for photo metadata management
// GET /api/admin/photos - List all photos with metadata
// PUT /api/admin/photos - Update metadata for a specific photo

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
  size: number;
  uploaded: string;
}

interface UpdateRequest {
  key: string;
  title?: string;
  alt?: string;
  artist?: string;
  season?: string;
}

// GET: List all photos with their metadata
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const listed = await context.env.PHOTOGRAPHY.list({ 
      prefix: "public/images/",
      include: ["customMetadata", "httpMetadata"]
    } as R2ListOptions & { include: string[] });

    const photos: PhotoData[] = listed.objects
      // Filter out directory prefixes (they have size 0 and end with /)
      .filter((obj) => obj.size > 0 && !obj.key.endsWith('/'))
      .map((obj) => {
        const filename = obj.key.split("/").pop() || obj.key;
        const customMeta = obj.customMetadata || {};

        return {
          key: obj.key,
          url: `https://media.yunwustudio.com/${obj.key}`,
          title: customMeta.title || "",
          alt: customMeta.alt || filename,
          artist: customMeta.artist || "",
          season: customMeta.season || "",
          size: obj.size,
          uploaded: obj.uploaded.toISOString()
        };
      });

    return new Response(JSON.stringify({ photos }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error("Admin: Error listing photos:", error);
    return new Response(JSON.stringify({ error: "Failed to list photos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// PUT: Update metadata for a specific photo
// R2 doesn't support direct metadata updates, so we copy the object with new metadata
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body: UpdateRequest = await context.request.json();
    
    if (!body.key) {
      return new Response(JSON.stringify({ error: "Missing required field: key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the existing object to preserve its content
    const existingObject = await context.env.PHOTOGRAPHY.get(body.key);
    
    if (!existingObject) {
      return new Response(JSON.stringify({ error: "Photo not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Merge existing metadata with updates
    const existingMeta = existingObject.customMetadata || {};
    const newMetadata: Record<string, string> = {
      ...existingMeta,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.alt !== undefined && { alt: body.alt }),
      ...(body.artist !== undefined && { artist: body.artist }),
      ...(body.season !== undefined && { season: body.season })
    };

    // Copy the object back to itself with updated metadata
    // This is the R2 way to update metadata without re-uploading content
    await context.env.PHOTOGRAPHY.put(body.key, existingObject.body, {
      httpMetadata: existingObject.httpMetadata,
      customMetadata: newMetadata
    });

    return new Response(JSON.stringify({ 
      success: true, 
      key: body.key,
      metadata: newMetadata
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Admin: Error updating photo metadata:", error);
    return new Response(JSON.stringify({ error: "Failed to update metadata" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
