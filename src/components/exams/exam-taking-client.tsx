'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { Exam } from '@/payload-types'
import { EXAM_TAKING_LABELS } from '@/lib/labels'

type ExamQuestion = NonNullable<Exam['examContent']>[number]

type ExamResult = {
  correctCount: number
  elapsedSeconds: number
  selectedAnswers: Record<number, number>
  timedOut: boolean
}

type ExamTakingClientProps = {
  exam: Exam
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes} ${EXAM_TAKING_LABELS.minutesUnit} ${remainingSeconds} ${EXAM_TAKING_LABELS.secondsUnit}`
}

function getCorrectIndex(question: ExamQuestion): number {
  return Number(question.correctIndex)
}

export function ExamTakingClient({ exam }: ExamTakingClientProps) {
  const questions = exam.examContent ?? []
  const configuredMinutes = Number.isInteger(exam.durationMinutes) && (exam.durationMinutes ?? 0) > 0
    ? exam.durationMinutes ?? 45
    : 45
  const totalSeconds = configuredMinutes * 60

  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)
  const [animatedScorePercent, setAnimatedScorePercent] = useState(0)
  const scorePercent = result && questions.length > 0
    ? Math.max(0, Math.min(100, (result.correctCount / questions.length) * 100))
    : 0

  useEffect(() => {
    if (!result) {
      setAnimatedScorePercent(0)
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setAnimatedScorePercent(scorePercent)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [result, scorePercent])

  useEffect(() => {
    if (result || questions.length === 0) return

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [questions.length, result])

  useEffect(() => {
    if (remainingSeconds !== 0 || result || questions.length === 0) return

    const correctCount = questions.reduce(
      (count, question, index) => count + (selectedAnswers[index] === getCorrectIndex(question) ? 1 : 0),
      0,
    )
    setResult({
      correctCount,
      elapsedSeconds: totalSeconds,
      selectedAnswers: { ...selectedAnswers },
      timedOut: true,
    })
    setShowTimeoutModal(true)
  }, [questions, remainingSeconds, result, selectedAnswers, totalSeconds])

  useEffect(() => {
    if (result) return

    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const attemptUrl = window.location.href
    const restoreHistoryEntry = () => {
      window.history.pushState({ examTaking: true }, '', attemptUrl)
    }

    const handleBack = () => {
      if (window.confirm(EXAM_TAKING_LABELS.leaveConfirm)) {
        window.removeEventListener('popstate', handleBack)
        window.removeEventListener('beforeunload', preventUnload)
        return
      }
      restoreHistoryEntry()
    }

    const currentState = window.history.state
    const alreadyGuarded =
      typeof currentState === 'object' && currentState !== null && 'examTaking' in currentState
    if (!alreadyGuarded) restoreHistoryEntry()
    window.addEventListener('beforeunload', preventUnload)
    window.addEventListener('popstate', handleBack)

    return () => {
      window.removeEventListener('beforeunload', preventUnload)
      window.removeEventListener('popstate', handleBack)
    }
  }, [result])

  function completeExam() {
    if (result) return
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length
    if (unansweredCount > 0 && !window.confirm(EXAM_TAKING_LABELS.confirmSubmit)) return

    const correctCount = questions.reduce(
      (count, question, index) => count + (selectedAnswers[index] === getCorrectIndex(question) ? 1 : 0),
      0,
    )
    setResult({
      correctCount,
      elapsedSeconds: totalSeconds - remainingSeconds,
      selectedAnswers: { ...selectedAnswers },
      timedOut: false,
    })
  }

  function navigateToQuestion(index: number) {
    setActiveQuestion(index)
    document.getElementById(`exam-question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (questions.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-blue-950">{exam.title}</h1>
          <p className="mt-3 text-slate-600">{EXAM_TAKING_LABELS.noQuestions}</p>
        </div>
      </section>
    )
  }

  if (result) {
    const score = (result.correctCount / questions.length) * 10
    const roundedScore = Math.round(score * 10) / 10
    const scoreTone = score < 5
      ? { stroke: '#dc2626' }
      : score < 8
        ? { stroke: '#d97706' }
        : { stroke: '#059669' }
    const resultMessage = score >= 8
      ? EXAM_TAKING_LABELS.perfectMessage
      : score >= 5
        ? EXAM_TAKING_LABELS.goodMessage
        : EXAM_TAKING_LABELS.practiceMessage
    const confettiColors = ['#ea580c', '#16a34a', '#0284c7', '#eab308', '#db2777']
    const circumference = 427.26
    const circleGlow = score >= 8
      ? 'ring-4 ring-emerald-100 shadow-[0_0_38px_rgba(5,150,105,0.32)]'
      : 'shadow-[0_12px_34px_rgba(15,23,42,0.12)]'

    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {score >= 8 ? (
          <div aria-hidden="true" className="exam-confetti-layer">
            {Array.from({ length: 24 }, (_, index) => (
              <span
                className="exam-confetti-piece"
                key={index}
                style={{
                  backgroundColor: confettiColors[index % confettiColors.length],
                  left: `${(index * 37) % 100}%`,
                  animationDelay: `${(index % 8) * 0.14}s`,
                }}
              />
            ))}
          </div>
        ) : null}

        <header className="grid items-center gap-8 rounded-2xl bg-blue-950 px-6 py-7 text-white sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-300">
              {EXAM_TAKING_LABELS.brand}
            </p>
            <h1 className="mt-2 text-3xl font-black">{EXAM_TAKING_LABELS.resultTitle}</h1>
            <p className="mt-3 text-blue-100">{exam.title}</p>
            <p className="mt-5 text-xl font-extrabold text-white">{resultMessage}</p>
            <p className="mt-2 text-sm text-blue-100">
              {result.correctCount}/{questions.length} {EXAM_TAKING_LABELS.questionUnit}
              <span aria-hidden="true"> · </span>
              {EXAM_TAKING_LABELS.elapsed}: {formatElapsed(result.elapsedSeconds)}
            </p>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-self-end">
            <div
              aria-label={`${roundedScore}${EXAM_TAKING_LABELS.scoreOutOf} ${EXAM_TAKING_LABELS.scoreLabel}`}
              className={`relative grid h-44 w-44 place-items-center rounded-full bg-white shadow-xl transition-shadow duration-700 ${circleGlow}`}
              role="img"
            >
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" fill="none" r="68" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="80"
                  cy="80"
                  fill="none"
                  r="68"
                  stroke={scoreTone.stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - animatedScorePercent / 100)}
                  strokeLinecap="round"
                  strokeWidth="10"
                  style={{ transition: 'stroke-dashoffset 1200ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                />
              </svg>
              <div className="relative text-center text-blue-950">
                <p className="text-4xl font-black leading-none">{roundedScore}/10</p>
                <p className="mt-2 text-sm font-bold text-slate-500">{EXAM_TAKING_LABELS.scoreLabel}</p>
              </div>
            </div>
          </div>
        </header>

        <ol className="mt-7 space-y-4">
          {questions.map((question, index) => {
            const correctIndex = getCorrectIndex(question)
            const selectedIndex = result.selectedAnswers[index]
            const isCorrect = selectedIndex === correctIndex

            return (
              <li
                className={`rounded-xl border p-5 ${isCorrect ? 'border-emerald-200 bg-white' : 'border-rose-200 bg-white'}`}
                key={question.id ?? index}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="flex min-w-0 flex-1 gap-3 font-extrabold text-slate-900">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {isCorrect ? '✓' : '×'}
                    </span>
                    <span>{EXAM_TAKING_LABELS.question} {index + 1}. {question.question}</span>
                  </h2>
                  <span className={`shrink-0 text-sm font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isCorrect ? EXAM_TAKING_LABELS.correct : EXAM_TAKING_LABELS.incorrect}
                  </span>
                </div>
                {!isCorrect ? (
                  <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm">
                    <p className="font-bold text-emerald-800">
                      {EXAM_TAKING_LABELS.correctAnswerIs} {OPTION_LABELS[correctIndex]}
                    </p>
                    {selectedIndex !== undefined ? (
                      <p className="mt-1 text-rose-800">
                        {EXAM_TAKING_LABELS.selectedAnswer}: {OPTION_LABELS[selectedIndex]}. {question.answers[selectedIndex]?.answer}
                      </p>
                    ) : (
                      <p className="mt-1 text-rose-800">{EXAM_TAKING_LABELS.unansweredResult}</p>
                    )}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>

        <footer className="mt-7 flex justify-center">
          {exam.isPremium ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              href="/"
            >
              {EXAM_TAKING_LABELS.home}
            </Link>
          ) : (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-500"
              href={exam.slug ? `/thi-thu/${exam.slug}/lam-bai` : '/thi-thu'}
            >
              {EXAM_TAKING_LABELS.retryExam}
            </Link>
          )}
        </footer>

        {result.timedOut && showTimeoutModal ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="presentation">
            <section
              aria-describedby="exam-timeout-description"
              aria-labelledby="exam-timeout-title"
              aria-modal="true"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
              role="dialog"
            >
              <div aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-2xl text-amber-700">
                !
              </div>
              <h2 className="mt-4 text-center text-2xl font-black text-blue-950" id="exam-timeout-title">
                {EXAM_TAKING_LABELS.timeoutTitle}
              </h2>
              <p className="mt-2 text-center leading-6 text-slate-600" id="exam-timeout-description">
                {EXAM_TAKING_LABELS.timeoutDescription}
              </p>
              <button
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-950 px-5 text-sm font-bold text-white hover:bg-blue-900"
                onClick={() => setShowTimeoutModal(false)}
                type="button"
              >
                {EXAM_TAKING_LABELS.viewResult}
              </button>
            </section>
          </div>
        ) : null}
      </section>
    )
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const isUrgent = remainingSeconds < 5 * 60

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">
          {EXAM_TAKING_LABELS.brand}
        </p>
        <h1 className="mt-2 text-2xl font-black leading-tight text-blue-950 sm:text-3xl">{exam.title}</h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <main className="space-y-5">
          {questions.map((question, questionIndex) => (
            <article
              className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
              id={`exam-question-${questionIndex}`}
              key={question.id ?? questionIndex}
            >
              <fieldset disabled={remainingSeconds <= 0 || result !== null}>
                <legend className="text-lg font-black leading-7 text-blue-950 sm:text-xl">
                  {EXAM_TAKING_LABELS.question} {questionIndex + 1}. {question.question}
                </legend>
                <div className="mt-5 grid gap-3">
                  {question.answers.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[questionIndex] === optionIndex
                    return (
                      <label
                        className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${isSelected ? 'border-blue-700 bg-blue-50 text-blue-950' : 'border-slate-200 hover:border-slate-400'}`}
                        key={option.id ?? optionIndex}
                      >
                        <input
                          checked={isSelected}
                          className="mt-1 h-4 w-4 accent-blue-800"
                          name={`question-${questionIndex}`}
                          onChange={() => setSelectedAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}
                          type="radio"
                          value={optionIndex}
                        />
                        <span className="w-6 shrink-0 font-extrabold">{OPTION_LABELS[optionIndex]}.</span>
                        <span className="leading-6">{option.answer}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </article>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-600">{answeredCount}/{questions.length} {EXAM_TAKING_LABELS.answered}</p>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-black text-white transition hover:bg-orange-500"
              onClick={completeExam}
              type="button"
            >
              {EXAM_TAKING_LABELS.submit}
            </button>
          </div>
        </main>

        <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-24">
          <div aria-live="off" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-600">{EXAM_TAKING_LABELS.remainingTime}</p>
            <p
              aria-label={`${EXAM_TAKING_LABELS.remainingTime} ${formatClock(remainingSeconds)}`}
              className={`mt-1 font-mono text-4xl font-black tabular-nums ${isUrgent ? 'animate-pulse text-red-700' : 'text-blue-950'}`}
              role="timer"
            >
              {formatClock(remainingSeconds)}
            </p>
            <p className="mt-2 text-xs text-slate-500">{answeredCount}/{questions.length} {EXAM_TAKING_LABELS.answeredCount}</p>
          </div>

          <nav aria-label={EXAM_TAKING_LABELS.questionNavigation} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-extrabold text-blue-950">{EXAM_TAKING_LABELS.questionNavigation}</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible">
              {questions.map((question, index) => {
                const isAnswered = selectedAnswers[index] !== undefined
                return (
                  <button
                    aria-current={activeQuestion === index ? 'step' : undefined}
                    aria-label={`${EXAM_TAKING_LABELS.question} ${index + 1}${isAnswered ? `, ${EXAM_TAKING_LABELS.answered}` : `, ${EXAM_TAKING_LABELS.unanswered}`}`}
                    className={`h-10 w-10 shrink-0 rounded-lg border text-sm font-extrabold transition ${isAnswered ? 'border-emerald-700 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-blue-700'} ${activeQuestion === index ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
                    key={question.id ?? index}
                    onClick={() => navigateToQuestion(index)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </nav>

          <button
            className="hidden min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-500 lg:inline-flex"
            onClick={completeExam}
            type="button"
          >
            {EXAM_TAKING_LABELS.submit}
          </button>
        </aside>
      </div>
    </section>
  )
}