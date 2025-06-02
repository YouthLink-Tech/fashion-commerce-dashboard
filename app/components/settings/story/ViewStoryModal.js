// components/ViewStoryModal.js
import Image from "next/image";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";

export default function ViewStoryModal({ isOpen, onClose, selectedStory }) {
  if (!selectedStory) return null;

  return (
    <Modal className="mx-4 lg:mx-0" isOpen={isOpen} onOpenChange={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="bg-gray-200">
          <h2 className="text-lg font-semibold px-2">View Story</h2>
        </ModalHeader>

        <ModalBody className="modal-body-scroll">
          <div className="p-4 space-y-4">
            {/* Cover Image */}
            <div className="w-4/5 mx-auto">
              <Image
                src={selectedStory?.coverImgUrl}
                alt="Cover"
                className="w-full h-64 object-cover rounded-xl shadow-md"
                height={3000}
                width={2000}
              />
            </div>

            {/* Department & Date */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{selectedStory?.departmentName}</h2>
              <span className="text-sm text-gray-500">
                {new Date(selectedStory?.storyPublishDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Work Summary */}
            <p className="text-gray-700">{selectedStory?.workSummary}</p>

            {/* Staff Info */}
            <div className="flex items-center gap-4 mt-4">
              <Image
                src={selectedStory?.staff?.staffImgUrl}
                alt={selectedStory?.staff?.staffName}
                className="size-16 p-1 rounded-full object-cover border"
                height={3000}
                width={2000}
              />
              <div>
                <p className="text-sm text-gray-800 font-medium">{selectedStory?.staff?.staffName}</p>
                <p className="text-xs text-gray-500">Team Member</p>
              </div>
            </div>

            {/* Contents */}
            {selectedStory?.contents?.map((content, index) => {
              const isVideo = content.mediaSrc?.match(/\.(mp4|webm|ogg)$/i);

              return (
                <div key={index} className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-600 font-semibold">{content.hashtag}</p>

                  <div
                    className="prose max-w-none text-gray-700 mt-2"
                    dangerouslySetInnerHTML={{ __html: content.quote }}
                  />

                  {content.mediaSrc && (
                    <div className="mt-3 w-full max-h-[400px] rounded-md overflow-hidden">
                      {isVideo ? (
                        <video
                          src={content.mediaSrc}
                          controls
                          className="w-full h-auto rounded-md shadow"
                        />
                      ) : (
                        <Image
                          src={content.mediaSrc}
                          alt={`Media ${index + 1}`}
                          className="w-full h-auto max-h-64 object-contain rounded-md"
                          height={3000}
                          width={2000}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end items-center border">
          <Button
            type="button"
            color="danger"
            variant="light"
            onPress={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}