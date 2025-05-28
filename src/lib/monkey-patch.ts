/* eslint-disable @typescript-eslint/no-explicit-any */

export const MODEL_SOURCES = {
  DEFAULT: "https://huggingface.co/diffusionstudio/piper-voices/resolve/main",
  RHASSPY: "https://huggingface.co/rhasspy/piper-voices/resolve/main",
} as const;

const originalFunctions: {
  fetch?: typeof fetch;
} = {};

const originalOPFSFunctions: {
  getDirectory?: any;
} = {};

export function patchGlobalFetch() {
  if (originalFunctions.fetch || !window) return;

  originalFunctions.fetch = window.fetch.bind(window);

  window.fetch = function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    let url = "";

    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input instanceof Request) {
      url = input.url;
    }

    if (url.startsWith(MODEL_SOURCES.DEFAULT)) {
      const patchedUrl = url.replace(
        MODEL_SOURCES.DEFAULT,
        MODEL_SOURCES.RHASSPY
      );

      console.log(
        `🔄 Fetch intercepted: ${url.split("/").pop()} -> ${patchedUrl
          .split("/")
          .slice(-3)
          .join("/")}`
      );

      if (typeof input === "string") {
        return originalFunctions.fetch!(patchedUrl, init);
      } else if (input instanceof URL) {
        return originalFunctions.fetch!(new URL(patchedUrl), init);
      } else if (input instanceof Request) {
        try {
          const newRequest = new Request(patchedUrl, {
            method: input.method,
            headers: input.headers,
            body: input.body,
            mode: input.mode,
            credentials: input.credentials,
            cache: input.cache,
            redirect: input.redirect,
            referrer: input.referrer,
            referrerPolicy: input.referrerPolicy,
            integrity: input.integrity,
            signal: input.signal,
          });
          return originalFunctions.fetch!(newRequest, init);
        } catch {
          console.warn(
            "⚠️ Failed to create new Request, falling back to URL string"
          );
          return originalFunctions.fetch!(patchedUrl, init);
        }
      }
    }

    return originalFunctions.fetch!(input, init);
  };
}

export function patchOPFS() {
  if (!navigator.storage?.getDirectory) {
    console.warn("OPFS not supported");
    return;
  }

  originalOPFSFunctions.getDirectory = navigator.storage.getDirectory.bind(
    navigator.storage
  );

  navigator.storage.getDirectory = async () => {
    const root = await originalOPFSFunctions.getDirectory!();

    try {
      return await root.getDirectoryHandle("piper-rhasspy", { create: true });
    } catch (error) {
      console.error("Failed to create OPFS directory:", error);
      return root;
    }
  };
}

export async function initializePatches() {
  patchGlobalFetch();
  patchOPFS();
}

export async function restorePatches() {
  if (originalFunctions.fetch) {
    window.fetch = originalFunctions.fetch;
    originalFunctions.fetch = undefined;
  }

  if (originalOPFSFunctions.getDirectory) {
    navigator.storage.getDirectory = originalOPFSFunctions.getDirectory;
    originalOPFSFunctions.getDirectory = undefined;
  }
}
