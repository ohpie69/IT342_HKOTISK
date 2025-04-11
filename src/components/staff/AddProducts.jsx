import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';

export default function AddProducts({ token: propToken }) {
  const [token, setToken] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (propToken) {
      setToken(propToken);
    } else {
      const storedToken = sessionStorage.getItem('token');
      if (!storedToken) {
        navigate('/auth');
      } else {
        const cleanToken = storedToken.replace(/^"|"$/g, '');
        setToken(cleanToken);
      }
    }
  }, [propToken, navigate]);

  return token ? (
    <Box sx={{ 
      maxHeight: 'calc(100vh - 200px)', 
      overflowY: 'auto',
      p: 2,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#888',
        borderRadius: '4px',
        '&:hover': {
          background: '#666',
        },
      },
    }}>
      <ProductForm 
        isUpdate={false}
        token={token}
        setOpenAddDialog={setOpenDialog}
        setIsDeleted={setIsDeleted}
      />
    </Box>
  ) : null;
}