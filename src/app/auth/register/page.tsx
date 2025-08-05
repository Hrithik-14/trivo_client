import Link from 'next/link'
import React from 'react'

function Register() {
  return (
    <div>
      <h1>Register</h1><br/>
    <Link href={"/auth/login"}>Login</Link><br/>
    <Link href={"/"}>Home</Link>
    </div>
  )
}

export default Register