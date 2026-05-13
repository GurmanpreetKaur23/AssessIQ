import React, { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BrainCircuit, Gauge, Target, Timer } from 'lucide-react'
import API from '../api.js'

export default function Analytics({ onBack }) {
  const [data, setData] = useState(null)
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const analytics = await API.get('/analytics/me')
    setData(analytics.data)
    const avgDifficulty = analytics.data.topic_stats.length
      ? analytics.data.topic_stats.reduce((sum, item) => sum + Math.max(1, Math.round(item.accuracy * 5)), 0) /
        analytics.data.topic_stats.length
      : 2
    const predicted = await API.post('/ml/predict-performance', {
      accuracy: analytics.data.accuracy,
      avg_time: analytics.data.avg_time,
      avg_difficulty: avgDifficulty,
      answer_changes: analytics.data.behavior.answer_changes,
      tab_switches: analytics.data.behavior.tab_switches,
    })
    setPrediction(predicted.data)
  }

  const progress = useMemo(() => {
    if (!data) return []
    return data.topic_stats.map((item, index) => ({
      name: item.topic,
      score: Math.round(item.accuracy * 100),
      speed: Math.round(item.avg_time),
      test: index + 1,
    }))
  }, [data])

  if (!data) return <div className="page"><div className="loading">Loading analytics...</div></div>

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow">Behavioral dashboard</p><h1>Your learning pattern is now measurable.</h1></div>
        <button className="ghost link-button" onClick={onBack}>← Back</button>
      </header>
      <section className="metric-grid">
        <div className="metric"><Target /><span>Accuracy</span><strong>{Math.round(data.accuracy * 100)}%</strong></div>
        <div className="metric"><Timer /><span>Speed</span><strong>{Math.round(data.avg_time)}s</strong></div>
        <div className="metric"><Gauge /><span>Predicted Score</span><strong>{prediction?.predicted_score ?? '--'}</strong></div>
        <div className="metric"><BrainCircuit /><span>Pass Probability</span><strong>{prediction ? Math.round(prediction.pass_probability * 100) : '--'}%</strong></div>
      </section>
      <section className="analytics-grid">
        <div className="panel">
          <h2>Topic Strength</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#17335f" />
              <XAxis dataKey="name" stroke="#8bb8ff" />
              <YAxis stroke="#8bb8ff" />
              <Tooltip contentStyle={{ background: '#07111f', border: '1px solid #1e5eff', color: '#fff' }} />
              <Bar dataKey="score" fill="#2f7cff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <h2>Speed Pattern</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={progress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#17335f" />
              <XAxis dataKey="name" stroke="#8bb8ff" />
              <YAxis stroke="#8bb8ff" />
              <Tooltip contentStyle={{ background: '#07111f', border: '1px solid #1e5eff', color: '#fff' }} />
              <Line type="monotone" dataKey="speed" stroke="#00d4ff" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="insight-grid">
        <div className="panel">
          <h2>Behavioral Insights</h2>
          {data.insights.length
            ? data.insights.map((item) => <p key={item} className="insight">{item}</p>)
            : <p className="insight">Complete a test to generate stronger behavioral signals.</p>}
        </div>
        <div className="panel">
          <h2>Personalized Recommendations</h2>
          {data.recommendations.map((item) => <p key={item.message} className="insight">{item.message}</p>)}
        </div>
      </section>
    </div>
  )
}
