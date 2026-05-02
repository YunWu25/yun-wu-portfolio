// Middleware for admin API routes - validates Cloudflare Access JWT
import cloudflareAccessPlugin from '@cloudflare/pages-plugin-cloudflare-access';

// Protects routes under /api/admin/* by validatating the Cloudflare Access JWT
export const onRequest = cloudflareAccessPlugin({
  domain: 'https://yunwustudio.cloudflareaccess.com',
  // AUD (Application Audience Tag) from Cloudflare Access Application settings
  aud: '95543225a8fad52b71cc595e45ca45005938c7a8ee298419eb57594711690a34',
});
