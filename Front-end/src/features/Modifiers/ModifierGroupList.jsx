import { useState } from "react";
import Spinner from "../../ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";
import { useModifierGroups } from "./useModifierGroups";
import { useDeleteModifierGroup } from "./useDeleteModifierGroup";

function ModifierGroupList() {
  const { modifierGroups, isLoading } = useModifierGroups();
  const { isDeleting, deleteModifierGroup } = useDeleteModifierGroup();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = modifierGroups?.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="category-list-container"
      style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}
    >
      <div className="row pe-2">
        <div className="input-group mb-3 block">
          <input
            type="text"
            placeholder="Search modifier groups..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="input-group-text bg-warning">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>

      <div className="row g-3 pe-2">
        {isLoading ? (
          <Spinner />
        ) : filteredGroups?.length === 0 ? (
          <div className="col-12 text-center text-muted py-4">
            No modifier groups found
          </div>
        ) : (
          filteredGroups?.map((group) => (
            <div key={group.groupId} className="col-12">
              <div className="card p-3 bg-dark text-white shadow-sm border-secondary">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1 text-warning fw-bold">{group.name}</h6>
                    {group.description && (
                      <p className="text-secondary small mb-2">
                        {group.description}
                      </p>
                    )}
                    <div className="mb-2">
                      <span className="badge bg-secondary me-2">
                        Min: {group.minSelections}
                      </span>
                      <span className="badge bg-secondary">
                        Max: {group.maxSelections}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete modifier group "${group.name}"?`
                        )
                      ) {
                        deleteModifierGroup(group.groupId);
                      }
                    }}
                    disabled={isDeleting}
                    title="Delete group"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

                <div className="mt-2 pt-2 border-top border-secondary">
                  <div className="text-muted small mb-1">Options:</div>
                  <div className="d-flex flex-wrap gap-2">
                    {group.modifiers?.map((mod) => (
                      <span
                        key={mod.modifierId}
                        className="badge bg-dark border border-warning text-light py-1 px-2"
                      >
                        {mod.name}
                        {mod.priceAdjustment > 0 && (
                          <span className="text-warning ms-1">
                            (+{formatCurrency(mod.priceAdjustment)})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ModifierGroupList;
