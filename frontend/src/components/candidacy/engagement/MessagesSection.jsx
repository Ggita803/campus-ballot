import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaEnvelope, FaInbox } from 'react-icons/fa';

const MessagesSection = () => {
  const { colors } = useTheme();

  return (
    <div className="text-center py-5">
      <FaEnvelope size={64} className="text-muted mb-3 opacity-50" />
      <h5 className="text-muted mb-2">Direct Messaging</h5>
      <p className="text-muted mb-3">
        This feature allows you to send and receive direct messages from voters.
      </p>
      <div className="alert alert-info d-inline-block">
        <FaInbox className="me-2" />
        Coming soon! Direct messaging will be available in the next update.
      </div>
    </div>
  );
};

export default MessagesSection;
