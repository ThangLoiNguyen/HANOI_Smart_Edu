'use client'

import { useEffect, useRef } from 'react'

import { SEARCH_LABELS } from '@/lib/labels'

export function SearchModal() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function openSearch() {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const dialog = dialogRef.current
        if (!dialog) return
        if (!dialog.open) dialog.showModal()
        window.requestAnimationFrame(() => inputRef.current?.focus())
      }
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <>
      <button
        aria-label={SEARCH_LABELS.openSearch}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        onClick={openSearch}
        title={SEARCH_LABELS.openSearch}
        type="button"
      >
        <SearchIcon />
      </button>

      <dialog
        aria-labelledby="site-search-title"
        className="m-auto w-[min(42rem,calc(100%-2rem))] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close()
        }}
        ref={dialogRef}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <h2 className="text-lg font-extrabold text-blue-950" id="site-search-title">
            {SEARCH_LABELS.title}
          </h2>
          <button
            aria-label={SEARCH_LABELS.closeSearch}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <form action="/tim-kiem" className="flex gap-2 p-5 sm:p-7" method="GET">
          <input
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            name="q"
            placeholder={SEARCH_LABELS.inputPlaceholder}
            ref={inputRef}
            required
          />
          <button
            aria-label={SEARCH_LABELS.submit}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            type="submit"
          >
            <SearchIcon />
          </button>
        </form>
      </dialog>
    </>
  )
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}