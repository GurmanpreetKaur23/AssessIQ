export default function QuestionCard({ question, onAnswer }) {
  return (
    <div className="card">
      <h3>{question.prompt}</h3>
      <div className="options">
        {question.options.map((opt, i) => (
          <button className="btn option-btn" key={i} onClick={() => onAnswer(opt)}>
            {opt}
          </button>
        ))}
      </div>
      <div className="meta-row">
        <span>Topic: {question.topic}</span>
        <span>Difficulty: {question.difficulty}</span>
      </div>
    </div>
  )
}