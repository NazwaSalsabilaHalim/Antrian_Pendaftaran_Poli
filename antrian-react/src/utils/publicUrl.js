// Alamat file di folder public/ yang mengikuti base path Vite
// (mis. /antrian_react/), supaya tidak 404 saat aplikasi tidak di akar situs.
export const publicUrl = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`
