import Conversations from "./Conversations";
import AllUsers from "./AllUsers";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import useMediaQuery from "../../hooks/useMediaquery";
import { useState } from "react";
import { FaEnvelope, FaUserFriends } from "react-icons/fa";

const Sidebar = () => {
  const underSM = useMediaQuery("(max-width: 640px)");
  const [activeComponent, setActiveComponent] = useState("conversations");
  return (
    <div className="border-r border-slate-500 p-4 flex flex-col">
      {underSM ? "" : <SearchInput />}
      <div className="divider px-3"></div>

      <div className="button-group mb-2 flex justify-center gap-4">
        <button
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            activeComponent === "conversations"
              ? "bg-purple-600 text-white"
              : "bg-purple-200 text-purple-600 hover:bg-purple-300"
          }`}
          onClick={() => setActiveComponent("conversations")}
        >
          {underSM ? <FaEnvelope /> : "My Messages"}
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            activeComponent === "allUsers"
              ? "bg-purple-600 text-white"
              : "bg-purple-200 text-purple-600 hover:bg-purple-300"
          }`}
          onClick={() => setActiveComponent("allUsers")}
        >
          {underSM ? <FaUserFriends /> : "All Friends"}
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
