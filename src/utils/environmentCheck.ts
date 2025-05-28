export function checkEnvironment() {
  const checks = {
    webAssembly: typeof WebAssembly !== "undefined",
    audioContext:
      typeof AudioContext !== "undefined" ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (window as any).webkitAudioContext !== "undefined",
    worker: typeof Worker !== "undefined",
    opfs: "storage" in navigator && "getDirectory" in navigator.storage,
    sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
  };

  console.log("Environment compatibility checks:", checks);

  return checks;
}

export function getRequiredHeaders() {
  return {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
  };
}
