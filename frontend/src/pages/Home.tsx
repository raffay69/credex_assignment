import { useState } from 'react'
import AuditResults from './Results'
import AuditForm from './Form'
import { Toaster } from 'react-hot-toast'

function Home() {
  const [ state , setState] = useState("form")
  const [ data , setData ] = useState()

  return (
    <>
    <Toaster />
    {state === "form" ? <AuditForm setState={setState} setData={setData} /> : <AuditResults setState={setState} data={data}/> }
    </>
  )
}

export default Home
