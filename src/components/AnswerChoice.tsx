type State = "idle" | "correct" | "wrong";

type Props = {
  label: string;
  state: State;
  disabled: boolean;
  onClick: () => void;
};

const styles: Record<State, string> = {
  idle: "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50",
  correct: "bg-emerald-100 border-emerald-500 text-emerald-800 animate-pop-in",
  wrong: "bg-rose-100 border-rose-500 text-rose-800 animate-shake",
};

export function AnswerChoice({ label, state, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full select-none rounded-2xl border-2 px-5 py-4 text-lg font-semibold capitalize shadow-sm transition disabled:cursor-default ${styles[state]}`}
    >
      {label}
    </button>
  );
}
