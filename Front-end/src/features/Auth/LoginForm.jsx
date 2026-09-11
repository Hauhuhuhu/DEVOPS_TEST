import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLogin } from "./useLogin";
import Spinner from "../../ui/Spinner";

function LoginForm() {
  const { login, isLoading } = useLogin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data) {
    login(
      { email: data.email, password: data.password },
      {
        onSettled: () => {
          reset();
        },
      },
    );
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message || "Vui lòng kiểm tra lại các trường bắt buộc");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
          Địa chỉ email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Nhập email của bạn"
          autoComplete="username"
          disabled={isLoading}
          {...register("email", {
            required: "Email là bắt buộc",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Địa chỉ email không hợp lệ",
            },
          })}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:bg-slate-50 transition-colors ${
            errors.email
              ? "border-red-500 focus:ring-red-500 bg-red-50/10"
              : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          placeholder="Nhập mật khẩu của bạn"
          autoComplete="current-password"
          disabled={isLoading}
          {...register("password", {
            required: "Mật khẩu là bắt buộc",
          })}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:bg-slate-50 transition-colors ${
            errors.password
              ? "border-red-500 focus:ring-red-500 bg-red-50/10"
              : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? <Spinner className="text-white" /> : "Đăng nhập"}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
