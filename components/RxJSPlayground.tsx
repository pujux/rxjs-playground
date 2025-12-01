"use client";

import { useEffect, useState } from "react";
import TimelineChart from "./TimelineChart";
import { Button } from "@/components/ui/button";
import { Ban, Play, Trash2 } from "lucide-react";
import * as rxjs from "rxjs";
import { RxJSEditor } from "./RxJSEditor";
import { TimelineEvent } from "@/lib/types";
import { EventLog } from "./EventLog";

const defaultCode = `// Pass \`rxObserver()\` to the subscribe method 
// of your Observable to visualize values on the timeline

const { interval, map, take } = rxjs;

const observable$ = interval(200).pipe(
  map(n => n * 2),
  take(10)
);

observable$.subscribe(rxObserver("my-observable"));`;

export default function RxJSPlayground() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [code, setCode] = useState(defaultCode);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearTimeline = () => {
    worker?.terminate();
    setWorker(null);
    setEvents([]);
    setError(null);
    setIsRunning(false);
  };

  const executeCode = () => {
    clearTimeline();
    setIsRunning(true);
    const observers = new Set<string>();

    const w = new Worker(new URL("../lib/rx-worker.ts", import.meta.url));
    setWorker(w);

    w.postMessage({ code, timeout: 30000 });

    w.onmessage = ({ data: msg }: MessageEvent) => {
      switch (msg.type) {
        case "register":
          observers.add(msg.observerId);
          break;
        case "value":
          setEvents((prev) => [
            ...prev,
            {
              timestamp: msg.timestamp,
              observerId: msg.observerId,
              series: msg.series,
              value: msg.value,
            },
          ]);
          break;
        case "completed":
          setEvents((prev) => [
            ...prev,
            {
              timestamp: msg.timestamp,
              observerId: msg.observerId,
              series: msg.series,
              value: "✓",
            },
          ]);
          observers.delete(msg.observerId);
          if (observers.size === 0) {
            w.terminate();
            setWorker(null);
            setIsRunning(false);
          }
          break;
        case "error":
          setError(msg.message);
          w.terminate();
          setWorker(null);
          setIsRunning(false);
          break;
        case "terminated":
          setWorker(null);
          setIsRunning(false);
          break;
      }
    };
  };

  useEffect(() => {
    //@ts-expect-error
    window.rxjs = rxjs;
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">RxJS</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">RxJS Playground</h1>
            <p className="text-sm text-slate-400">Interactive Observable Visualizer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={executeCode}
            disabled={isRunning}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>

          <Button
            onClick={() => {
              worker?.terminate();
              setWorker(null);
              setIsRunning(false);
            }}
            disabled={!isRunning}
            variant="destructive"
          >
            <Ban className="w-4 h-4 mr-2" />
            Stop
          </Button>

          <Button onClick={clearTimeline} variant="secondary">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-slate-800 flex flex-col">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Code Editor</h2>
          </div>
          <RxJSEditor code={code} setCode={setCode} />
        </div>

        <div className="w-1/2 flex flex-col bg-slate-900">
          <div className="px-4 py-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Visualization</h2>
          </div>

          <div className="grid grid-rows-2 p-6 flex-grow min-h-0 gap-6">
            {error ? (
              <div className="bg-red-950 border border-red-800 rounded-lg p-4 row-span-2 h-min">
                <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                <pre className="text-red-300 text-sm whitespace-pre-wrap">{error}</pre>
              </div>
            ) : events.length > 0 ? (
              <>
                <TimelineChart events={events} />
                <EventLog events={events} />
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 row-span-2">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Run your code to see the timeline</p>
                  <p className="text-sm mt-2">
                    Use &nbsp;<code>log(value)</code>&nbsp; to visualize observable emissions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
