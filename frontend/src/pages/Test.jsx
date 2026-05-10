import React from 'react'
import { submitTest, predict } from '../api'
export default function TestPage({token,onResult}){
  const [answers,setAnswers]=React.useState(['','',''])
  const [time,setTime]=React.useState(0)
  const [start,setStart]=React.useState(null)
  React.useEffect(()=>{setStart(Date.now());const i=setInterval(()=>setTime(Math.floor((Date.now()-start||0)/1000)),1000);return ()=>clearInterval(i)},[start])
  function change(i,v){
    const a=[...answers];a[i]=v;setAnswers(a)
  }
  async function submit(){
    const res=await submitTest({test_id:1,answers,time_taken:time},token)
    const pred=await predict({past_score:res.score,time_taken:time,accuracy:res.accuracy})
    onResult({result:res,prediction:pred})
  }
  return (
    <div className="card">
      <h2>Take Test</h2>
      <p>Time: {time}s</p>
      {[0,1,2].map(i=>(
        <div key={i}>
          <p>Question {i+1}</p>
          <input value={answers[i]} onChange={e=>change(i,e.target.value)} />
        </div>
      ))}
      <button onClick={submit}>Submit</button>
    </div>
  )
}
