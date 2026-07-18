const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google sign-in.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.body.appendChild(script);
  });

export const initializeGoogle = async (callback) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Google client ID is missing.");
  }

  const google = await loadGoogleScript();

  google.accounts.id.initialize({
    client_id: clientId,
    callback,
  });
};

export const promptGoogleSignIn = () =>
  new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error("Google sign-in is not ready yet."));
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      resolve(notification);
    });
  });
