import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ApiDocs = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to our static API docs HTML page
    window.location.href = '/api-docs.html';
  }, []);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // This component will essentially just redirect, but we return a simple loading message
  // in case there's any delay in the redirect
  return (
    <div className="text-center py-5">
      <p>Loading API documentation...</p>
    </div>
  );
};

export default ApiDocs;
