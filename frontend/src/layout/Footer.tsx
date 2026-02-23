const Footer = () => {
  return (
    <footer className="border-t border-[#d9e3f3] bg-white/90 px-6 py-4 text-[#6f7f9e] backdrop-blur-xl">
      <div className="flex flex-col items-center justify-between gap-2 text-sm md:flex-row">
        <p>© {new Date().getFullYear()} Medico. All rights reserved.</p>

        <div className="flex gap-5">
          <span className="cursor-pointer transition hover:text-[#2f55d4]">Privacy</span>
          <span className="cursor-pointer transition hover:text-[#2f55d4]">Terms</span>
          <span className="cursor-pointer transition hover:text-[#2f55d4]">Support</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
