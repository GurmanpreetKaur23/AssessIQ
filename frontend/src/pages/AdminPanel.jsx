import { useEffect, useState } from "react"
import { Plus, RefreshCw, ShieldAlert, Users } from "lucide-react"
import API from "../api.js"

const emptyQuestion = {
  text: "",
  options: ["", "", "", ""],
  correct_option: "A",
  explanation: "",
  topic: "",
  subtopic: "",
  difficulty: 2,
  active: true
}

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState(null)
  const [questions, setQuestions] = useState([])
  const [form, setForm] = useState(emptyQuestion)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const [analyticsRes, questionsRes] = await Promise.all([API.get("/analytics/admin"), API.get("/admin/questions")])
    setAnalytics(analyticsRes.data)
    setQuestions(questionsRes.data)
  }

  const addQuestion = async (event) => {
    event.preventDefault()
    await API.post("/admin/questions", form)
    setForm(emptyQuestion)
    load()
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow">Teacher control center</p><h1>Manage adaptive tests and detect learning risks.</h1></div>
        <button className="primary" onClick={load}><RefreshCw size={18} />Refresh</button>
      </header>
      <section className="metric-grid">
        <div className="metric"><Users /><span>Profiled Students</span><strong>{analytics?.students ?? 0}</strong></div>
        <div className="metric"><ShieldAlert /><span>Anomaly Flags</span><strong>{analytics?.anomalies?.length ?? 0}</strong></div>
        <div className="metric"><Plus /><span>Questions</span><strong>{questions.length}</strong></div>
      </section>
      <section className="admin-grid">
        <form className="panel question-form" onSubmit={addQuestion}>
          <h2>Add Question</h2>
          <input placeholder="Question" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
          {form.options.map((option, index) => (
            <input key={index} placeholder={`Option ${index + 1}`} value={option} onChange={(e) => setForm({ ...form, options: form.options.map((item, itemIndex) => itemIndex === index ? e.target.value : item) })} required />
          ))}
          <div className="form-row">
            <select value={form.correct_option} onChange={(e) => setForm({ ...form, correct_option: e.target.value })}>
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select>
            <input type="number" min="1" max="5" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} />
          </div>
          <div className="form-row">
            <input placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
            <input placeholder="Subtopic" value={form.subtopic} onChange={(e) => setForm({ ...form, subtopic: e.target.value })} />
          </div>
          <textarea placeholder="Explanation" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} required />
          <button className="primary" type="submit"><Plus size={18} />Add Question</button>
        </form>
        <div className="panel">
          <h2>Question Bank</h2>
          <div className="question-list">
            {questions.map((question) => (
              <div className="question-row" key={question.id}>
                <strong>{question.topic}</strong>
                <span>{question.text}</span>
                <em>Level {question.difficulty}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="panel">
        <h2>Student Clusters</h2>
        <div className="cluster-list">
          {analytics?.clusters?.length ? analytics.clusters.map((item) => <span key={item.user_id}>Student {item.user_id}: {item.cluster}</span>) : <span>No cluster data yet</span>}
        </div>
      </section>
    </div>
  )
}

