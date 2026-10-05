import "./index.css";

import { useMeetingState } from "./hooks/useMeetingState";

export function App() {
  const { state, connected } = useMeetingState();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meeting Assistant</h1>

            <p className="mt-1 text-sm text-zinc-400">Local PC session</p>
          </div>

          <div
            className={[
              "flex items-center gap-2 rounded-full",
              "px-3 py-1.5 text-sm",
              connected
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400",
            ].join(" ")}
          >
            <span
              className={[
                "h-2 w-2 rounded-full",
                connected ? "bg-emerald-400" : "bg-red-400",
              ].join(" ")}
            />

            {connected ? "Connected" : "Disconnected"}
          </div>
        </header>

        <div className="mt-6 space-y-4">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Status</p>

            <p className="mt-2 text-xl font-semibold capitalize">
              {state.status}
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">Transcript</p>

            <div className="mt-3 min-h-32 whitespace-pre-wrap leading-relaxed">
              {state.transcript || (
                <span className="text-zinc-600">Waiting for transcript...</span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-500">AI Answer</p>

            <div className="mt-3 min-h-32 whitespace-pre-wrap text-lg leading-relaxed">
              {state.currentAnswer || (
                <span className="text-zinc-600">Waiting for answer...</span>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
