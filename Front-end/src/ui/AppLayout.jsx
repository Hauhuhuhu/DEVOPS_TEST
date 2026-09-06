import { Outlet } from "react-router-dom";
import Menubar from "./Menubar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Menubar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
