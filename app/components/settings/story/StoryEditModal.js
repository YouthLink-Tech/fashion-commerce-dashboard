import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import DOMPurify from "dompurify";
import FileUploadZone from "./FileUploadZone";
import CustomSwitch from '../../shared/switch/CustomSwitch';

const OurStoryEditor = dynamic(() => import('@/app/utils/Editor/OurStoryEditor'), { ssr: false });

const StoryEditModal = ({
  isEditOpen,
  setIsEditOpen,
  handleSubmit,
  onSubmit,
  register,
  control,
  errors,
  fields,
  append,
  remove,
  storyPublishDate,
  setStoryPublishDate,
  coverImgUrl,
  handleCoverImgChange,
  handleRemoveCoverImage,
  staffImgUrl,
  handleStaffImgChange,
  handleRemoveStaffImage,
  status,
  handleStatusChange,
  mediaUrls,
  handleMediaSelect,
  handleRemoveMedia,
  setMediaUrls,
  isUploading,
  isUploading2,
  isUploading3,
  sizeError1,
  sizeError2,
  requiredFileErrors,
  isLoading
}) => {

  const handleCancel = () => {
    setIsEditOpen(false);
  };

  return (
    <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size="2xl" scrollBehavior="inside">
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} size='2xl'>
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="bg-gray-200">
                <h2 className="text-lg font-semibold px-2">Edit Story</h2>
              </ModalHeader>

              <ModalBody className="modal-body-scroll">
                <div className="space-y-6 px-3 py-6">

                  <div className='flex flex-col gap-2 font-semibold'>
                    <label htmlFor='departmentName' className="flex justify-start font-semibold text-neutral-500 text-sm">Department Name <span className="text-red-600 pl-1">*</span></label>
                    <input id='departmentName' {...register("departmentName", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]" placeholder='Enter Department Name' type="text" />
                    {errors.departmentName?.type === "required" && (
                      <p className="text-red-600 text-left text-xs">Department Name is required</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor='uploadCoverImg' className="flex justify-start font-semibold text-neutral-500 text-sm">Upload Cover Image <span className="text-red-600 pl-1">*</span></label>
                    <FileUploadZone
                      inputId="image-upload-1"
                      description={
                        <>
                          Maximum file size is 10 MB
                          <br />
                          <span className="text-[11px] text-gray-500">
                            Required size: 450 (W) x 450 (H)
                          </span>
                        </>
                      }
                      accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
                      onFileSelect={handleCoverImgChange}
                      requiredError={sizeError1}
                      validateFile={(file) => {
                        if (!file.type.startsWith("image/")) {
                          return "Only image files are allowed in this field.";
                        }
                        return null; // no error
                      }}
                      previewUrl={coverImgUrl}
                      onRemove={handleRemoveCoverImage}
                      isUploading={isUploading}
                    />
                  </div>

                  <div className="flex flex-col gap-2 font-semibold pt-4">
                    <label htmlFor='workSummary' className="flex justify-start font-semibold text-neutral-500 text-sm">Work Summary <span className="text-red-600 pl-1">*</span></label>
                    <textarea
                      {...register("workSummary", {
                        required: "Work Summary is required.",
                        minLength: {
                          value: 20,
                          message: "Work Summary must have at least 20 characters.",
                        },
                      })}
                      rows={5}
                      placeholder="Provide a Work Summary"
                      className="w-full resize-none rounded-lg border-2 border-[#ededed] px-3 py-3 text-xs text-neutral-700 outline-none transition-[border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[#F4D3BA] md:text-sm"
                    ></textarea>
                    {errors.workSummary && (
                      <p className="text-xs font-semibold text-red-500">
                        {errors.workSummary.message}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2 font-semibold'>
                    <label htmlFor='staffName' className="flex justify-start font-semibold text-neutral-500 text-sm">Staff Name <span className="text-red-600 pl-1">*</span></label>
                    <input id='staffName' {...register("staffName", { required: true })} className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]" placeholder='Enter Staff Name' type="text" />
                    {errors.staffName?.type === "required" && (
                      <p className="text-red-600 text-left text-xs">Staff Name is required</p>
                    )}
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor='image-upload-2' className="flex justify-start font-semibold text-neutral-500 text-sm">Upload Staff Image <span className="text-red-600 pl-1">*</span></label>
                    <FileUploadZone
                      inputId="image-upload-2"
                      description={
                        <>
                          Maximum file size is 10 MB
                          <br />
                          <span className="text-[11px] text-gray-500">
                            Required size: 385 (W) x 1100 (H)
                          </span>
                          <p className="text-[11px] text-amber-600 font-semibold pt-1">Transparent background</p>
                        </>
                      }
                      accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
                      onFileSelect={handleStaffImgChange}
                      requiredError={sizeError2}
                      validateFile={(file) => {
                        if (!file.type.startsWith("image/")) {
                          return "Only image files are allowed in this field.";
                        }
                        return null; // no error
                      }}
                      previewUrl={staffImgUrl}
                      onRemove={handleRemoveStaffImage}
                      isUploading={isUploading2}
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <label htmlFor='storyPublishDate' className="flex justify-start font-semibold text-neutral-500 text-sm">Story Publish Date <span className="text-red-600 pl-1">*</span></label>
                    <input
                      type="date"
                      id="storyPublishDate"
                      {...register("storyPublishDate", { required: true })}
                      value={storyPublishDate}
                      onChange={(e) => setStoryPublishDate(e.target.value)} // Update state with the input value
                      className="w-full p-3 border rounded-md border-gray-300 outline-none focus:border-[#D2016E] transition-colors duration-1000"
                    />
                    {errors.storyPublishDate && (
                      <p className='text-red-600 text-left text-xs font-semibold'>Please select story publish date.</p>
                    )}

                  </div>

                  <div className="flex flex-col gap-3 py-2">
                    <label htmlFor='status' className="flex justify-start font-semibold text-neutral-500 text-sm">Status:</label>
                    <div className='flex items-center gap-3'>
                      <CustomSwitch checked={status} onChange={handleStatusChange} />
                      <span className="text-sm text-gray-500">{status ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="relative border p-4 rounded-lg shadow-sm space-y-4">

                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            remove(index);
                            setMediaUrls(prev => prev.filter((_, i) => i !== index)); // remove media URL at index
                          }}
                          className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}

                      {/* Upload Media Content */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`media-upload-${index}`} className="flex justify-start font-semibold text-neutral-500 text-sm">
                          Upload Media Content
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <FileUploadZone
                          inputId={`media-upload-${index}`}
                          description={
                            <>
                              Maximum file size is 50 MB
                              <br />
                              <span className="text-[11px] text-gray-500">
                                Required size: 640 (W) x 360 (H)
                              </span>
                            </>
                          }
                          accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4']}
                          onFileSelect={(file) => handleMediaSelect(index, file)}
                          requiredError={requiredFileErrors[index]}
                          previewUrl={[mediaUrls[index]]}
                          onRemove={() => handleRemoveMedia(index)}
                          isUploading={isUploading3}
                        />
                      </div>

                      {/* Hashtag Input */}
                      <div className="flex flex-col gap-2 font-semibold">
                        <label htmlFor={`items.${index}.hashtag`} className="flex justify-start font-semibold text-neutral-500 text-sm">
                          Hashtag
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <input
                          id={`items.${index}.hashtag`}
                          {...register(`items.${index}.hashtag`, { required: true })}
                          className="h-11 w-full rounded-lg border-2 border-[#ededed] px-3 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#F4D3BA] focus:bg-white md:text-[13px]"
                          placeholder="Enter Hashtag"
                          type="text"
                        />
                        {errors?.items?.[index]?.hashtag?.type === 'required' && (
                          <p className="text-red-600 text-left text-xs font-semibold">Hashtag is required</p>
                        )}
                      </div>

                      {/* Quote Input */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`items.${index}.quote`} className="flex justify-start font-semibold text-neutral-500 text-sm">
                          Quote
                          <span className="text-red-600 pl-1">*</span>
                        </label>
                        <Controller
                          name={`items.${index}.quote`}
                          control={control}
                          defaultValue=""
                          rules={{
                            validate: (value) => {
                              const strippedText = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
                              if (!strippedText) return "Quote is required.";
                              if (strippedText.length < 10) return "Quote must be at least 10 characters.";
                              return true;
                            },
                          }}
                          render={({ field }) => (
                            <OurStoryEditor
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          )}
                        />
                        {errors?.items?.[index]?.quote && (
                          <p className="text-red-600 text-left text-xs font-semibold">
                            {errors.items[index].quote.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                </div>

              </ModalBody>

              <ModalFooter className='flex justify-between items-center border'>
                <button type='button'
                  onClick={() => {
                    append({ quote: "", hashtag: "" });
                    setMediaUrls(prev => [...prev, null]);
                  }}
                  className="w-fit rounded-lg bg-[#d4ffce] hover:bg-[#bdf6b4] px-3 py-2 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 md:text-sm relative z-[1] flex items-center justify-center gap-x-3 ease-in-out"
                >
                  <FaPlus /> Add Media Content
                </button>
                <div className='flex gap-4 items-center'>
                  <Button
                    type="button"
                    onPress={handleCancel}
                    color="danger"
                    variant="light"
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={isUploading}
                    className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#ffddc2] px-[15px] py-2.5 transition-[background-color] duration-300 ease-in-out hover:bg-[#fbcfb0] font-bold text-[14px] text-neutral-700"
                  >
                    {isLoading ? 'Uploading...' : 'Upload'}
                  </Button>

                </div>
              </ModalFooter>

            </form>
          )}
        </ModalContent>
      </Modal>
    </Modal>
  );
};

export default StoryEditModal;
