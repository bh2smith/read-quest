import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

// Keeps a render crash from showing a blank white screen.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error("[ReadQuest] render error", error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
        <div className="text-6xl">🙈</div>
        <h1 className="text-2xl font-extrabold text-slate-800">Oops, something broke</h1>
        <p className="max-w-sm text-slate-500">
          Your progress is saved. Try reloading to keep playing.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-indigo-700"
        >
          Reload
        </button>
      </div>
    );
  }
}
