import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Eye, Save, Send, Zap } from "lucide-react"
import API from "../api.js"

const letters = ["A", "B", "C", "D"]

export default function TestInterface() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [selected, setSelected] = useState("")
  const [difficulty, setDifficulty] = useState(2)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [answerChanges, setAnswerChanges] = useState(0)
  const [revisitCount, setRevisitCount] = useState(0)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [inactivity, setInactivity] = useState(0)
  const startedAt = useRef(Date.now())
  const lastActive = useRef(Date.now())

  useEffect(() => {
    start()
  }, [])

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
      if (Date.now() - lastActive.current > 15000) setInactivity((value) => value + 1)
    }, 1000)
    const activity = () => {
      lastActive.current = Date.now()
    }
    const visibility = () => {
      if (document.hidden) setTabSwitches((value) => value + 1)
    }
    window.addEventListener("mousemove", activity)
    window.addEventListener("keydown", activity)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      clearInterval(tick)
      window.removeEventListener("mousemove", activity)
      window.removeEventListener("keydown", activity)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [])

  const timer = useMemo(() => {
    const min = String(Math.floor(elapsed / 60)).padStart(2, "0")
    const sec = String(elapsed % 60).padStart(2, "0")
    return `${min}:${sec}`
  }, [elapsed])

  const start = async () => {
    const { data } = await API.post("/tests/start", { test_id: 1 })
    setAttemptId(data.attempt_id)
    setQuestion(data.question)
    resetQuestionState()
  }

  const resetQuestionState = () => {
    startedAt.current = Date.now()
    lastActive.current = Date.now()
    setElapsed(0)
    setSelected("")
    setResult(null)
    setAnswerChanges(0)
    setRevisitCount(0)
    setTabSwitches(0)
    setInactivity(0)
  }

  const choose = (letter) => {
    if (selected && selected !== letter) setAnswerChanges((value) => value + 1)
    if (selected === letter) setRevisitCount((value) => value + 1)
    setSelected(letter)
  }

  const submit = async () => {
    if (!selected || !question || loading) return
    setLoading(true)
    const time_taken = (Date.now() - startedAt.current) / 1000
    const { data } = await API.post("/tests/answer", {
      attempt_id: attemptId,
      question_id: question.id,
      selected_option: selected,
      time_taken,
      revisit_count: revisitCount,
      answer_changes: answerChanges,
      tab_switches: tabSwitches,
      inactivity_seconds: inactivity
    })
    setResult(data)
    setDifficulty(data.difficulty)
    setLoading(false)
    setTimeout(() => {
      if (data.completed) navigate("/analytics")
      else {
        setQuestion(data.next_question)
        resetQuestionState()
      }
    }, 1100)
  }

  if (!question) return <div className="page"><div className="loading">Preparing adaptive test...</div></div>

  return (
    <div className="page test-page">
      <header className="test-topbar">
        <div><p className="eyebrow">Adaptive test</p><h1>{question.topic}</h1></div>
        <div className="test-stats">
          <span><Clock size={17} />{timer}</span>
          <span><Zap size={17} />Level {difficulty}</span>
          <span><Eye size={17} />{tabSwitches}</span>
          <span><Save size={17} />Auto-save</span>
        </div>
      </header>
      <section className="question-zone">
        <div className="question-meta">
          <span>{question.subtopic}</span>
          <span>Difficulty {question.difficulty}</span>
        </div>
        <h2>{question.text}</h2>
        <div className="options">
          {question.options.map((option, index) => (
            <button key={option} className={selected === letters[index] ? "option selected" : "option"} onClick={() => choose(letters[index])}>
              <strong>{letters[index]}</strong>
              <span>{option}</span>
            </button>
          ))}
        </div>
        {result && <div className={result.is_correct ? "feedback good" : "feedback bad"}>{result.is_correct ? "Correct" : "Needs review"}: {result.explanation}</div>}
        <button className="primary submit-answer" onClick={submit} disabled={!selected || loading}><Send size={18} />Submit Answer</button>
      </section>
    </div>
  )
}

