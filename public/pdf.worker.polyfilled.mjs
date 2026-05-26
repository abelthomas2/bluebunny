// Polyfill wrapper for pdfjs-dist 5.x worker.
// The worker runs in an isolated context — main-thread polyfills don't reach here.
// Apply them first, then dynamically import the real worker (top-level await keeps order).

if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  };
}

if (typeof URL.parse === 'undefined') {
  URL.parse = function (url, base) {
    try { return new URL(url, base); } catch { return null; }
  };
}

await import('./pdf.worker.min.mjs');
