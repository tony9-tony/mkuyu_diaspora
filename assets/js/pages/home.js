/* Home hero: real photographs fade into each other (CSS). If a video is added at
   assets/media/hero.mp4 it plays over them; when the file is missing the video is
   simply removed and the photos carry on. */
export default function home() {
  const video = document.querySelector(".dh-video");
  if (!video) return;
  const drop = () => video.remove();
  video.addEventListener("error", drop, true);
  video.querySelectorAll("source").forEach((s) => s.addEventListener("error", () => { if (![...video.querySelectorAll("source")].some((x) => x !== s)) drop(); }));
  video.addEventListener("canplay", () => { video.classList.add("is-on"); video.play().catch(() => {}); }, { once: true });
  fetch(video.querySelector("source")?.src || "", { method: "HEAD" }).then((r) => { if (!r.ok) drop(); }).catch(drop);
}
