export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 px-6 py-14 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
