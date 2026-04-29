import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"

export default function Admin() {
  const navigate = useNavigate()
  const user = useMemo(() => JSON.parse(localStorage.getItem("assessiq_user") || "null"), [])
  const [prompt, setPrompt] = useState("")
  const [options, setOptions] = useState("A|B|C|D")
  const [correct, setCorrect] = useState("A")
  const [topic, setTopic] = useState("Algebra")
  const [difficulty, setDifficulty] = useState(2)
  const [list, setList] = useState([])
  const [stats, setStats] = useState(null)

  const load = async () => {
    const [qRes, sRes] = await Promise.all([
      API.get("/admin/questions"),
      API.get("/admin/student-stats")
    ])
    setList(qRes.data)
    setStats(sRes.data)
  }

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    if (user.role !== "teacher") {
      navigate("/")
      return
    }
    load()
  }, [navigate, user])

  const addQuestion = async (e) => {
    e.preventDefault()
    await API.post("/admin/questions", {
      prompt,
      options: options.split("|"),
      correct_answer: correct,
      topic,
      subtopic: topic,
      difficulty: Number(difficulty)
    })
    setPrompt("")
    await load()
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Teacher Panel</h1>
        <button className="btn" onClick={() => navigate("/")}>Student View</button>
      </header>
      <section className="grid">
        <form className="card" onSubmit={addQuestion}>
          <h3>Add Question</h3>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question prompt" />
          <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Option1|Option2|Option3|Option4" />
          <input value={correct} onChange={(e) => setCorrect(e.target.value)} placeholder="Correct answer value" />
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
          <input type="number" min="1" max="5" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
          <button className="btn primary">Create</button>
        </form>
        <div className="card">
          <h3>Student Analytics</h3>
          <p>Total Students: {stats?.total_students ?? "-"}</p>
          <p>Avg Accuracy: {stats ? `${Math.round(stats.avg_accuracy * 100)}%` : "-"}</p>
          <p>Drop-off Rate: {stats ? `${Math.round(stats.dropoff_rate * 100)}%` : "-"}</p>
          <p>Weak Topic: {stats?.weak_topic ?? "-"}</p>
        </div>
        <div className="card">
          <h3>Question Bank</h3>
          <div className="question-list">
            {list.map((q) => (
              <div key={q.id} className="question-item">
                <strong>{q.topic}</strong> | D{q.difficulty}
                <p>{q.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
