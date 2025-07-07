import { Select, SelectItem } from '@nextui-org/react';
import { useState } from 'react';

const SupportFilterDropdown = ({ onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState(new Set(['all']));

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' }
  ];

  return (
    <Select
      label="Filter Messages"
      selectionMode="single"
      size="sm"
      selectedKeys={selectedFilter}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0];
        setSelectedFilter(new Set([selected]));
        onFilterChange(selected);
      }}
      className="w-48"
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
