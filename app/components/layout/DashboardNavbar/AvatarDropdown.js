import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Avatar, AvatarIcon } from "@nextui-org/react";
import { PiSignOutLight } from "react-icons/pi";
import { CiLock } from "react-icons/ci";
import Link from "next/link";

const AvatarDropdown = ({ session, handleLogout }) => (
  <Dropdown placement="bottom-end">
    <DropdownTrigger>
      <Avatar
        isBordered
        as="button"
        className="transition-transform"
        icon={<AvatarIcon />}
      />
    </DropdownTrigger>
    <DropdownMenu aria-label="Profile Actions" variant="flat">
      <DropdownItem isReadOnly showDivider key="profile" className="h-14 gap-2">
        <p className="font-semibold">Logged in as</p>
        <p className="font-semibold">{session?.user?.email}</p>
      </DropdownItem>
      {session && (
        <DropdownItem
          key="Update Password"
          textValue="Update Password"
          startContent={<CiLock />}
          className="relative"
        >
          Update Password
          <Link
            className="absolute inset-0"
            href="/password-change"
          ></Link>
        </DropdownItem>
      )}

      {session && (
        <DropdownItem
          startContent={<PiSignOutLight />}
          key="logout"
          textValue="logout"
          color="danger"
          onPress={handleLogout}
        >
          Log Out
        </DropdownItem>
      )}

    </DropdownMenu>
  </Dropdown>
);

export default AvatarDropdown;
