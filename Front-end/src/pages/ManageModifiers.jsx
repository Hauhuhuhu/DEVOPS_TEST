import ModifierGroupForm from "../features/Modifiers/ModifierGroupForm";
import ModifierGroupList from "../features/Modifiers/ModifierGroupList";

function ManageModifiers() {
  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      <div className="w-96 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-y-auto">
        <ModifierGroupForm />
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <ModifierGroupList />
      </div>
    </div>
  );
}

export default ManageModifiers;
