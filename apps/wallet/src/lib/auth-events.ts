// Tiny emitter so API calls can report a 401 without navigating themselves.
// A client component subscribes and performs an SPA redirect to /login.

type Listener = () => void;

const listeners = new Set<Listener>();

export function onUnauthorized(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitUnauthorized(): void {
  for (const listener of listeners) listener();
}
