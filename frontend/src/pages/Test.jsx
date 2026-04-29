import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"
import QuestionCard from "../components/QuestionCard"

export default function Test() {
  const navigate = useNavigate()
  const user = useMemo(() => JSON.parse(localStorage.getItem("assessiq_user") || "null"), [])
  const [attemptId, setAttemptId] = useState(null)
  const [question, setQuestion] = useState(null)
  const [startedAt, setStartedAt] = useState(Date.now())
  const [lastAnswer, setLastAnswer] = useState("")
  const [timer, setTimer] = useState(60)
  const [index, setIndex] = useState(1)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    API.post("/test/start", { user_id: user.id, mode: "adaptive", total_questions: 12 }).then((res) => {
      setAttemptId(res.data.attempt_id)
      setQuestion(res.data.first_question)
      setStartedAt(Date.now())
      setTimer(res.data.time_limit_seconds)
    })
  }, [navigate, user])

  useEffect(() => {
    const iv = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (attemptId && document.hidden) {
        API.post("/test/behavior", { attempt_id: attemptId, event_type: "tab_switch" })
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [attemptId])

  const submit = async (answer) => {
    if (!attemptId || !question) return
    const timeTaken = (Date.now() - startedAt) / 1000
    const changed = Boolean(lastAnswer && lastAnswer !== answer)
    setLastAnswer(answer)
    const payload = {
      attempt_id: attemptId,
      question_id: question.id,
      answer,
      time_taken: timeTaken,
      changed_answer: changed
    }
    const res = await API.post("/test/submit-answer", payload)
    if (res.data.finished) {
      navigate("/analytics")
      return
    }
    setQuestion(res.data.next_question)
    setStartedAt(Date.now())
    setIndex((v) => v + 1)
  }

  if (!question) {
    return <div className="page"><div className="card">Loading adaptive test...</div></div>
  }

  return (
    <div className="page">
      <header className="topbar">
        <h2>Adaptive Test Session</h2>
        <div className="timer">Time Left: {timer}s | Q{index}</div>
      </header>
      <QuestionCard question={question} onAnswer={submit} />
      <div className="row">
        <button className="btn" onClick={() => navigate("/")}>Save and Exit</button>
      </div>
    </div>
  )
}
