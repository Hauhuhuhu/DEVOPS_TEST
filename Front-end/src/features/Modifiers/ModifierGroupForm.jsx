import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateModifierGroup } from "./useCreateModifierGroup";
import Spinner from "../../ui/Spinner";
import { SlidersHorizontal, PlusCircle, Trash2 } from "lucide-react";

function ModifierGroupForm() {
  const { isCreating, createModifierGroup } = useCreateModifierGroup();
  const {
    register,
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      minSelections: 0,
      maxSelections: 1,
      modifiers: [{ name: "", priceAdjustment: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "modifiers",
  });

  const onSubmit = (data) => {
    const validModifiers = (data.modifiers || [])
      .filter((m) => m.name && m.name.trim() !== "")
      .map((m) => ({
        name: m.name.trim(),
        priceAdjustment: parseFloat(m.priceAdjustment) || 0,
      }));

    if (validModifiers.length === 0) {
      toast.error("Please add at least one valid modifier option");
      return;
    }

    const payload = {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : "",
      minSelections: parseInt(data.minSelections, 10) || 0,
      maxSelections: parseInt(data.maxSelections, 10) || 1,
      modifiers: validModifiers,
    };

    createModifierGroup(payload, {
      onSuccess: () => {
        reset({
          name: "",
          description: "",
          minSelections: 0,
          maxSelections: 1,
          modifiers: [{ name: "", priceAdjustment: 0 }],
        });
      },
    });
  };

  const onError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError) toast.error(firstError.message);
  };

  return (
    <div>
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <SlidersHorizontal size={18} />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Add Modifier Group</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-slate-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            id="groupName"
            placeholder="e.g., Sugar Level, Toppings"
            {...register("name", { required: "Modifier group name is required" })}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="groupDesc" className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="groupDesc"
            placeholder="e.g., Choose your preferred sweetness"
            {...register("description")}
            disabled={isCreating}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="minSel" className="block text-sm font-medium text-slate-700 mb-1">
              Min Selections
            </label>
            <input
              type="number"
              id="minSel"
              min={0}
              {...register("minSelections")}
              disabled={isCreating}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="maxSel" className="block text-sm font-medium text-slate-700 mb-1">
              Max Selections
            </label>
            <input
              type="number"
              id="maxSel"
              min={1}
              {...register("maxSelections")}
              disabled={isCreating}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-800">
              Modifier Options *
            </label>
            <button
              type="button"
              onClick={() => append({ name: "", priceAdjustment: 0 })}
              disabled={isCreating}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              <PlusCircle size={14} /> Add Option
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Option (e.g. Boba)"
                  {...register(`modifiers.${index}.name`, {
                    required: "Option name is required",
                  })}
                  disabled={isCreating}
                  className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price (+VND)"
                  min={0}
                  {...register(`modifiers.${index}.priceAdjustment`)}
                  disabled={isCreating}
                  className="w-28 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (fields.length <= 1) {
                      toast.error("At least one option is required");
                      return;
                    }
                    remove(index);
                  }}
                  disabled={isCreating || fields.length === 1}
                  title="Remove option"
                  className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer mt-2"
        >
          {isCreating ? <Spinner className="text-white" /> : "Save Modifier Group"}
        </button>
      </form>
    </div>
  );
}

export default ModifierGroupForm;
