'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

import { LAYOUT_LABELS } from '@/lib/labels'
import type { Homepage, Media } from '@/payload-types'

type Banner = NonNullable<Homepage['banners']>[number]

function isMedia(value: Banner['image']): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value
}

type HeroBannerProps = {
  banners: Homepage['banners']
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const slides = banners ?? []
  const hasSlides = slides.length > 0

  if (!hasSlides) {
    return (
      <section className="relative isolate overflow-hidden bg-blue-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-20 -top-36 h-[32rem] w-[32rem] rounded-full bg-orange-400/25 blur-3xl" />
          <div className="absolute -bottom-52 left-0 h-[28rem] w-[28rem] rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        <div className="mx-auto grid min-h-[35rem] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-[0.2em] text-orange-200">
              {LAYOUT_LABELS.heroEyebrow}
            </p>
            <h1 className="text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              {LAYOUT_LABELS.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-blue-100/80 sm:text-lg">
              {LAYOUT_LABELS.heroDescription}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400"
                href="/lien-he"
              >
                {LAYOUT_LABELS.ctaButton}
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-6 font-bold text-white transition hover:bg-white/10"
                href="/khoa-hoc"
              >
                {LAYOUT_LABELS.viewAll}
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-8 rotate-6 rounded-[2.5rem] border border-white/20 bg-white/5" />
            <div className="absolute inset-12 -rotate-3 rounded-[2.5rem] bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 shadow-2xl shadow-orange-950/40" />
            <div className="absolute inset-[22%] grid place-items-center rounded-[2rem] border border-white/30 bg-blue-900/70 text-center backdrop-blur">
              <span className="text-[clamp(5rem,18vw,10rem)] font-black leading-none text-white">H</span>
            </div>
            <span className="absolute left-2 top-1/4 rounded-2xl bg-white px-5 py-4 text-3xl shadow-xl">✦</span>
            <span className="absolute bottom-1/4 right-0 rounded-2xl bg-sky-300 px-5 py-4 text-3xl shadow-xl">✧</span>
          </div>
        </div>
      </section>
    )
  }

  const safeIndex = activeIndex % slides.length

  function move(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length)
  }

  return (
    <section
      aria-label={LAYOUT_LABELS.heroEyebrow}
      className="relative isolate overflow-hidden bg-blue-950"
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return
        const delta = event.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(delta) > 48) move(delta > 0 ? -1 : 1)
        touchStartX.current = null
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX
      }}
    >
      <div
        aria-live="polite"
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const image = isMedia(slide.image) ? slide.image : null
          const content = (
            <div className="relative isolate mx-auto flex min-h-[35rem] max-w-7xl items-end px-4 pb-24 pt-20 sm:px-6 md:min-h-[42rem] md:items-center md:pb-20 lg:px-8">
              {image?.url ? (
                <Image
                  alt={image.alt || slide.title || LAYOUT_LABELS.carouselImageAlt}
                  className="absolute inset-0 -z-20 h-full w-full object-cover"
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  src={image.url}
                  unoptimized
                />
              ) : null}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-950/95 via-blue-950/75 to-blue-950/25" />
              <div className="max-w-3xl text-white">
                <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold tracking-[0.2em] text-orange-200">
                  {LAYOUT_LABELS.heroEyebrow}
                </p>
                <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {slide.title || LAYOUT_LABELS.heroTitle}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100/85 sm:text-lg">
                  {LAYOUT_LABELS.heroDescription}
                </p>
                <Link
                  className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 font-bold text-white shadow-lg transition hover:bg-orange-400"
                  href={slide.link || '/lien-he'}
                >
                  {LAYOUT_LABELS.ctaButton}
                </Link>
              </div>
            </div>
          )

          return (
            <div aria-hidden={index !== safeIndex} className="w-full shrink-0" key={slide.id || index}>
              {slide.link ? (
                <div className="relative">{content}</div>
              ) : (
                content
              )}
            </div>
          )
        })}
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-5 left-0 right-0 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div aria-label={LAYOUT_LABELS.slidePagination} className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                aria-label={`${LAYOUT_LABELS.slide} ${index + 1}`}
                aria-pressed={index === safeIndex}
                className={`h-3 rounded-full transition-all ${index === safeIndex ? 'w-9 bg-orange-400' : 'w-3 bg-white/60'}`}
                key={slide.id || index}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              aria-label={LAYOUT_LABELS.previous}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/40 text-white transition hover:bg-white/10"
              onClick={() => move(-1)}
              type="button"
            >
              <Arrow direction="left" />
            </button>
            <button
              aria-label={LAYOUT_LABELS.next}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/40 text-white transition hover:bg-white/10"
              onClick={() => move(1)}
              type="button"
            >
              <Arrow direction="right" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      {direction === 'left' ? (
        <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      ) : (
        <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      )}
    </svg>
  )
}
