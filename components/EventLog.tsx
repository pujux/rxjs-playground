import { TimelineEvent } from "@/lib/types";

interface EventLogProps {
  events: TimelineEvent[];
}

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Event Log</h3>
      <ul className="space-y-1 overflow-auto flex-grow min-h-0">
        {events.map((event, index) => (
          <li
            key={index}
            className="flex items-start gap-3 px-3 py-2 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-grow">
                  <span className="text-xs font-mono text-slate-400 block">{event.timestamp}ms</span>
                </div>
                {event.series && <span className="text-xs font-semibold px-2 py-0.5 rounded text-slate-300 bg-slate-800 block">{event.series}</span>}
              </div>
              <div className="text-xs text-white font-mono break-all">
                {typeof event.value === "object" ? JSON.stringify(event.value, null, 2) : String(event.value)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
