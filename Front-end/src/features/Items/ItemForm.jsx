import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateItem } from "./useCreateItem";
import Spinner from "../../ui/Spinner";
import { useCategories } from "../Category/useCategories";
import { useModifierGroups } from "../Modifiers/useModifierGroups";
import { PackagePlus, Image as ImageIcon, PlusCircle, Trash2, CheckSquare, Square, X } from "lucide-react";

const DEFAULT_PREVIEW = "https://placehold.co/60x60?text=Upload";

function VariantAttributes({ control, vIndex, register, disabled }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${vIndex}.attributes`,
  });

  return (
    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-slate-500">
          Attributes (JSON)
        </span>
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          onClick={() => append({ key: "", value: "" })}
          disabled={disabled}
        >
          + Add Attribute
        </button>
      </div>
      <div className="space-y-1.5">
        {fields.map((field, aIndex) => (
          <div key={field.id} className="flex gap-1.5 items-center">
            <input
              type="text"
              placeholder="Key (e.g. Size)"
              {...register(`variants.${vIndex}.attributes.${aIndex}.key`)}
              disabled={disabled}
              className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Value (e.g. M)"
              {...register(`variants.${vIndex}.attributes.${aIndex}.value`)}
              disabled={disabled}
              className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => remove(aIndex)}
              disabled={disabled}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
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
    <div>
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <PackagePlus size={18} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Add Item</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
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
                Click to upload image
              </span>
              <span className="text-[11px] text-slate-400">PNG, JPG up to 5MB</span>
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

        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-slate-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            id="itemName"
            placeholder="Enter item name"
            {...register("name", { required: "Item name is required" })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            {...register("categoryId", {
              required: "Category is required",
            })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

        <div>
          <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-700 mb-1">
            Item Description *
          </label>
          <textarea
            rows={2}
            id="itemDescription"
            placeholder="Enter item description"
            {...register("description", {
              required: "Item description is required",
            })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Physical Variants Management */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <label className="relative inline-flex items-center cursor-pointer mb-2">
            <input
              type="checkbox"
              id="hasVariantsSwitch"
              {...register("hasVariants")}
              disabled={isCreating}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2.5 text-xs font-semibold text-slate-800">
              Multiple Physical Variants (SKUs, Colors, Sizes)
            </span>
          </label>

          {!hasVariants ? (
            <div className="mt-2">
              <label htmlFor="price" className="block text-xs font-medium text-slate-700 mb-1">
                Price *
              </label>
              <input
                type="number"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="mt-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">
                  Configure Variants ({variantFields.length})
                </span>
                <button
                  type="button"
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
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  <PlusCircle size={14} /> Add Variant
                </button>
              </div>

              {variantFields.map((field, vIndex) => (
                <div
                  key={field.id}
                  className="border border-slate-200 rounded-lg p-3 bg-white shadow-xs"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      Variant #{vIndex + 1}
                    </span>
                    {variantFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(vIndex)}
                        disabled={isCreating}
                        title="Remove Variant"
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <input
                        type="text"
                        placeholder="SKU (e.g., TS-RED-M)"
                        {...register(`variants.${vIndex}.sku`)}
                        disabled={isCreating}
                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Base Price"
                        min={0}
                        {...register(`variants.${vIndex}.basePrice`)}
                        disabled={isCreating}
                        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

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

        {/* Modifier Groups Attachment */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Attached Modifier Groups (F&B Add-ons)
          </label>
          {modifierGroups?.length === 0 ? (
            <p className="text-xs text-slate-400">
              No modifier groups available. Create them in Manage Modifiers.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {modifierGroups?.map((group) => {
                const isChecked = selectedModifierGroupIds.includes(group.groupId);
                return (
                  <button
                    key={group.groupId}
                    type="button"
                    onClick={() => handleToggleModifierGroup(group.groupId)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isChecked
                        ? "bg-blue-50 border-blue-300 text-blue-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare size={14} className="text-blue-600" />
                    ) : (
                      <Square size={14} className="text-slate-400" />
                    )}
                    <span>{group.name} ({group.modifiers?.length || 0})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer mt-2"
        >
          {isCreating ? <Spinner className="text-white" /> : "Submit Item"}
        </button>
      </form>
    </div>
  );
}

export default ItemForm;
