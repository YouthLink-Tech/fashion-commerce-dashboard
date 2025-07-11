import useAssignableUsers from '@/app/hooks/useAssignableUsers';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import NotificationLoading from '../shared/Loading/NotificationLoading';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { FaUserPlus } from "react-icons/fa6";

const AssignUser = ({ messageId, selectedUsers, setSelectedUsers }) => {

  const [assignableUsers, isAssignableUserPending] = useAssignableUsers();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const axiosSecure = useAxiosSecure();

  const handleAssign = async (user) => {
    const payload = {
      userId: user._id,
      assignedAt: new Date().toISOString(),
      isRead: false,
    };

    try {
      const res = await axiosSecure.patch(`/assign-customer-support-user/${messageId}`, payload);
      if (res.data.success) {
        setSelectedUsers(prev => [...prev, { ...payload, fullName: user.fullName }]);
      }
    } catch (error) {
      console.error("Assignment failed", error);
    }
  };

  const handleUnassignUser = async (user) => {
    try {
      const res = await axiosSecure.patch(`/unassign-customer-support-user/${messageId}`, {
        userId: user?.userId,
      });

      if (res.data.success) {
        setSelectedUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      }
    } catch (error) {
      console.error("Unassign failed", error);
    }
  }

  if (isAssignableUserPending) return <NotificationLoading />;

  return (
    <Dropdown isOpen={isDropdownOpen} className='p-0' offset={10} placement="bottom-end"
      onOpenChange={(open) => {
        setIsDropdownOpen(open);
      }}>
      <DropdownTrigger>
        <button className="text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 rounded-lg px-3 py-1.5 hover:text-blue-700">
          <FaUserPlus size={16} />Assign User
        </button>
      </DropdownTrigger>

      <DropdownMenu closeOnSelect={false} aria-label="Static Actions" variant="flat" className="p-0 md:w-[500px]">

        <DropdownItem textValue="Assigned Users Section" isReadOnly className='hover:!bg-white p-0'>
          {selectedUsers?.length > 0 &&
            <div className='p-3'>

              <h1 className='font-semibold text-neutral-500 px-4'>Assigned Users</h1>

              <div className='flex flex-col mt-2'>
                {selectedUsers?.map((user) => (
                  <div className="flex justify-between items-center px-4" key={user._id}>
                    <p className="font-medium text-neutral-700">{user.fullName}</p>
                    <span
                      className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                      onClick={() => handleUnassignUser(user)}
                    >
                      <RxCross2 size={20} />
                    </span>
                  </div>
                ))}

              </div>
            </div>
          }
        </DropdownItem>

        {assignableUsers?.some(user => !selectedUsers.find(u => u.userId === user._id)) && (
          <DropdownItem textValue="Available Users Section" isReadOnly className='hover:!bg-white p-0'>
            <div className='p-3'>
              <h1 className='font-semibold text-neutral-500 px-4'>Available Users</h1>
              <div className='flex flex-col mt-2'>
                {assignableUsers?.map((user) => {
                  const isAlreadyAssigned = selectedUsers.find((u) => u.userId === user._id);

                  if (isAlreadyAssigned) return null; // Hide if already assigned

                  return (
                    <div
                      key={user._id}
                      onClick={() => handleAssign(user)}
                      className="font-medium text-neutral-700 hover:bg-gray-100 px-4 py-2 cursor-pointer"
                    >
                      {user?.fullName}
                    </div>
                  );
                })}
              </div>
            </div>
          </DropdownItem>
        )}

      </DropdownMenu>

    </Dropdown>
  );
};

export default AssignUser;