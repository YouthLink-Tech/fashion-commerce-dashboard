import { useState } from 'react';

const TruncatedText = ({ text, maxLength = 30 }) => {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : `${text.slice(0, maxLength)}... `}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-500 hover:underline ml-1 text-sm"
      >
        {expanded ? 'See Less' : 'See More'}
      </button>
    </span>
  );
};

export default TruncatedText;