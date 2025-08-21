
import Notifications from "../../navbar/Notifications";
import AvatarDropdown from "./AvatarDropdown";

const DesktopNavbar = ({ session, status, existingUserData, handleLogout }) => (
  <div className="max-w-screen-2xl xl:ml-[262px] mx-auto hidden xl:flex items-center justify-between px-4 pt-2">
    <div></div>
    <div className="flex items-center gap-6 rounded-md p-2">
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

export default DesktopNavbar;
