export default function StarRating({ value, onChange, max = 5, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-medium text-[var(--muted)]">{label}</span>}
      <div className="star-rating flex">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            className={i < value ? 'active' : ''}
            onClick={() => onChange(i + 1)}
            aria-label={`Rate ${i + 1} of ${max}`}
          >
            ☾
          </button>
        ))}
      </div>
    </div>
  );
}
