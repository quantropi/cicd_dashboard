import React from 'react';

interface DividerProps {
  isOpen: boolean;
  toggle: () => void;
}

const Divider: React.FC<DividerProps> = ({ isOpen, toggle }) => {
  return (
    <div
      className={`divider ${isOpen ? 'open' : 'closed'}`}
      onClick={toggle}
    >
      <span>{isOpen ? 'Close Filter Bar' : 'Open Filter Bar'}</span>
    </div>
  );
};

export default Divider;
