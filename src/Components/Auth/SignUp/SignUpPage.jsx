// import { SignUp } from '@clerk/clerk-react'

import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className='flex items-center justify-center h-screen'>
      {/* <h1>Sign up route</h1> */}
      <SignUp />
    </div>
  )
}