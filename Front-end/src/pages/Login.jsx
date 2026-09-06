import LoginForm from "../features/Auth/LoginForm";

function Login() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl mx-auto shadow-md mb-3">
            B
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to BillingApp</h1>
          <p className="text-sm text-slate-600 mt-1">
            Please enter your credentials to access your account
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;
