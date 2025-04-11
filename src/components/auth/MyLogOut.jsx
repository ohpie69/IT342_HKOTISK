import { Button } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const baseUrl = import.meta.env.VITE_BASE_URL; 

const MyLogOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSignOut = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.get(`${baseUrl}/auth/signout`);
      console.log('SignOut successful:', response.data);
      setSuccessMessage('You have been successfully signed out.');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      navigate('/auth');
    } catch (error) {
      console.error('Error:', error.message);
      setError('Failed to sign out. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleSignOut} disabled={isLoading}>
        <ExitToAppIcon/>
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </>
  );
};

export default MyLogOut;
