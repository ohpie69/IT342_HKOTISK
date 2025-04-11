import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Fab,
  Menu,
  MenuItem,
  Dialog,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import AddProducts from './AddProducts';
import MyUpdateProduct from './MyUpdateProduct';
import MyItemCard from '../ui/MyItemCard';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_BASE_URL;

export default function StaffProductsView() {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProduct, setMenuProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      navigate('/auth');
      return;
    }

    const cleanToken = storedToken.replace(/^"|"$/g, '');
    setToken(cleanToken);
    fetchProducts(cleanToken);
  }, [isDeleted, navigate]);

  const fetchProducts = async (authToken) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/user/product`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      setProducts(response?.data?.oblist || response?.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 403) {
        sessionStorage.removeItem('token');
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    fetchProducts(token);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedProduct(null);
    fetchProducts(token);
  };

  const handleMenuClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setMenuProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProduct(null);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = async (product) => {
    try {
      const cleanToken = token.replace(/^"|"$/g, '');
      await axios.delete(`${baseUrl}/staff/product?productId=${product.productId}`, {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });
      setIsDeleted(!isDeleted);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Products
      </Typography>

      {loading ? (
        <Typography>Loading products...</Typography>
      ) : (
        <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }} wrap = "wrap">
          <Grid 
            container 
            spacing={3} 
            sx={{ 
              py: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3,
              '& .MuiGrid-item': {
                width: '100%',
                maxWidth: '100%',
                flexBasis: 'unset',
                padding: 0
              }
            }}
          >
            {products.map((product) => (
              <Grid item key={product.productId}>
                <Box
                  sx={{
                    position: 'relative',
                    height: '100%',
                    '& .MuiCard-root': {
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#ffffff',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                      }
                    }
                  }}
                >
                  <MyItemCard
                    productId={product.productId}
                    itemSize={Array.isArray(product.sizes) ? product.sizes : []}
                    price={Array.isArray(product.prices) ? product.prices : [product.price]}
                    itemQuantity={Array.isArray(product.quantity) ? product.quantity : [product.quantity]}
                    itemImage={product.productImage}
                    itemName={product.productName}
                    itemDescription={product.description}
                    myToken={token}
                  />
                  <Box
                    onClick={(e) => handleMenuClick(e, product)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 10,
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      width: 35,
                      height: 35,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <MoreVertIcon 
                      fontSize="small" 
                      sx={{ 
                        color: '#666666',
                        '&:hover': {
                          color: '#000000'
                        }
                      }} 
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 3 }}
        onClick={handleAddClick}
      >
        <AddIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        aria-label="Product Options"
      >
        <MenuItem onClick={() => handleEditClick(menuProduct)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(menuProduct)}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <AddProducts token={token} setIsDeleted={setIsDeleted} setOpenDialog={setOpenAddDialog} />
      </Dialog>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <MyUpdateProduct
          token={token}
          setIsDeleted={setIsDeleted}
          setOpenDialog={setOpenEditDialog}
          productId={selectedProduct?.productId}
          price={selectedProduct?.prices || [selectedProduct?.price]}
          itemName={selectedProduct?.productName}
          itemImage={selectedProduct?.productImage}
          itemDescription={selectedProduct?.description}
          itemSize={selectedProduct?.sizes || []}
          itemQuantity={selectedProduct?.quantity || []}
        />
      </Dialog>
    </Box>
  );
}