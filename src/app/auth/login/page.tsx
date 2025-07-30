import Link from 'next/link'
import React from 'react'

function Login() {
  return (
    <div>
      <h1 >LoginPage</h1> <br/>
    <Link href={"/auth/register"}>Register</Link><br/>
    <Link href={"/"}>Home</Link>
    </div>
  )
}

export default Login