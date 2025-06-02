import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const ExitConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1 bg-gray-200">Exit Without Saving?</ModalHeader>
            <ModalBody>
              <p className="py-2">Do you want to exit without saving your changes?</p>
            </ModalBody>
            <ModalFooter className="border">
              <Button color="danger" variant="light" onPress={onCloseModal}>
                No
              </Button>
              <Button color="primary" onPress={onConfirm}>
                Yes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExitConfirmationModal;