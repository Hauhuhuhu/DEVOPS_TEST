import { useForm } from "react-hook-form";
import { useCreateUser } from "./useCreateUser";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import { UserPlus } from "lucide-react";

function UserForm() {
  const { isCreating, createUser } = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "ROLE_USER",
    },
  });

  function onSubmit(data) {
    const userRequest = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role || "ROLE_USER",
    };

    createUser(userRequest, {
      onSuccess: () => {
        reset({
          name: "",
          email: "",
          password: "",
          role: "ROLE_USER",
        });
      },
    });
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UserPlus size={18} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Add User</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-1">
            User Name *
          </label>
          <input
            type="text"
            id="userName"
            autoComplete="off"
            placeholder="Enter user name"
            {...register("name", {
              required: "User name is required",
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.name
                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="UserEmail" className="block text-sm font-medium text-slate-700 mb-1">
            User Email *
          </label>
          <input
            type="email"
            id="UserEmail"
            placeholder="example@example.com"
            {...register("email", {
              required: "User email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
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
          <label htmlFor="UserPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="UserPassword"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
            })}
            disabled={isCreating}
            autoComplete="current-password"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
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
          <label htmlFor="userRole" className="block text-sm font-medium text-slate-700 mb-1">
            Role *
          </label>
          <select
            id="userRole"
            {...register("role", {
              required: "Role is required",
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
              errors.role
                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          >
            <option value="ROLE_USER">Staff (ROLE_USER)</option>
            <option value="ROLE_ADMIN">Admin (ROLE_ADMIN)</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isCreating ? <Spinner className="text-white" /> : "Submit User"}
        </button>
      </form>
    </div>
  );
}

export default UserForm;
