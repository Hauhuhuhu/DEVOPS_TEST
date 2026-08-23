import { Outlet } from "react-router-dom";
import Menubar from "./Menubar";

function AppLayOut() {
  return (
    <>
      <Menubar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
export default AppLayOut;
