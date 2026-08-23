import LoginForm from "../features/Auth/LoginForm";
function Login() {
  return (
    <div className="bg-light d-flex justify-content-center align-items-center vh-100 login-background">
      <div className="card shadow-lg w-100" style={{ maxWidth: "480px" }}>
        <div className="card-body">
          <div className="text-center">
            <h1 className="card-title text-center">Sign in</h1>
            <p className="card-text text-muted">
              Please enter your credentials to sign in
            </p>
          </div>
          <div className="mt-4">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
