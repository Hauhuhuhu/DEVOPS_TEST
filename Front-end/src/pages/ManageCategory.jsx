import CategoryForm from "../features/Category/CategoryForm";
import CategoryList from "../features/Category/CategoryList";

function ManageCategory() {
  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      <div className="w-96 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-y-auto">
        <CategoryForm />
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <CategoryList />
      </div>
    </div>
  );
}

export default ManageCategory;
