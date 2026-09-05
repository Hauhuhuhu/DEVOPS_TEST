import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateItem } from "./useCreateItem";
import Spinner from "../../ui/Spinner";
import { useCategories } from "../Category/useCategories";
import { useModifierGroups } from "../Modifiers/useModifierGroups";

const DEFAULT_PREVIEW = "https://placehold.co/60x60?text=Upload";

function VariantAttributes({ control, vIndex, register, disabled }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${vIndex}.attributes`,
  });

  return (
    <div className="p-1 bg-light rounded">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
          Attributes (JSON)
        </span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0 text-decoration-none"
          style={{ fontSize: "0.75rem" }}
          onClick={() => append({ key: "", value: "" })}
          disabled={disabled}
        >
          + Add Attribute
        </button>
      </div>
      {fields.map((field, aIndex) => (
        <div key={field.id} className="d-flex gap-1 mb-1 align-items-center">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Key (e.g. Size)"
            {...register(`variants.${vIndex}.attributes.${aIndex}.key`)}
            style={{ fontSize: "0.8rem" }}
            disabled={disabled}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Value (e.g. M)"
            {...register(`variants.${vIndex}.attributes.${aIndex}.value`)}
            style={{ fontSize: "0.8rem" }}
            disabled={disabled}
          />
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm py-0 px-1"
            onClick={() => remove(aIndex)}
            disabled={disabled}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

function ItemForm() {
  const { isLoading: isCategoriesLoading, categories } = useCategories();
  const { modifierGroups } = useModifierGroups();
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);
  const { isCreating, createItem } = useCreateItem();

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      hasVariants: false,
      variants: [
        {
          sku: "",
          basePrice: "",
          attributes: [
            { key: "Color", value: "" },
            { key: "Size", value: "" },
          ],
        },
      ],
    },
  });

  const hasVariants = useWatch({ control, name: "hasVariants" });
  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState([]);

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    return () => {
      if (previewUrl !== DEFAULT_PREVIEW) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleToggleModifierGroup = (groupId) => {
    setSelectedModifierGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  function onSubmit(data) {
    const formData = new FormData();

    let itemVariants = null;
    if (data.hasVariants) {
      if (!data.variants || data.variants.length === 0) {
        toast.error("At least one variant is required when variants are enabled");
        return;
      }

      for (let i = 0; i < data.variants.length; i++) {
        const v = data.variants[i];
        if (!v.sku || !v.sku.trim()) {
          toast.error(`Variant #${i + 1} requires a SKU`);
          return;
        }
        if (!v.basePrice || parseFloat(v.basePrice) < 0) {
          toast.error(`Variant #${i + 1} requires a valid base price`);
          return;
        }
      }

      itemVariants = data.variants.map((v) => {
        const attributesMap = {};
        (v.attributes || []).forEach((attr) => {
          if (attr.key && attr.value && attr.key.trim() && attr.value.trim()) {
            attributesMap[attr.key.trim()] = attr.value.trim();
          }
        });
        return {
          sku: v.sku.trim(),
          basePrice: parseFloat(v.basePrice),
          attributes: attributesMap,
        };
      });
    }

    const itemRequest = {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : "",
      price: data.hasVariants
        ? parseFloat(data.variants[0].basePrice) || 0
        : parseFloat(data.price) || 0,
      categoryId: data.categoryId,
      variants: itemVariants,
      modifierGroupIds: selectedModifierGroupIds,
    };

    formData.append("item", JSON.stringify(itemRequest));

    const imageFile = data.imgUrl?.[0];
    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
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
        reset({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          hasVariants: false,
          variants: [
            {
              sku: "",
              basePrice: "",
              attributes: [
                { key: "Color", value: "" },
                { key: "Size", value: "" },
              ],
            },
          ],
        });
        setPreviewUrl(DEFAULT_PREVIEW);
        setSelectedModifierGroupIds([]);
      },
    });
  }

  function onError(errors) {
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
                  Item Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="itemName"
                  placeholder="Enter item name"
                  {...register("name", { required: "Item name is required" })}
                  disabled={isCreating}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  className="form-control"
                  id="category"
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  disabled={isCreating}
                >
                  <option value="">--Select category--</option>
                  {isCategoriesLoading ? (
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
                <label htmlFor="itemDescription" className="form-label">
                  Item Description *
                </label>
                <textarea
                  rows={2}
                  className="form-control"
                  id="itemDescription"
                  placeholder="Enter item description"
                  {...register("description", {
                    required: "Item description is required",
                  })}
                  disabled={isCreating}
                />
              </div>

              {/* Ticket 01: Physical Variants Management via RHF */}
              <div className="mb-3 p-2 rounded bg-light border">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hasVariantsSwitch"
                    {...register("hasVariants")}
                    disabled={isCreating}
                  />
                  <label
                    className="form-check-label fw-bold text-dark"
                    htmlFor="hasVariantsSwitch"
                  >
                    Multiple Physical Variants (SKUs, Colors, Sizes)
                  </label>
                </div>

                {!hasVariants ? (
                  <div>
                    <label htmlFor="price" className="form-label">
                      Price *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      min={0}
                      placeholder="10000"
                      {...register("price", {
                        required: !hasVariants ? "Price is required" : false,
                        min: {
                          value: 0,
                          message: "Price must be a positive number",
                        },
                      })}
                      disabled={isCreating}
                    />
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-semibold text-secondary">
                        Configure Variants ({variantFields.length})
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          appendVariant({
                            sku: "",
                            basePrice: "",
                            attributes: [
                              { key: "Color", value: "" },
                              { key: "Size", value: "" },
                            ],
                          })
                        }
                        disabled={isCreating}
                      >
                        <i className="bi bi-plus-circle me-1"></i> Add Variant
                      </button>
                    </div>

                    {variantFields.map((field, vIndex) => (
                      <div
                        key={field.id}
                        className="border rounded p-2 mb-2 bg-white shadow-sm"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-secondary">
                            Variant #{vIndex + 1}
                          </span>
                          {variantFields.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-1"
                              onClick={() => removeVariant(vIndex)}
                              disabled={isCreating}
                              title="Remove Variant"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>

                        <div className="row g-2 mb-2">
                          <div className="col-6">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="SKU (e.g., TS-RED-M)"
                              {...register(`variants.${vIndex}.sku`)}
                              disabled={isCreating}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Base Price"
                              min={0}
                              {...register(`variants.${vIndex}.basePrice`)}
                              disabled={isCreating}
                            />
                          </div>
                        </div>

                        {/* Nested Dynamic Attributes via useFieldArray */}
                        <VariantAttributes
                          control={control}
                          vIndex={vIndex}
                          register={register}
                          disabled={isCreating}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticket 02: Modifier Groups Attachment */}
              <div className="mb-3 p-2 rounded bg-light border">
                <label className="form-label fw-bold text-dark d-block mb-1">
                  Attached Modifier Groups (F&B Add-ons)
                </label>
                {modifierGroups?.length === 0 ? (
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    No modifier groups available. Create them in Manage
                    Modifiers.
                  </p>
                ) : (
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {modifierGroups?.map((group) => {
                      const isChecked = selectedModifierGroupIds.includes(
                        group.groupId
                      );
                      return (
                        <div
                          key={group.groupId}
                          className={`badge p-2 border cursor-pointer ${
                            isChecked
                              ? "bg-warning text-dark border-warning"
                              : "bg-white text-dark border-secondary"
                          }`}
                          onClick={() =>
                            handleToggleModifierGroup(group.groupId)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className={`bi ${
                              isChecked ? "bi-check-square-fill" : "bi-square"
                            } me-1`}
                          ></i>
                          {group.name} ({group.modifiers?.length || 0})
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100"
                disabled={isCreating}
              >
                {isCreating ? <Spinner /> : "Submit Item"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemForm;
