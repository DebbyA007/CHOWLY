// How the receipt picture gets saved, decided by asking the browser rather than by
// guessing from the user agent.
//
// The regression this exists to prevent: on Android the share path was taken and the
// picture did not end up saved, where a plain download would have worked. A browser can
// expose navigator.share and still refuse to carry a file, so the presence of share is
// not the question. The question is whether this exact file can be shared, and only
// navigator.canShare({ files }) answers it.
//
// The label and the outcome are the same on every platform: the button says save, and a
// picture is saved. Only the route differs.
export type SaveRoute = "share" | "download";

type ShareCapableNavigator = {
  share?: (data: { files?: File[] }) => Promise<void>;
  canShare?: (data: { files?: File[] }) => boolean;
};

export function chooseSaveRoute(nav: ShareCapableNavigator | undefined, file: File | null): SaveRoute {
  if (!nav || !file) return "download";
  if (typeof nav.share !== "function") return "download";
  // No canShare means no way to ask whether the file is acceptable, and a share that
  // cannot carry the picture is worse than a download that can.
  if (typeof nav.canShare !== "function") return "download";
  try {
    return nav.canShare({ files: [file] }) ? "share" : "download";
  } catch {
    return "download";
  }
}

// Dismissing the share sheet is a choice, not a failure, and nothing is shown for it.
// Every other rejection means the share never carried the picture, so the download runs.
export function isDismissal(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === "AbortError";
}
