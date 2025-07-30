import Link from 'next/link'
import React from 'react'

function Login() {
  return (
    <div>
    <Link href={"/auth/register"}>Register</Link>
    <Link href={"/"}>Home</Link>
    </div>
  )
}

export default Login