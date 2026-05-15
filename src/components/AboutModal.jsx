import { useEffect } from 'react'

const YOUTUBE_URL = 'https://www.youtube.com/@ImpulseTech'
const INSTAGRAM_URL = 'https://www.instagram.com/impulsetechy/'
const GITHUB_URL = 'https://github.com/ImpulseTechy/'
const LINKEDIN_URL = 'https://www.linkedin.com/in/yogesh-bawane/'

function AboutModal({ onClose }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-cyan-500 via-cyan-600 to-indigo-600 px-6 py-8 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            x
          </button>
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
            IT
          </div>
          <h2 className="mt-3 text-2xl font-bold">ImpulseTech</h2>
          <p className="text-sm text-cyan-100">
            Maker · Electronics · Embedded systems
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            SerialDash is built by ImpulseTech — a channel making electronics
            and Arduino projects accessible to students and hobbyists. If this
            tool helped you, the best way to say thanks is to subscribe and
            follow along.
          </p>

          <div className="space-y-2">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white transition hover:bg-rose-700"
            >
              <YouTubeIcon />
              <div className="flex-1 text-left">
                <div className="text-sm font-bold">Subscribe on YouTube</div>
                <div className="text-xs text-rose-100">@ImpulseTech</div>
              </div>
              <span className="text-lg">→</span>
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600 px-4 py-3 font-semibold text-white transition hover:opacity-90"
            >
              <InstagramIcon />
              <div className="flex-1 text-left">
                <div className="text-sm font-bold">Follow on Instagram</div>
                <div className="text-xs text-white/90">@impulsetechy</div>
              </div>
              <span className="text-lg">→</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <GithubIcon />
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold">GitHub</div>
                  <div className="text-[11px] text-slate-300">@ImpulseTechy</div>
                </div>
              </a>

              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#0a66c2] px-3 py-3 font-semibold text-white transition hover:bg-[#08529c]"
              >
                <LinkedInIcon />
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold">LinkedIn</div>
                  <div className="text-[11px] text-white/80">Yogesh Bawane</div>
                </div>
              </a>
            </div>
          </div>

          <p className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Built with React + Web Serial. Open source, free to use.
          </p>
        </div>
      </div>
    </div>
  )
}

function YouTubeIcon() {
  return (
    <svg
      className="size-7 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      className="size-7 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.5C20.2 21.4 23.5 17 23.5 12 23.5 5.7 18.3.5 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5V9h3v10Zm-1.5-11.4a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM19 19h-3v-5.2c0-1.3-.5-2.1-1.6-2.1-.9 0-1.4.6-1.6 1.2 0 .2-.1.5-.1.8V19h-3V9h3v1.3a3 3 0 0 1 2.7-1.5c2 0 3.5 1.3 3.5 4.1V19Z" />
    </svg>
  )
}

export default AboutModal
