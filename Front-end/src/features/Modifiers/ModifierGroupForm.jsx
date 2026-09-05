import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateModifierGroup } from "./useCreateModifierGroup";
import Spinner from "../../ui/Spinner";

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
    <div className="mx-2 mt-2 overflow-hidden overflow-x-hidden overflow-y-auto">
      <div className="card form-container">
        <div className="card-body">
          <h5 className="card-title mb-3">Add Modifier Group</h5>
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="mb-3">
              <label htmlFor="groupName" className="form-label">
                Group Name *
              </label>
              <input
                type="text"
                id="groupName"
                className="form-control"
                placeholder="e.g., Sugar Level, Toppings"
                {...register("name", { required: "Modifier group name is required" })}
                disabled={isCreating}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="groupDesc" className="form-label">
                Description
              </label>
              <input
                type="text"
                id="groupDesc"
                className="form-control"
                placeholder="e.g., Choose your preferred sweetness"
                {...register("description")}
                disabled={isCreating}
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label htmlFor="minSel" className="form-label">
                  Min Selections
                </label>
                <input
                  type="number"
                  id="minSel"
                  className="form-control"
                  min={0}
                  {...register("minSelections")}
                  disabled={isCreating}
                />
              </div>
              <div className="col-6">
                <label htmlFor="maxSel" className="form-label">
                  Max Selections
                </label>
                <input
                  type="number"
                  id="maxSel"
                  className="form-control"
                  min={1}
                  {...register("maxSelections")}
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0 fw-semibold">
                  Modifier Options *
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => append({ name: "", priceAdjustment: 0 })}
                  disabled={isCreating}
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Option
                </button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="row g-2 mb-2 align-items-center">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Option name (e.g. Boba)"
                      {...register(`modifiers.${index}.name`, {
                        required: "Option name is required",
                      })}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Price (+VND)"
                      min={0}
                      {...register(`modifiers.${index}.priceAdjustment`)}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="col-2 text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={() => {
                        if (fields.length <= 1) {
                          toast.error("At least one option is required");
                          return;
                        }
                        remove(index);
                      }}
                      disabled={isCreating || fields.length === 1}
                      title="Remove option"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100 mt-2"
              disabled={isCreating}
            >
              {isCreating ? <Spinner /> : "Save Modifier Group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModifierGroupForm;
