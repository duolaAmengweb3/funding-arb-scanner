/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Static export — produces `out/` directory of pure HTML/CSS/JS
  // that can be deployed to any static host (Cloudflare Pages, S3, GitHub Pages).
  // Vercel will still serve it fine too.
  output: "export",
  images: { unoptimized: true },
};
