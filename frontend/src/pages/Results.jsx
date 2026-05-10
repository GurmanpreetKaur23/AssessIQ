import React from 'react'
export default function Results({data,goBack}){
  if(!data) return null
  return (
    <div className="card">
      <h2>Results</h2>
      <p>Actual score: {data.result.score}</p>
      <p>Predicted score: {data.prediction?.predicted_score}</p>
      <button onClick={goBack}>Back to test</button>
    </div>
  )
}
