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
              <Button className="bg-neutral-950 hover:bg-neutral-800 text-white py-2 px-4 text-sm rounded-md cursor-pointer font-bold" onPress={() => { onConfirm(); onCloseModal(); }}>
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
