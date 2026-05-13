import { useState } from 'react'
import AuditResults from './Results'
import AuditForm from './Form'

function Home() {
  const [ state , setState] = useState("form")
  const [ data , setData ] = useState()

  return (
    <>
    {state === "form" ? <AuditForm setState={setState} setData={setData} /> :  <AuditResults data={data!} setState={setState}/> }
    </>
  )
}

export default Home
