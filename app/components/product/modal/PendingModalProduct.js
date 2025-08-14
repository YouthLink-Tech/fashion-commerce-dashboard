import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const PendingModalProduct = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1 bg-gray-200">Mark as pending?</ModalHeader>
            <ModalBody>
              <p className="py-2">After making as pending you will be able edit it.</p>
            </ModalBody>
            <ModalFooter className="border">
              <Button color="danger" variant="light" onPress={onCloseModal}>
                Cancel
              </Button>
              <Button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700" onPress={() => { onConfirm(); onCloseModal(); }}>
                Mark as pending
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PendingModalProduct;
