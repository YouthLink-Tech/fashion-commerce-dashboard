import Image from "next/image";
import { FaEye } from "react-icons/fa";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";

export default function StoryGrid({
  ourStoryList,
  handleViewStoryModal,
  handleOpenEditStoryModal,
  handleDelete,
  isOurStoryPending,
}) {
  const skeletonCount = 8;

  // If loading, show skeleton cards
  if (isOurStoryPending) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-white rounded-xl shadow p-4 space-y-4"
          >
            <div className="h-36 w-full bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-300 rounded w-2/3" />
            <div className="flex justify-end gap-2">
              <div className="h-6 w-12 bg-gray-300 rounded-md" />
              <div className="h-6 w-12 bg-gray-300 rounded-md" />
              <div className="h-6 w-12 bg-gray-300 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // If not loading and no data
  if (!ourStoryList || ourStoryList.length === 0) {
    return (
      <div className="text-center pb-20 text-gray-500 font-medium pt-44">
        No stories found. Please add a new story to get started.
      </div>
    );
  }

  // If data is present
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {ourStoryList.map((story, index) => (
        <div
          key={index}
          className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
        >
          <Image
            src={story?.coverImgUrl}
            alt={`Story Image ${index + 1}`}
            width={350}
            height={350}
            className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
            <h4 className="text-white text-lg font-semibold drop-shadow-sm">
              {story?.departmentName || `Story ${index + 1}`}
            </h4>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleViewStoryModal(story)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
              >
                <FaEye size={14} /> View
              </button>
              <button
                onClick={() => handleOpenEditStoryModal(story?._id)}
                className="flex items-center gap-1 bg-white text-gray-700 px-3 py-1.5 text-xs rounded-md hover:bg-gray-200 transition"
              >
                <AiOutlineEdit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(story?._id)}
                className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 text-xs rounded-md hover:bg-red-200 transition"
              >
                <RiDeleteBinLine size={14} /> Delete
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};