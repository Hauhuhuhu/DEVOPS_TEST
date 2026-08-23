import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateItem } from "./useCreateItem";
import Spinner from "../../ui/Spinner";
import { useCategories } from "../Category/useCategories";

const DEFAULT_PREVIEW = "https://placehold.co/60x60?text=Upload";
function ItemForm() {
  const { isLoading, categories } = useCategories();
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
  const { isCreating, createItem } = useCreateItem();
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

    const ItemRequest = {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
    };

    formData.append("item", JSON.stringify(ItemRequest));

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
      toast.error("Image is required");
      return;
    }

    createItem(formData, {
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
    <div className="mx-2 mt-2 overflow-hidden overflow-x-hidden overflow-y-auto">
      <div className="row">
        <div className="card col-md-12 form-container">
          <div className="card-body">
            <h5 className="card-title">Add Item</h5>
            <form onSubmit={handleSubmit(onSubmit, onError)}>
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
                  name="imgUrl"
                  hidden
                  accept="image/*"
                  disabled={isCreating}
                  {...register("imgUrl", {
                    onChange: handleImageChange,
                  })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="itemName" className="form-label">
                  Item Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  id="itemName"
                  placeholder="Enter item name"
                  {...register("name", { required: "Item name is required" })}
                  disabled={isCreating}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  className="form-control"
                  name="categoryId"
                  id="category"
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  disabled={isCreating}
                >
                  <option value="">--Select category--</option>
                  {isLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories?.map((category, index) => (
                      <option key={index} value={category.categoryId}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  id="price"
                  min={0}
                  placeholder="10.000VND"
                  {...register("price", {
                    required: "Price is required",
                    min: {
                      value: 0,
                      message: "Price must be a positive number",
                    },
                  })}
                  disabled={isCreating}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="itemDescription" className="form-label">
                  Item Description
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  name="itemDescription"
                  id="itemDescription"
                  placeholder="Enter item description"
                  {...register("description", {
                    required: "Item description is required",
                  })}
                  disabled={isCreating}
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
export default ItemForm;
