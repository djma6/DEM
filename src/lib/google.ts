// Google Identity Services + Google Drive (appDataFolder) helper
// Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set.

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/drive.appdata",
].join(" ");

const BACKUP_FILENAME = "igig-backup.json";
const GIS_SRC = "https://accounts.google.com/gsi/client";

export interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

export function isGoogleConfigured(): boolean {
  return GOOGLE_CLIENT_ID.length > 0;
}

let gisLoading: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as unknown as { google?: { accounts?: unknown } };
  if (w.google?.accounts) return Promise.resolve();
  if (gisLoading) return gisLoading;

  gisLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(s);
  });

  return gisLoading;
}

/** Opens Google consent popup and resolves with an OAuth access token. */
export function requestAccessToken(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    if (!isGoogleConfigured()) {
      reject(new Error("NOT_CONFIGURED"));
      return;
    }
    try {
      await loadGoogleScript();
    } catch (e) {
      reject(e);
      return;
    }

    const g = (window as unknown as {
      google?: {
        accounts: {
          oauth2: {
            initTokenClient: (cfg: Record<string, unknown>) => { requestAccessToken: () => void };
          };
        };
      };
    }).google;

    if (!g?.accounts?.oauth2) {
      reject(new Error("GIS_UNAVAILABLE"));
      return;
    }

    const client = g.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      prompt: "",
      callback: (resp: { access_token?: string; error?: string }) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error || "NO_TOKEN"));
          return;
        }
        resolve(resp.access_token);
      },
      error_callback: () => reject(new Error("POPUP_CLOSED")),
    });

    client.requestAccessToken();
  });
}

export async function fetchGoogleUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("USERINFO_FAILED");
  return (await res.json()) as GoogleUser;
}

/** Find existing backup file id inside the hidden appDataFolder. */
async function findBackupFileId(accessToken: string): Promise<string | null> {
  const url =
    "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name)&q=" +
    encodeURIComponent(`name='${BACKUP_FILENAME}'`);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const data = (await res.json()) as { files?: { id: string; name: string }[] };
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

/** Upload (create or update) the backup JSON into Drive appDataFolder. */
export async function uploadBackupToDrive(accessToken: string, payload: unknown): Promise<void> {
  const existingId = await findBackupFileId(accessToken);
  const metadata: Record<string, unknown> = { name: BACKUP_FILENAME, mimeType: "application/json" };
  if (!existingId) metadata.parents = ["appDataFolder"];

  const boundary = "-------igig" + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    JSON.stringify(payload) +
    `\r\n--${boundary}--`;

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

  const res = await fetch(url, {
    method: existingId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error("DRIVE_UPLOAD_FAILED");
}

/** Download the backup JSON from Drive appDataFolder. Returns null if none. */
export async function downloadBackupFromDrive(accessToken: string): Promise<unknown | null> {
  const id = await findBackupFileId(accessToken);
  if (!id) return null;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("DRIVE_DOWNLOAD_FAILED");
  return await res.json();
}
