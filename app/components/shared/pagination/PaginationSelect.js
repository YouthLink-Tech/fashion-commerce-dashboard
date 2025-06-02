import { Select, SelectItem } from "@nextui-org/react";

const PaginationSelect = ({ options, value, onChange }) => {
  return (
    <Select
      className="w-fit"
      selectionMode="single"
      size="sm"
      selectedKeys={new Set([value.toString()])}
      onSelectionChange={(newSelectedKeys) => {
        const selectedValue = Number(Array.from(newSelectedKeys)[0]);
        onChange(selectedValue); // Pass selected value to parent component
      }}
      classNames={{
        mainWrapper: [
          `z-[1] text-neutral-700 [&>button]:duration-300 
          hover:[&>button]:bg-[#F4D3BA] [&>button]:bg-[#fbcfb0] font-semibold !h-10 !min-h-10 
      [&>button]:!h-10 [&>button]:!min-h-10 [&>button]:!py-0`
        ],
        label: [
          "text-neutral-700 static mr-4 group-data-[filled=true]:scale-100 group-data-[filled=true]:-translate-y-0",
        ],
        innerWrapper: ["hidden"],
        popoverContent: ["min-w-20 w-fit"],
      }}
      label={value} // ✅ Shows selected value dynamically
    >
      {options.map((option) => (
        <SelectItem key={option.toString()} value={option.toString()} textValue={option.toString()}>
          {option}
        </SelectItem>
      ))}
    </Select>
  );
};

export default PaginationSelect;