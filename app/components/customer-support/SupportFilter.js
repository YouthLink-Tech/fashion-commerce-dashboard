import { Select, SelectItem } from '@nextui-org/react';

const SupportFilterDropdown = ({
  selectedFilter,
  setSelectedFilter,
  onFilterChange
}) => {
  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' }
  ];

  return (
    <Select
      label="Filter"
      selectionMode="single"
      size="sm"
      selectedKeys={selectedFilter}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0];
        setSelectedFilter(new Set([selected]));
        onFilterChange(selected);
      }}
      className="w-28"
    >
      {filterOptions.map((option) => (
        <SelectItem key={option.key} value={option.key}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SupportFilterDropdown;