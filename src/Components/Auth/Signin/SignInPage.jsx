// import { SignUp, SignIn } from '@clerk/clerk-react';
// import React, { useState } from 'react';

// function SignIn1() {
//   const [hasAccount, setHasAccount] = useState(true);

//   return (
//     <div className='overflow-hidden'>
//       <div className='flex items-center justify-center h-screen '>
//         {hasAccount ? <SignIn /> : <SignUp />}
//       </div>
//       <div className='flex items-center justify-center h-screen '>
//         <button onClick={() => setHasAccount(!hasAccount)}>
//           {hasAccount ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default SignIn1;



import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}