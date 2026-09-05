import ModifierGroupForm from "../features/Modifiers/ModifierGroupForm";
import ModifierGroupList from "../features/Modifiers/ModifierGroupList";

function ManageModifiers() {
  return (
    <div className="item-container">
      <div className="left-column">
        <ModifierGroupForm />
      </div>
      <div className="right-column">
        <ModifierGroupList />
      </div>
    </div>
  );
}

export default ManageModifiers;
