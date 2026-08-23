import { useForm } from "react-hook-form";
import { useCreateUser } from "./useCreateUser";
import toast from "react-hot-toast";
import Spinner from "../../ui/Spinner";

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
    // Rút gọn logic hiển thị lỗi bằng Object.values
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message);
  }
  return (
    <div className="mx-2 mt-2">
      <div className="row">
        <div className="card col-md-12 form-container">
          <div className="card-body">
            <h5 className="card-title">Add User</h5>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">
                  User Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  id="userName"
                  autoComplete="off"
                  placeholder="Enter user name"
                  {...register("name", {
                    required: "User name is required",
                  })}
                  disabled={isCreating}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="UserEmail" className="form-label">
                  User Email
                </label>
                <input
                  // type="email"
                  className="form-control"
                  name="email"
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
                />
              </div>
              <div className="mb-3">
                <label htmlFor="UserPassword" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  id="UserPassword"
                  placeholder="Enter password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  disabled={isCreating}
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-warning w-100"
                disabled={isCreating}
              >
                {isCreating ? <Spinner /> : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserForm;
