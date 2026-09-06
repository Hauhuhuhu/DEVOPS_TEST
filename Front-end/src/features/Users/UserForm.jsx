import { useForm } from "react-hook-form";
import { useCreateUser } from "./useCreateUser";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";
import { UserPlus } from "lucide-react";

function UserForm() {
  const { isCreating, createUser } = useCreateUser();
  const { register, handleSubmit, reset } = useForm();

  function onSubmit(data) {
    const userRequest = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "ROLE_USER",
    };

    createUser(userRequest, {
      onSuccess: () => {
        reset();
      },
    });
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message);
  }

  return (
    <div>
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <UserPlus size={18} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Add User</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
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
