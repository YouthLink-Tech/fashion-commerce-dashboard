import { Button, Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import Image from 'next/image';
import React from 'react';
import toast from 'react-hot-toast';
import { RiDeleteBinLine } from 'react-icons/ri';
import { RxCheck, RxCross2 } from 'react-icons/rx';
import Swal from 'sweetalert2';

const SelectImage = ({ previousImages, setImage, isOpen, onOpen, onOpenChange, axiosSecure, refetch, setSizeError, tempImage, setTempImage, dbImageUrl }) => {

  const handleDeleteImage = async (imgUrl) => {

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete("/api/marketing-banner/delete", {
            data: { imageUrl: imgUrl },
          });
          if (res.data.success) {
            refetch();
            toast.custom((t) => (
              <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex items-center ring-1 ring-black ring-opacity-5`}
              >
                <div className="pl-6">
                  <RxCheck className="h-6 w-6 bg-green-500 text-white rounded-full" />
                </div>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="ml-3 flex-1">
                      <p className="text-base font-bold text-gray-900">
                        Image Removed!
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Your selected image has been successfully deleted.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center font-medium text-red-500 hover:text-text-700 focus:outline-none text-2xl"
                  >
                    <RxCross2 />
                  </button>
                </div>
              </div>
            ), {
              position: "bottom-right",
              duration: 5000
            })
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete this Payment Method. Please try again!');
        }
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => onOpen()}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
      >
        Select Existing
      </button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-gray-100 border-b">
                <h2 className="text-lg font-semibold">Select Marketing Banner</h2>
              </ModalHeader>

              <ModalBody className="modal-body-scroll">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                  {previousImages?.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`relative group border rounded-md overflow-hidden shadow-sm transition bg-white`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Previous image ${idx + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-[100px] object-contain"
                      />

                      {/* Delete Button */}
                      {imgUrl !== dbImageUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(imgUrl);
                          }}
                          title="Delete Image"
                          className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-100 transition z-10"
                        >
                          <RiDeleteBinLine className="text-red-500 hover:text-red-600" size={20} />
                        </button>
                      )}

                      {/* Selection Checkbox */}
                      <div className="absolute bottom-0 left-0 p-2 bg-white bg-opacity-80 w-full">
                        <Checkbox
                          size="sm"
                          isSelected={tempImage?.src === imgUrl}
                          onChange={(checked) => {
                            if (checked) {
                              setTempImage({ src: imgUrl, file: null });
                            } else {
                              setTempImage(null); // allow unselecting
                            }
                          }}
                        >
                          <span className="text-xs">Select this image</span>
                        </Checkbox>
                      </div>
                    </div>
                  ))}
                </div>
              </ModalBody>

              <ModalFooter className="border-t">
                <Button
                  type="button"
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    setTempImage(null); // reset selection only if modal was used
                    onClose();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className='bg-[#d4ffce] hover:bg-[#bdf6b4] text-neutral-700 font-semibold'
                  onPress={() => {
                    if (tempImage?.src) {
                      setImage(tempImage);
                      setSizeError("");
                    }
                    onClose();
                  }}
                >
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default SelectImage;