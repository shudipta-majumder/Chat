import Conversations from "./Conversations";
import AllUsers from "./AllUsers";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import useMediaQuery from "../../hooks/useMediaquery";
import { useState } from "react";

const Sidebar = () => {
  const underSM = useMediaQuery("(max-width: 640px)");
  const [activeComponent, setActiveComponent] = useState("conversations");
  return (
    <div className="border-r border-slate-500 p-4 flex flex-col">
      {underSM ? "" : <SearchInput />}
      <div className="divider px-3"></div>

      <div className="button-group mb-4">
        <button
          className={`btn ${
            activeComponent === "conversations" ? "btn-active" : ""
          }`}
          onClick={() => setActiveComponent("conversations")}
        >
          My Messages
        </button>
        <button
          className={`btn ${
            activeComponent === "allUsers" ? "btn-active" : ""
          }`}
          onClick={() => setActiveComponent("allUsers")}
        >
          All Friends
        </button>
      </div>

      {activeComponent === "conversations" ? <Conversations /> : <AllUsers />}
      <LogoutButton />
    </div>
  );
};
export default Sidebar;

// STARTER CODE FOR THIS FILE
// import Conversations from "./Conversations";
// import LogoutButton from "./LogoutButton";
// import SearchInput from "./SearchInput";

// const Sidebar = () => {
// 	return (
// 		<div className='border-r border-slate-500 p-4 flex flex-col'>
// 			<SearchInput />
// 			<div className='divider px-3'></div>
// 			<Conversations />
// 			<LogoutButton />
// 		</div>
// 	);
// };
// export default Sidebar;
