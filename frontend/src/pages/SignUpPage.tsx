import React from 'react';
import SignupForm from '@/Components/SignUpForm';

const SignupPage: React.FC = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Create an account</h1>
      <SignupForm />
    </div>
  );
};

export default SignupPage;
