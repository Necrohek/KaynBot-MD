import fetch from "node-fetch";

/**
 * Convierte un video de YouTube a MP3 usando proveedores externos.
 * Devuelve: { url } | null
 */

export async function ytmp3(videoUrl) {
  const providers = [
    // Puedes agregar más si quieres
    (url) => `https://api.akuari.my.id/downloader/youtube?link=${url}`,
    (url) => `https://api.cafirexos.com/api/ytdl?url=${url}`,  // Fallback 1
    (url) => `https://widipe.com/download/youtube-mp3?url=${url}` // Fallback 2
  ];

  for (let buildUrl of providers) {
    const apiURL = buildUrl(videoUrl);

    try {
      const res = await fetch(apiURL, { timeout: 15000 }).catch(() => null);
      if (!res || !res.ok) continue;

      const json = await res.json();

      // Manejar diferentes estructuras de APIs
      const mp3 =
        json?.mp3 ||
        json?.result?.url ||
        json?.data?.url ||
        json?.download_url ||
        null;

      if (!mp3) continue;

      return { url: mp3 };
      
    } catch (err) {
      console.log("Proveedor falló:", apiURL);
    }
  }

  console.error("❌ Todos los proveedores MP3 fallaron.");
  return null;
}
