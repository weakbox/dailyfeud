export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between border-b-2 border-black bg-white px-4 py-2 text-black dark:bg-zinc-700 dark:text-white">
      <span className="w-1/3 text-left text-gray-500 font-bold text-sm">WEAKBOX.COM</span>
      <span className="w-1/3 text-center font-black">DAILYFEUD</span>
      <i className="fa-solid fa-circle-info w-1/3 text-right"></i>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="sticky top-full mt-8 flex items-center justify-center border-t-2 border-black bg-white px-4 py-2 text-xs text-black dark:bg-zinc-700 dark:text-white">
      <p className="text-zinc-500">
        I'm looking for a job! Want to reach out?{" "}
        <a
          className="underline"
          href="mailto:connor@weakbox.com"
        >
          connor@weakbox.com
        </a>
        {" "}
        <a
          href="https://www.linkedin.com/in/weakbox/"
          target="_blank"
        >
          <i className="fa-brands fa-linkedin"></i>
        </a>
        {" "}
        <a
          href="https://github.com/weakbox"
          target="_blank"
        >
          <i className="fa-brands fa-github"></i>
        </a>
      </p>
    </footer>
  );
}
