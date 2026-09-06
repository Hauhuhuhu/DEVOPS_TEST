import Spinner from "../../ui/Spinner";
import { useDeleteUser } from "./useDeleteUser";
import { Trash2, User } from "lucide-react";

function UserItem({ user }) {
  const { isDeleting, deleteUser } = useDeleteUser();

  return (
    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-sm">
          <User size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{user.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
        onClick={() => {
          if (window.confirm(`Delete user "${user.name}"?`)) {
            deleteUser(user.userId);
          }
        }}
        disabled={isDeleting}
        title="Delete user"
      >
        {isDeleting ? <Spinner size={16} /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}

export default UserItem;
