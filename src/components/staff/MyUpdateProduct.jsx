import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductForm from './ProductForm';
import { Box } from '@mui/material';

export default function MyUpdateProduct({
  token,
  setOpenDialog,
  setIsDeleted,
  productId, 
  price, 
  itemName, 
  itemImage, 
  itemDescription, 
  itemSize, 
  itemQuantity,
  baseUrl,
  onUpdateSuccess
}) {
  const navigate = useNavigate();

  const handleUpdateProduct = async (productData) => {
    try {
      const response = await axios.put(`${baseUrl}/staff/product`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        onUpdateSuccess();
        navigate('/staff/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <ProductForm 
        isUpdate={true}
        productId={productId}
        price={price}
        itemName={itemName}
        itemImage={itemImage}
        itemDescription={itemDescription}
        itemSize={itemSize || []}
        itemQuantity={itemQuantity}
        token={token}
        setIsDeleted={setIsDeleted}
        setOpenEditDialog={setOpenDialog}
        handleUpdateProduct={handleUpdateProduct}
      />
    </Box>
  );
}