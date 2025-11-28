import { Observer } from "rxjs";

export function createRxObserver(postMessage: typeof window.postMessage) {
  return (series?: string): Observer<any> => {
    const observerId = Math.random().toString(36).substring(2, 15);
    const startTime = Date.now();

    postMessage({ type: "register", observerId });

    return {
      next: (value: any) => {
        let timestamp = Date.now() - startTime;
        postMessage({ type: "value", observerId, timestamp, series, value });
      },
      error: (value: any) => {
        postMessage({ type: "error", observerId, message: value });
      },
      complete: () => {
        postMessage({ type: "completed", observerId });
      },
    };
  };
}
