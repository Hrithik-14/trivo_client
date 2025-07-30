import Link from 'next/link'
import React from 'react'

function Register() {
  return (
    <div>
    <Link href={"/auth/login"}>Login</Link>
    <Link href={"/"}>Home</Link>
    </div>
  )
}

export default Register