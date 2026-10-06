/* Home hero: the photograph is in CSS. If a video exists at assets/media/hero.mp4 it fades in
   over it; without the file nothing changes (one quiet check, no repeated requests). */
export default async function home() {
  const video = document.querySelector(".dh-video");
  if (!video) return;
  const src = video.dataset.src;
  try {
    const head = await fetch(src, { method: "HEAD", cache: "no-store" });
    if (!head.ok || !/video/.test(head.headers.get("content-type") || "")) throw new Error("no video");
  } catch { video.remove(); return; }
  video.src = src;
  video.addEventListener("canplay", () => { video.classList.add("is-on"); video.play().catch(() => {}); }, { once: true });
  video.addEventListener("error", () => video.remove(), { once: true });
  video.load();
}
