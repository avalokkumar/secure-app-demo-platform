import React from 'react';
import PropTypes from 'prop-types';

/**
 * Certificate Component
 * 
 * Displays a security certification with customizable title, user name, and issue date
 */
const Certificate = ({ title, userName, issueDate, certificateId }) => {
  return (
    <div className="certificate p-4 text-center border">
      <div className="certificate-header mb-3">
        <h2 className="mb-0 text-primary">Secure Application Demo Platform</h2>
        <p className="mb-0">Certificate of Completion</p>
      </div>
      
      <div className="certificate-content py-4">
        <p className="mb-4">This is to certify that</p>
        <h3 className="certificate-name mb-4">{userName}</h3>
        <p className="mb-4">has successfully completed the</p>
        <h4 className="certificate-course mb-4">{title}</h4>
        <p className="mb-1">demonstrating proficiency in application security principles and practices</p>
        <p className="mb-4">as part of the Secure Application Demo Platform curriculum</p>
        
        <div className="certificate-date mt-5 mb-2">
          <p>Issued on {issueDate}</p>
        </div>
        
        <div className="certificate-id small text-muted">
          Certificate ID: {certificateId}
        </div>
      </div>
    </div>
  );
};

Certificate.propTypes = {
  title: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  issueDate: PropTypes.string.isRequired,
  certificateId: PropTypes.string.isRequired,
};

export default Certificate;
