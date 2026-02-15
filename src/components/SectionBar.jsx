export default function SectionBar({ variant = 'primary', icon, children }) {
  const cls = `section-bar section-bar-${variant}`;
  return (
    <div className={cls}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
