import { useState } from "react";
import { useLogin } from "./useLogin";
import Spinner from "../../ui/Spinner";

function LoginForm() {
  const [email, setEmail] = useState("hauthaut32@gmail.com");
  const [password, setPassword] = useState("123456");
  const { login, isLoading } = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    login(
      { email, password },
      {
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      },
    );
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="email" className="form-label text-muted">
          Email address
        </label>
        <input
          type="email"
          className="form-control"
          name="email"
          id="email"
          placeholder="Enter your email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="form-label text-muted">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          name="password"
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-dark btn-lg"
          disabled={isLoading}
        >
          {!isLoading ? "Log in" : <Spinner />}
        </button>
      </div>
    </form>
  );
}
export default LoginForm;
