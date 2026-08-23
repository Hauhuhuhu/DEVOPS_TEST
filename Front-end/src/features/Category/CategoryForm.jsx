import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateCategory } from "./useCreateCategory";
import Spinner from "../../ui/Spinner";

// Tạo hằng số cho ảnh mặc định để dễ quản lý
const DEFAULT_PREVIEW = "https://placehold.co/60x60?text=Upload";

function CategoryForm() {
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
  const { isCreating, createCategory } = useCreateCategory();
  const { register, handleSubmit, reset } = useForm();

  // Dọn dẹp URL object để tránh memory leak khi component unmount
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

    // Lấy file ảnh trực tiếp từ data của react-hook-form
    const imageFile = data.imgUrl?.[0];
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should not exceed 5MB");
        return;
      }
      formData.append("file", imageFile);
    } else {
      toast.error("Vui lòng chọn hình ảnh");
      return;
    }

    createCategory(formData, {
      onSuccess: () => {
        reset(); // reset() của RHF giờ sẽ tự động xóa value của input file
        setPreviewUrl(DEFAULT_PREVIEW);
        // ĐÃ XÓA: logic fileInputRef.current.value = ""
      },
    });
  }

  function onError(errors) {
    // Rút gọn logic hiển thị lỗi bằng Object.values
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message);
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
    <div className="mx-2 overflow-hidden overflow-x-hidden overflow-y-auto">
      <div className="row">
        <div className="card col-md-12 form-container">
          <div className="card-body">
            <h5 className="card-title mb-3">Add Category</h5>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              {/* --- CẢI THIỆN: Label Upload Ảnh --- */}
              <div className="mb-2 text-center">
                <label
                  htmlFor="imgUrl"
                  className="form-label d-inline-block"
                  style={{ cursor: isCreating ? "not-allowed" : "pointer" }}
                >
                  <div
                    className="p-2 rounded"
                    style={{
                      border: "2px dashed #ccc",
                      backgroundColor: "#f8f9fa",
                      opacity: isCreating ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <img
                      src={previewUrl}
                      width={60}
                      height={60}
                      alt="preview"
                      className="img-thumbnail border-0 object-fit-cover"
                    />
                    <div
                      className="text-muted mt-2 fw-medium"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Click to upload image
                    </div>
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

              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  disabled={isCreating}
                  placeholder="Enter category name"
                  {...register("name", {
                    required: "Category name is required",
                  })}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  id="description"
                  placeholder="Enter category description"
                  {...register("description", {
                    required: "Category description is required",
                  })}
                  disabled={isCreating}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="bgColor" className="form-label">
                  Background Color
                </label>
                <div className="d-flex align-items-center">
                  <input
                    type="color"
                    id="bgColor"
                    className="form-control form-control-color me-2"
                    title="Choose your color"
                    {...register("bgColor", {
                      required: "Background color is required",
                    })}
                    disabled={isCreating}
                  />
                  <span className="text-muted small">Select a theme color</span>
                </div>
              </div>

              {/* --- CẢI THIỆN: Nút Submit Loading --- */}
              <button
                type="submit"
                className="btn btn-warning w-100 d-flex justify-content-center align-items-center gap-2"
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

export default CategoryForm;
