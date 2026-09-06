import ItemForm from "../features/Items/ItemForm";
import ItemList from "../features/Items/ItemList";

function ManageItems() {
  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      <div className="w-96 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-y-auto">
        <ItemForm />
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <ItemList />
      </div>
    </div>
  );
}

export default ManageItems;
