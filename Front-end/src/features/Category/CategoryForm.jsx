import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateCategory } from "./useCreateCategory";
import Spinner from "../../ui/Spinner";
import { FolderPlus, Image as ImageIcon } from "lucide-react";

const DEFAULT_PREVIEW = "https://placehold.co/60x60?text=Upload";

function CategoryForm() {
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
  const { isCreating, createCategory } = useCreateCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    return () => {
      if (previewUrl !== DEFAULT_PREVIEW) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function onSubmit(data) {
    const formData = new FormData();

    const categoryRequest = {
      name: data.name,
      description: data.description,
      bgColor: data.bgColor,
    };

    formData.append("category", JSON.stringify(categoryRequest));

    const imageFile = data.imgUrl?.[0];
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Dung lượng hình ảnh không được vượt quá 5MB");
        return;
      }
      formData.append("file", imageFile);
    } else {
      toast.error("Vui lòng chọn hình ảnh");
      return;
    }

    createCategory(formData, {
      onSuccess: () => {
        reset();
        setPreviewUrl(DEFAULT_PREVIEW);
      },
    });
  }

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message || "Vui lòng kiểm tra lại các trường bắt buộc");
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl !== DEFAULT_PREVIEW) {
        URL.revokeObjectURL(previewUrl);
      }
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <FolderPlus size={18} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Thêm danh mục</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-4">
        {/* Image Upload Area */}
        <div className="text-center">
          <label
            htmlFor="imgUrl"
            className={`block border-2 border-dashed rounded-xl p-3 text-center transition-colors ${
              isCreating
                ? "border-slate-200 opacity-60 cursor-not-allowed bg-slate-50"
                : "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer"
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              {previewUrl !== DEFAULT_PREVIEW ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-16 h-16 rounded-lg object-cover shadow-xs border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                  <ImageIcon size={24} />
                </div>
              )}
              <span className="text-xs font-medium text-slate-600 mt-2">
                Nhấn để tải hình ảnh lên
              </span>
              <span className="text-[11px] text-slate-400">PNG, JPG tối đa 5MB</span>
            </div>
          </label>
          <input
            type="file"
            id="imgUrl"
            hidden
            accept="image/*"
            disabled={isCreating}
            {...register("imgUrl", {
              onChange: handleImageChange,
            })}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Tên danh mục *
          </label>
          <input
            type="text"
            id="name"
            disabled={isCreating}
            placeholder="Nhập tên danh mục"
            {...register("name", {
              required: "Tên danh mục là bắt buộc",
            })}
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
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Mô tả danh mục *
          </label>
          <textarea
            rows={3}
            id="description"
            placeholder="Nhập mô tả danh mục"
            {...register("description", {
              required: "Mô tả danh mục là bắt buộc",
            })}
            disabled={isCreating}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              errors.description
                ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bgColor" className="block text-sm font-medium text-slate-700 mb-1">
            Màu nền *
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="bgColor"
              title="Chọn màu chủ đề"
              {...register("bgColor", {
                required: "Màu nền là bắt buộc",
              })}
              disabled={isCreating}
              className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs text-slate-500">Chọn màu nhấn cho nhãn</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isCreating ? <Spinner className="text-white" /> : "Lưu danh mục"}
        </button>
      </form>
    </div>
  );
}

export default CategoryForm;
