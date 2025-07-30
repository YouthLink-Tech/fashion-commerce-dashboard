import NotificationLoading from "./NotificationLoading";

const NavbarLoading = () => (
  <div className="w-full bg-gray-50 flex justify-center items-center p-4 min-h-[60px]">
    <div className="px-8 flex items-center justify-between w-full">
      <div className="w-full"></div>
      <div className="flex items-center justify-end gap-4 w-full">
        <NotificationLoading />
        <NotificationLoading />
      </div>
    </div>
  </div>
);

export default NavbarLoading;
