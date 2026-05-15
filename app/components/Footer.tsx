const REPO_URL = "https://github.com/kcaylor/cihs";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950 print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:px-6">
        <span>View the source on</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View this project's source on GitHub"
          className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <GitHubOctocat className="h-4 w-4 transition-transform group-hover:rotate-[-8deg]" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
}

function GitHubOctocat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}
