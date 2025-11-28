import * as rxjs from "rxjs";
import { createRxObserver } from "./rx-observer";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

self.onmessage = (e) => {
  const { code, timeout } = e.data;

  try {
    const run = new Function("rxObserver", "rxjs", code);
    run(createRxObserver(self.postMessage), rxjs);
  } catch (error: any) {
    self.postMessage({ type: "error", message: error.message });
    return;
  }

  timeoutId = setTimeout(() => {
    self.postMessage({ type: "terminated" });
    self.close();
  }, timeout);
};

self.onclose = () => {
  self.postMessage({ type: "terminated" });
};
