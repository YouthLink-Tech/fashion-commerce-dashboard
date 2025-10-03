"use client";
import arrowSvgImage from "/public/card-images/arrow.svg";
import arrivals1 from "/public/card-images/arrivals1.svg";
import arrivals2 from "/public/card-images/arrivals2.svg";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { Button, Checkbox, CheckboxGroup, DateRangePicker, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import CustomPagination from "@/app/components/shared/pagination/CustomPagination";
import PaginationSelect from "@/app/components/shared/pagination/PaginationSelect";
import { TbColumnInsertRight } from "react-icons/tb";
import Link from "next/link";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";
import TruncatedText from "@/app/components/finances/expenses/TruncateText";
import { IoMdClose } from "react-icons/io";
import { today, getLocalTimeZone } from "@internationalized/date";
import toast from "react-hot-toast";

const initialColumns = ['Expense Category', 'Sub-Category', 'Sub-Sub-Category', 'Amount', 'Date of Expense', 'Payment Method', 'Paid To', 'Notes', 'Invoice ID / Transaction ID', 'Attachment'];

const ExpenseEntries = () => {

  const { id } = useParams();
  const { data: session, status } = useSession();
  const axiosSecure = useAxiosSecure();
  const router = useRouter();
  const [expenseCategoryName, setExpenseCategoryName] = useState('');
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState(initialColumns);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "invoice" or "attachment"
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalError, setModalError] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchExpenseEntries = async () => {
      try {
        const { data } = await axiosSecure.get(`/expense-entries/${id}`);
        setExpenseCategoryName(data?.expenseCategoryName);
        setExpenseEntries(data?.expenseEntries);
      } catch (error) {
        // console.error(error);
        // toast.error("Failed to load payment method details.");
        router.push('/finances');
      }
    };

    fetchExpenseEntries();
  }, [id, axiosSecure, status, session, router]);

  useEffect(() => {
    const savedColumns = JSON.parse(localStorage.getItem('selectedColumnsExpenseEntries'));
    const savedOrder = JSON.parse(localStorage.getItem('columnOrderExpenseEntries'));

    if (savedColumns) {
      setSelectedColumns(savedColumns);
    } else {
      // Set to default if no saved columns exist
      setSelectedColumns(initialColumns);
    }

    if (savedOrder) {
      setColumnOrder(savedOrder);
    } else {
      // Set to default column order if no saved order exists
      setColumnOrder(initialColumns);
    }
  }, []);

  const handleColumnChange = (selected) => {
    setSelectedColumns(selected);
  };

  const handleSelectAll = () => {
    setSelectedColumns(initialColumns);
    setColumnOrder(initialColumns);
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSave = () => {
    localStorage.setItem('selectedColumnsExpenseEntries', JSON.stringify(selectedColumns));
    localStorage.setItem('columnOrderExpenseEntries', JSON.stringify(columnOrder));
    setColumnModalOpen(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columnOrder);
    const [draggedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, draggedColumn);

    setColumnOrder(reorderedColumns); // Update the column order both in modal and table
  };

  const handleItemsPerPageChange = (newValue) => {
    setItemsPerPage(newValue);
    setPage(0); // Reset to first page when changing items per page
  };

  // Convert date string (YYYY-MM-DD) to Date object
  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Handle YYYY-MM-DD format
    const parts = dateString.split("-");
    if (parts.length !== 3) {
      console.error("Invalid date format:", dateString);
      return null;
    }

    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    if (isNaN(date.getTime())) {
      console.error("Invalid date after parsing:", dateString);
      return null;
    }

    return date;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(""); // reset error
    setModalError(""); // reset error

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG, PNG, and PDF files are allowed.");
      e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB.");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setSelectedEntry((prev) => ({ ...prev, attachment: selectedFile })); // sync with modal entry
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file); // Append the file to FormData

      const response = await axiosSecure.post('/upload-single-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.data?.fileUrl) {
        return response.data.fileUrl; // Return the file URL or path from the response
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const { startDate, adjustedEndDate } = useMemo(() => {
    const start = selectedDateRange?.start
      ? new Date(
        selectedDateRange.start.year,
        selectedDateRange.start.month - 1,
        selectedDateRange.start.day
      )
      : null;

    const end = selectedDateRange?.end
      ? new Date(
        selectedDateRange.end.year,
        selectedDateRange.end.month - 1,
        selectedDateRange.end.day
      )
      : null;

    const adjustedEnd = end
      ? new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1)
      : null;

    return { startDate: start, adjustedEndDate: adjustedEnd };
  }, [selectedDateRange]);

  const currentDate = today(getLocalTimeZone());

  const handleReset = () => {
    setSelectedDateRange(null); // Reset the selected date range
  };

  const filteredEntries = expenseEntries?.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const isNumberQuery = !isNaN(query) && query.trim() !== '';

    const expenseDate = parseDate(entry.dateOfExpense);

    const isDateInRange =
      startDate && adjustedEndDate
        ? expenseDate && expenseDate >= startDate && expenseDate <= adjustedEndDate
        : true;

    // Check string fields
    const stringMatch =
      (entry.expenseCategory || '').toLowerCase().includes(query) ||
      (entry.subCategory || '').toLowerCase().includes(query) ||
      (entry.subSubCategory || '').toLowerCase().includes(query) ||
      (entry.paidTo || '').toLowerCase().includes(query) ||
      (entry.notes || '').toLowerCase().includes(query) ||
      (entry.invoiceId || '').toLowerCase().includes(query) ||
      (entry.paymentMethod || '').toLowerCase().includes(query);

    // Check numeric fields
    const numberMatch = isNumberQuery && entry.amount?.toString().includes(query);

    return (stringMatch || numberMatch) && isDateInRange;
  });

  const paginatedEntries = useMemo(() => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEntries?.slice(startIndex, endIndex);
  }, [filteredEntries, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries?.length / itemsPerPage);

  const handleDownload = (fileUrl) => {
    // Check if the file is an image
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);

    // Define the filename based on file type
    const filename = isImage
      ? 'downloaded-file.jpg'   // For images, set the extension as jpg
      : 'downloaded-file.pdf';  // For non-images, set as pdf

    // Trigger the download with the correct filename and extension
    saveAs(fileUrl, filename);
  };

  useEffect(() => {
    if (paginatedEntries?.length === 0) {
      setPage(0); // Reset to the first page if no data
    }
  }, [paginatedEntries]);

  return (
    <div className='relative w-full min-h-[calc(100vh-60px)] bg-gray-50 px-6'>

      <div
        style={{
          backgroundImage: `url(${arrivals1.src})`,
        }}
        className='absolute inset-0 z-0 hidden md:block bg-no-repeat left-[45%] lg:left-[60%] -top-[138px]'
      />
      <div
        style={{
          backgroundImage: `url(${arrivals2.src})`,
        }}
        className='absolute inset-0 z-0 bg-contain bg-center xl:-top-28 w-full bg-no-repeat'
      />
      <div
        style={{
          backgroundImage: `url(${arrowSvgImage.src})`,
        }}
        className='absolute inset-0 z-0 top-2 md:top-0 xl:top-10 bg-[length:60px_30px] md:bg-[length:100px_50px] left-[60%] lg:bg-[length:200px_100px] md:left-[38%] lg:left-[48%] xl:left-[29%] 2xl:left-[32%] bg-no-repeat'
      />

      <div className='relative'>

        <div className='flex flex-wrap md:flex-nowrap items-center justify-between py-2 md:py-5 gap-2 w-full'>

          {expenseCategoryName && (
            <h3 className="text-center md:text-start font-semibold text-lg md:text-xl lg:text-3xl text-neutral-700">
              {expenseCategoryName}
            </h3>
          )}

          <Link className='flex items-center gap-2 text-[10px] md:text-base' href="/finances"> <span className='border border-black rounded-full p-1 md:p-2 hover:scale-105 duration-300'><FaArrowLeft /></span> Go Back</Link>

        </div>

        <div className='flex flex-wrap lg:flex-nowrap justify-between items-center gap-6 w-full'>

          {/* Search Expense Entries Item */}
          <div className='flex-1 min-w-[300px] max-w-[550px]'>
            <li className="flex items-center relative group">
              <svg className="absolute left-4 fill-[#9e9ea7] w-4 h-4 icon" aria-hidden="true" viewBox="0 0 24 24">
                <g>
                  <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                </g>
              </svg>
              <input
                type="search"
                placeholder="Search expense entry details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm h-[35px] md:h-10 px-4 pl-[2.5rem] md:border-2 border-transparent rounded-lg outline-none bg-white transition-[border-color,background-color] font-semibold text-neutral-600 duration-300 ease-in-out focus:outline-none focus:border-[#F4D3BA] hover:shadow-none focus:bg-white focus:shadow-[0_0_0_4px_rgb(234,76,137/10%)] hover:outline-none hover:border-[#9F5216]/30 hover:bg-white hover:shadow-[#9F5216]/30 text-[12px] md:text-base shadow placeholder:text-neutral-400"
              />
            </li>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button variant="solid" color="danger" onClick={() => { setColumnModalOpen(true) }} className="relative z-[1] flex items-center gap-x-3 rounded-lg bg-[#d4ffce] px-[18px] py-3 transition-colors duration-300 ease-in-out hover:bg-[#bdf6b4] font-semibold text-[14px] text-neutral-700">
              Choose Columns <TbColumnInsertRight size={20} />
            </button>

            <div className='flex items-center gap-2'>
              <DateRangePicker
                label="Date of expense Duration"
                visibleMonths={1}
                onChange={(range) => setSelectedDateRange(range)} // Ensure range is an array
                value={selectedDateRange} // Ensure this matches the expected format
                maxValue={currentDate}
              />

              {selectedDateRange && selectedDateRange.start && selectedDateRange.end && (
                <button className="hover:text-red-500 font-bold text-white rounded-lg bg-red-600 hover:bg-white p-1" onClick={handleReset}>
                  <IoMdClose size={20} />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Table */}
        <div className="custom-max-h-orders overflow-x-auto custom-scrollbar relative drop-shadow rounded-lg mt-4">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr>
                {columnOrder.map((column) => selectedColumns.includes(column) && (
                  <th key={column} className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">{column}</th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEntries?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-80">
                    No expense entries found. Please adjust your filters or check back later.
                  </td>
                </tr>
              ) : (
                paginatedEntries?.map((entries, index) => {
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      {columnOrder.map(
                        (column) =>
                          selectedColumns.includes(column) && (
                            <>
                              {column === 'Expense Category' && (
                                <td key="Expense Category" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.expenseCategory || "--"}
                                </td>
                              )}
                              {column === 'Sub-Category' && (
                                <td key="Sub-Category" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.subCategory || "--"}
                                </td>
                              )}
                              {column === 'Sub-Sub-Category' && (
                                <td key="Sub-Sub-Category" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.subSubCategory || "--"}
                                </td>
                              )}
                              {column === 'Amount' && (
                                <td key="Amount" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  ৳ {entries?.amount?.toFixed(2) || 0}
                                </td>
                              )}
                              {column === 'Date of Expense' && (
                                <td key="Date of Expense" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.dateOfExpense || "--"}
                                </td>
                              )}
                              {column === 'Payment Method' && (
                                <td key="Payment Method" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.paymentMethod || "--"}
                                </td>
                              )}
                              {column === 'Paid To' && (
                                <td key="Paid To" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.paidTo || "--"}
                                </td>
                              )}
                              {column === 'Notes' && (
                                <td key="Notes" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.notes ? (
                                    <TruncatedText text={entries.notes} maxLength={30} />
                                  ) : (
                                    "--"
                                  )}
                                </td>
                              )}
                              {column === 'Invoice ID / Transaction ID' && (
                                <td key="Invoice ID / Transaction ID" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {
                                    entries?.invoiceId ?
                                      entries?.invoiceId :
                                      <button
                                        className="text-blue-600 hover:text-blue-800 underline"
                                        onClick={() => {
                                          setModalType("invoice");
                                          setSelectedEntry(entries);
                                          setOpenModal(true);
                                        }}
                                      >
                                        Add
                                      </button>
                                  }
                                </td>
                              )}
                              {column === 'Attachment' && (
                                <td key="Attachment" className="text-sm p-3 text-neutral-500 font-semibold text-center">
                                  {entries?.attachment ? (
                                    <div className='group relative'>
                                      <button
                                        onClick={() => handleDownload(entries.attachment)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <FaFileAlt size={20} />
                                      </button>
                                      <span className="absolute -top-14 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">Download</span>
                                    </div>
                                  ) : (
                                    <button
                                      className="text-blue-600 hover:text-blue-800 underline"
                                      onClick={() => {
                                        setModalType("attachment");
                                        setSelectedEntry(entries);
                                        setOpenModal(true);
                                      }}
                                    >
                                      Add
                                    </button>
                                  )}
                                </td>
                              )}
                            </>
                          )
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Button */}
        <div className="flex flex-col mt-2 md:flex-row gap-4 justify-center items-center relative">
          <CustomPagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
          <PaginationSelect
            options={[25, 50, 100]} // ✅ Pass available options
            value={itemsPerPage} // ✅ Selected value
            onChange={handleItemsPerPageChange} // ✅ Handle value change
          />
        </div>

      </div>

      {/* Column Selection Modal */}
      <Modal isOpen={isColumnModalOpen} onClose={() => setColumnModalOpen(false)}>
        <ModalContent>
          <ModalHeader className='bg-gray-200'>Choose Columns</ModalHeader>
          <ModalBody className="modal-body-scroll">
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <CheckboxGroup value={selectedColumns} onChange={handleColumnChange}>
                      {columnOrder.map((column, index) => (
                        <Draggable key={column} draggableId={column} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between p-2 border-b"
                            >
                              <Checkbox
                                value={column}
                                isChecked={selectedColumns.includes(column)}
                                onChange={() => {
                                  // Toggle column selection
                                  if (selectedColumns.includes(column)) {
                                    setSelectedColumns(selectedColumns.filter(col => col !== column));
                                  } else {
                                    setSelectedColumns([...selectedColumns, column]);
                                  }
                                }}
                              >
                                {column}
                              </Checkbox>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CheckboxGroup>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ModalBody>
          <ModalFooter className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Button onPress={handleDeselectAll} size="sm" color="default" variant="flat">
                Deselect All
              </Button>
              <Button onPress={handleSelectAll} size="sm" color="primary" variant="flat">
                Select All
              </Button>
            </div>
            <Button variant="solid" color="primary" size='sm' onPress={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isDismissable={false} hideCloseButton={true} isOpen={openModal} onClose={() => setOpenModal(false)} size="xl">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className='bg-gray-200 mb-3'>
                {modalType === "invoice" ? "Add Invoice / Transaction ID" : "Add Attachment"}
              </ModalHeader>
              <ModalBody>
                {modalType === "invoice" && (
                  <Input
                    placeholder="Enter Invoice or Transaction ID"
                    value={selectedEntry?.invoiceId || ""}
                    onChange={(e) =>
                      setSelectedEntry((prev) => ({ ...prev, invoiceId: e.target.value }))
                    }
                  />
                )}

                {modalType === "attachment" && (
                  <div className="flex-1 w-full">
                    <div className="flex items-center w-full p-1 border border-gray-300 rounded-md bg-white shadow-sm cursor-pointer" onClick={() => fileInputRef?.current?.click()}>
                      <label
                        htmlFor="attachment"
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md cursor-pointer hover:bg-gray-950 transition duration-200 min-w-[110px] max-w-[110px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Choose File
                      </label>
                      <span className="ml-4 text-gray-600 truncate">
                        {file?.name || "No file chosen"}
                      </span>
                      <input
                        id="attachment"
                        ref={fileInputRef}
                        className="hidden"
                        type="file"
                        accept=".jpg, .png, .pdf"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* ✅ Allowed file types and size message */}
                    <p className="mt-2 text-xs text-gray-500">
                      Allowed formats: <span className="font-medium">JPG, PNG, PDF</span> (max 10MB)
                    </p>

                    {/* ❌ Error message when validation fails */}
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

                  </div>
                )}
                {modalError && <p className="text-left text-red-500 font-semibold text-xs">{modalError}</p>}
              </ModalBody>
              <ModalFooter className="border-t mt-2">
                <Button color="danger" variant="light" onPress={() => {
                  setModalError("");  // Clear any previous error
                  setError(""); // Clear any previous error
                  setOpenModal(false); // Close modal
                  setFile(null);
                  setSelectedEntry(null);
                }}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    // Validation
                    if (modalType === "invoice" && !selectedEntry?.invoiceId?.trim()) {
                      setModalError("Invoice/Transaction ID is required.");
                      return;
                    }

                    if (modalType === "attachment" && !selectedEntry?.attachment) {
                      setModalError("Attachment file is required.");
                      return;
                    }

                    setModalError(""); // Clear error if valid

                    try {
                      let payload = {};

                      if (modalType === "invoice") {
                        payload = { invoiceId: selectedEntry.invoiceId };
                      } else if (modalType === "attachment") {
                        // If you need to upload file first
                        const attachmentUrl = await uploadFile(file);
                        if (!attachmentUrl) {
                          setModalError("File upload failed, please try again.");
                          return;
                        }
                        payload = { attachment: attachmentUrl };
                      }

                      // ✅ API call here
                      const response = await axiosSecure.patch(`/update-expense-entry/${selectedEntry._id}`, payload);

                      if (response.status === 200) {
                        setExpenseEntries((prevEntries) =>
                          prevEntries.map((entry) =>
                            entry._id === selectedEntry._id
                              ? { ...entry, ...payload } // merge updated fields
                              : entry
                          )
                        );
                        toast.success(`${modalType === "invoice" ? "Invoice ID" : "Attachment"} updated successfully!`);
                        setOpenModal(false);
                        setFile(null);
                        setSelectedEntry(null);
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update. Please try again.");
                    }
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};

export default ExpenseEntries;