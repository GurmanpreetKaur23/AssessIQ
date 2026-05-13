import React from 'react'

export default function Results({ data, onBack, onRetake }) {
  if (!data) return null

  const passed = data.percentage >= 40

  return (
    <div className="card">
      <h2>Exam Results</h2>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: passed ? '#22c55e' : '#ef4444' }}>
          {data.percentage}%
        </div>
        <p style={{ color: passed ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
          {passed ? '✓ Passed' : '✗ Failed'}
        </p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <tbody>
          <tr><td><strong>Score</strong></td><td>{data.score} / {data.totalMarks}</td></tr>
          <tr><td><strong>Percentage</strong></td><td>{data.percentage}%</td></tr>
          <tr><td><strong>Time Taken</strong></td><td>{Math.floor((data.timeTaken || 0) / 60)}m {(data.timeTaken || 0) % 60}s</td></tr>
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="primary" onClick={onRetake}>Take Another Test</button>
        <button className="ghost link-button" onClick={onBack}>← Dashboard</button>
      </div>
    </div>
  )
}
