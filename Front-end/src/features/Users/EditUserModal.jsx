import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { X, Edit3, Loader2, Shield, Key } from "lucide-react";
import { useUpdateUser } from "./useUpdateUser";

export default function EditUserModal({ isOpen, onClose, user }) {
  const { isUpdating, updateUser } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "ROLE_USER",
        password: "",
      });
    }
  }, [isOpen, user, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !isUpdating) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isUpdating, onClose]);

  if (!isOpen || !user) return null;

  const onSubmit = (data) => {
    const userRequest = {
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      password: data.password ? data.password.trim() : "",
    };

    updateUser(
      { userId: user.userId, userRequest },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUpdating) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Chỉnh sửa người dùng</h3>
              <p className="text-xs text-slate-500">Cập nhật thông tin tài khoản và phân quyền</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên người dùng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={isUpdating}
              placeholder="Nhập tên người dùng..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100"
              {...register("name", {
                required: "Tên người dùng không được để trống",
                minLength: { value: 2, message: "Tên tối thiểu 2 ký tự" },
              })}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email người dùng <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              disabled={isUpdating}
              placeholder="example@billing.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100"
              {...register("email", {
                required: "Email không được để trống",
                pattern: {
                  value: /^\S+@\S+\.\S+$/i,
                  message: "Địa chỉ email không hợp lệ",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                disabled={isUpdating}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100 appearance-none"
                {...register("role", {
                  required: "Vai trò là bắt buộc",
                })}
              >
                <option value="ROLE_USER">Nhân viên (ROLE_USER)</option>
                <option value="ROLE_ADMIN">Quản trị viên (ROLE_ADMIN)</option>
              </select>
              <Shield size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Mật khẩu mới
              </label>
              <span className="text-[11px] text-slate-400">Tùy chọn</span>
            </div>
            <div className="relative">
              <input
                type="password"
                disabled={isUpdating}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100"
                {...register("password", {
                  minLength: {
                    value: 6,
                    message: "Mật khẩu mới tối thiểu 6 ký tự nếu thay đổi",
                  },
                })}
              />
              <Key size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Để trống nếu muốn giữ nguyên mật khẩu hiện tại của người dùng.
            </p>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isUpdating && <Loader2 size={16} className="animate-spin" />}
              <span>{isUpdating ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
