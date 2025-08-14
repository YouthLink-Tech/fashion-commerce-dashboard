import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const ExitConfirmationModalProduct = ({ isOpen, onClose, onConfirm, message, heading }) => {
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
            <ModalHeader className="flex flex-col gap-1 bg-gray-200">Mark as {heading}?</ModalHeader>
            <ModalBody>
              <p className="py-2">{message}</p>
            </ModalBody>
            <ModalFooter className="border">
              <Button color="danger" variant="light" onPress={onCloseModal}>
                Cancel
              </Button>
              <Button className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700" onPress={() => { onConfirm(); onCloseModal(); }}>
                Mark as {heading}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExitConfirmationModalProduct;
