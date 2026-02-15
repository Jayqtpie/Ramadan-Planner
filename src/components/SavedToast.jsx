export default function SavedToast({ show }) {
  if (!show) return null;
  return <div className="toast-saved">Saved ✓</div>;
}
