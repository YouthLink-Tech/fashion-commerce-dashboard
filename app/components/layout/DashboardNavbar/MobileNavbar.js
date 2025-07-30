import { CgMenuLeft } from "react-icons/cg";
import AvatarDropdown from "./AvatarDropdown";
import Notifications from "../../navbar/Notifications";

const MobileNavbar = ({ isToggle, setIsToggle, session, status, existingUserData, handleLogout }) => (
  <div className="flex items-center justify-between px-4 py-3 xl:hidden">
    <button className="duration-300 p-2" onClick={() => setIsToggle(!isToggle)}>
      {!isToggle && <CgMenuLeft size={20} />}
    </button>
    <div className="flex items-center gap-6">
      {status === "authenticated" && <Notifications />}
      {status === "authenticated" &&
        <AvatarDropdown
          session={session}
          existingUserData={existingUserData}
          handleLogout={handleLogout}
        />
      }
    </div>
  </div>
);

export default MobileNavbar;
