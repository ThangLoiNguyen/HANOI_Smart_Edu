'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import {
  checkPlacementAnswer,
  getPlacementQuestions,
  submitPlacementTest,
} from '@/app/actions/submit-contact'
import type { PlacementQuestionForTest } from '@/app/actions/submit-contact'
import { CONTACT_LABELS, PLACEMENT_TEST_LABELS } from '@/lib/labels'

type AnswerFeedback = {
  correct: boolean
  correctAnswerIndex: number
  explanation: string
}

type TestResult = {
  score: number
  correctCount: number
  recommendation: string
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

function getRecommendation(score: number): string {
  if (score >= 80) return PLACEMENT_TEST_LABELS.recommendations.advanced
  if (score >= 50) return PLACEMENT_TEST_LABELS.recommendations.standard
  return PLACEMENT_TEST_LABELS.recommendations.foundation
}

export default function PlacementTestPage() {
  const [questions, setQuestions] = useState<PlacementQuestionForTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)
  const [answerError, setAnswerError] = useState('')
  const [correctByIndex, setCorrectByIndex] = useState<Record<number, boolean>>({})
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadQuestions() {
      try {
        const response = await getPlacementQuestions()
        if (!isActive) return

        if (response.success) {
          setQuestions(Array.isArray(response.questions) ? response.questions : [])
        } else {
          setQuestions([])
          setLoadError(response.message)
        }
      } catch (error) {
        console.error('[kiem-tra-dau-vao] Failed to load placement questions:', error)
        if (!isActive) return
        setQuestions([])
        setLoadError('load-failed')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadQuestions()

    return () => {
      isActive = false
    }
  }, [])

  const currentQuestion = questions[questionIndex]
  const answeredCount = Object.keys(correctByIndex).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  async function chooseAnswer(answerIndex: number) {
    if (!currentQuestion || feedback || isCheckingAnswer) return
    setSelectedAnswerIndex(answerIndex)
    setAnswerError('')
    setIsCheckingAnswer(true)

    try {
      const response = await checkPlacementAnswer(currentQuestion.id, answerIndex)
      if (!response.success) {
        setAnswerError(response.message)
        return
      }
      setFeedback({
        correct: response.correct,
        correctAnswerIndex: response.correctAnswerIndex,
        explanation: response.explanation,
      })
      setCorrectByIndex((current) => ({ ...current, [questionIndex]: response.correct }))
    } catch {
      setAnswerError(CONTACT_LABELS.genericError)
    } finally {
      setIsCheckingAnswer(false)
    }
  }

  function continueTest() {
    if (!feedback) return
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1)
      setSelectedAnswerIndex(null)
      setFeedback(null)
      setAnswerError('')
      setShowHint(false)
      return
    }

    const correctCount = Object.values(correctByIndex).filter(Boolean).length
    const score = correctCount * 10
    setResult({ score, correctCount, recommendation: getRecommendation(score) })
    window.requestAnimationFrame(() => {
      document.getElementById('placement-test-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!result) return

    setSubmissionStatus('submitting')
    setSubmissionError('')
    const formData = new FormData(event.currentTarget)
    formData.set(
      'message',
      `Điểm test đầu vào: ${result.score}/100 (${result.correctCount}/10 câu). Trình độ đề xuất: ${result.recommendation}.`,
    )

    try {
      const response = await submitPlacementTest(formData)
      if (!response.success) {
        setSubmissionStatus('error')
        setSubmissionError(response.message || CONTACT_LABELS.genericError)
        return
      }
      setSubmissionStatus('success')
    } catch {
      setSubmissionStatus('error')
      setSubmissionError(CONTACT_LABELS.genericError)
    }
  }

  if (isLoading) {
    return (
      <section aria-live="polite" className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-600 sm:px-6">
        {PLACEMENT_TEST_LABELS.loading}
      </section>
    )
  }

  if (loadError || questions.length !== 10) {
    const message = loadError === 'insufficient-questions'
      ? PLACEMENT_TEST_LABELS.insufficientQuestions
      : PLACEMENT_TEST_LABELS.loadError
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-blue-950">{PLACEMENT_TEST_LABELS.title}</h1>
          <p className="mt-3 text-slate-600">{message}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-2xl bg-blue-950 px-5 py-7 text-white sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-300">
          {PLACEMENT_TEST_LABELS.title}
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{PLACEMENT_TEST_LABELS.title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-blue-100">{PLACEMENT_TEST_LABELS.description}</p>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm font-semibold text-blue-100">
            <span>{PLACEMENT_TEST_LABELS.progress}</span>
            <span>{answeredCount}/{questions.length}</span>
          </div>
          <div
            aria-label={PLACEMENT_TEST_LABELS.progress}
            aria-valuemax={questions.length}
            aria-valuemin={0}
            aria-valuenow={answeredCount}
            className="h-2.5 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
          >
            <div className="h-full rounded-full bg-orange-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {!result ? (
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28 lg:h-fit">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-blue-950">
              {PLACEMENT_TEST_LABELS.stairs}
            </h2>
            <ol aria-label={PLACEMENT_TEST_LABELS.stairs} className="mt-4 space-y-1">
              {(questions || []).map((question, index) => {
                const isCorrect = correctByIndex[index] === true
                const isWrong = correctByIndex[index] === false
                return (
                  <li
                    aria-label={`${PLACEMENT_TEST_LABELS.question} ${index + 1}`}
                    className={`flex h-5 items-center gap-2 rounded-sm px-2 text-xs font-bold transition-colors ${
                      isCorrect
                        ? 'bg-emerald-500 text-white'
                        : isWrong
                          ? 'bg-slate-300 text-slate-700'
                          : index === questionIndex
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-slate-100 text-slate-500'
                    }`}
                    key={question.id}
                    style={{ width: `${55 + (index + 1) * 4}%` }}
                  >
                    <span>{index + 1}</span>
                    {isCorrect ? <span aria-hidden="true">✓</span> : null}
                  </li>
                )
              })}
            </ol>
            <div aria-hidden="true" className="mt-1 h-2 w-full border-t-2 border-slate-300" />
          </aside>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-extrabold uppercase tracking-wide text-orange-700">
                {currentQuestion.topic}
              </p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {PLACEMENT_TEST_LABELS.difficulty[currentQuestion.difficulty ?? 'de']}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {PLACEMENT_TEST_LABELS.question} {questionIndex + 1} / {questions.length}
            </p>
            <h2 className="mt-3 text-xl font-extrabold leading-8 text-blue-950 sm:text-2xl">
              {currentQuestion.question}
            </h2>

            {currentQuestion.hint ? (
              <div className="mt-5">
                <button
                  aria-expanded={showHint}
                  className="min-h-10 rounded-lg border border-orange-300 px-4 text-sm font-bold text-orange-800 transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                  onClick={() => setShowHint((shown) => !shown)}
                  type="button"
                >
                  {PLACEMENT_TEST_LABELS.hintButton}
                </button>
                {showHint ? (
                  <p className="mt-3 rounded-lg bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                    <strong>{PLACEMENT_TEST_LABELS.hintHeading}: </strong>{currentQuestion.hint}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(currentQuestion.answers || []).map((answer, answerIndex) => {
                const selected = selectedAnswerIndex === answerIndex
                const correctAnswer = feedback?.correctAnswerIndex === answerIndex
                const incorrectSelection = selected && feedback && !feedback.correct
                return (
                  <button
                    aria-pressed={selected}
                    className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-default ${
                      correctAnswer
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : incorrectSelection
                          ? 'border-red-400 bg-red-50 text-red-900'
                          : selected
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                    disabled={Boolean(feedback) || isCheckingAnswer}
                    key={`${currentQuestion.id}-${answerIndex}`}
                    onClick={() => chooseAnswer(answerIndex)}
                    type="button"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 font-extrabold text-slate-700">
                      {String.fromCharCode(65 + answerIndex)}
                    </span>
                    <span>{answer}</span>
                  </button>
                )
              })}
            </div>

            {answerError ? (
              <p aria-live="polite" className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
                {answerError}
              </p>
            ) : null}
            {feedback ? (
              <div
                aria-live="polite"
                className={`mt-6 rounded-lg p-4 ${feedback.correct ? 'bg-emerald-50 text-emerald-950' : 'bg-amber-50 text-amber-950'}`}
              >
                <p className="font-extrabold">
                  {feedback.correct ? PLACEMENT_TEST_LABELS.correct : PLACEMENT_TEST_LABELS.incorrect}
                </p>
                {feedback.explanation ? (
                  <p className="mt-2 text-sm leading-6">
                    <strong>{PLACEMENT_TEST_LABELS.explanationHeading}: </strong>{feedback.explanation}
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              className="mt-6 min-h-12 w-full rounded-xl bg-orange-500 px-6 py-3 font-extrabold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={!feedback || isCheckingAnswer}
              onClick={continueTest}
              type="button"
            >
              {questionIndex === questions.length - 1
                ? PLACEMENT_TEST_LABELS.finishTest
                : PLACEMENT_TEST_LABELS.nextQuestion}
            </button>
          </article>
        </div>
      ) : (
        <section
          className="scroll-mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:p-8"
          id="placement-test-result"
        >
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
            {PLACEMENT_TEST_LABELS.resultHeading}
          </p>
          <h2 className="mt-2 text-2xl font-black text-blue-950 sm:text-3xl">
            {PLACEMENT_TEST_LABELS.scoreLead} {result.score}{PLACEMENT_TEST_LABELS.scoreOutOf} {result.recommendation}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{result.correctCount}/10 câu trả lời đúng.</p>

          <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={submitLead}>
            <h3 className="text-lg font-extrabold text-blue-950 sm:col-span-2">
              {PLACEMENT_TEST_LABELS.contactHeading}
            </h3>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {PLACEMENT_TEST_LABELS.name}
              <input
                autoComplete="name"
                className="min-h-12 rounded-lg border border-slate-300 bg-white px-4"
                maxLength={100}
                name="fullName"
                placeholder={PLACEMENT_TEST_LABELS.namePlaceholder}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              {PLACEMENT_TEST_LABELS.phone}
              <input
                autoComplete="tel"
                className="min-h-12 rounded-lg border border-slate-300 bg-white px-4"
                maxLength={24}
                name="phone"
                placeholder={PLACEMENT_TEST_LABELS.phonePlaceholder}
                required
                type="tel"
              />
            </label>
            <label aria-hidden="true" className="absolute left-[-9999px] top-0">
              {CONTACT_LABELS.honeypot}
              <input autoComplete="off" name="website" tabIndex={-1} />
            </label>
            {submissionStatus === 'success' ? (
              <p className="rounded-lg bg-green-100 p-4 text-sm font-semibold text-green-900 sm:col-span-2" role="status">
                {PLACEMENT_TEST_LABELS.success}
              </p>
            ) : null}
            {submissionStatus === 'error' ? (
              <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800 sm:col-span-2" role="alert">
                {submissionError}
              </p>
            ) : null}
            <button
              className="min-h-12 rounded-xl bg-blue-950 px-6 py-3 font-extrabold text-white transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
              disabled={submissionStatus === 'submitting' || submissionStatus === 'success'}
              type="submit"
            >
              {submissionStatus === 'submitting'
                ? PLACEMENT_TEST_LABELS.submitting
                : PLACEMENT_TEST_LABELS.submitContact}
            </button>
          </form>
        </section>
      )}
    </section>
  )
}
