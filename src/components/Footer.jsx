import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="py-4 px-4 text-center mt-8 mb-20">
      <img src={logo} alt="GuidedBarakah" className="w-8 h-8 mx-auto mb-3 object-contain" />
      <div className="text-[0.65rem] text-[var(--muted)] tracking-widest uppercase font-medium">
        &copy; {new Date().getFullYear()} GuidedBarakah &nbsp;|&nbsp; The Ramadan Reset Planner
      </div>
    </footer>
  );
}
