type Props = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-center text-sm text-slate-500">
        {current} of {total}
      </p>
    </div>
  );
}
