import { useState, useMemo, useCallback } from 'react';
import { Alert, Autocomplete, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Snackbar, TextField, Typography, Box, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_BASE_URL;
const categoryOptions = [
  { label: 'Food' },
  { label: 'Beverage' },
];

const buttonStyles = {
  marginTop: '1rem',
  backgroundColor: '#343434',
  '&:hover': {
    borderColor: '#36454F',
    color: '#fff',
    backgroundColor: '#36454F',
  },
};

function ProductForm({ 
  isUpdate = false, 
  productId, 
  price, 
  itemName, 
  itemImage, 
  itemDescription, 
  itemSize, 
  itemQuantity, 
  token,
  setIsDeleted,
  onSuccess,
  setOpenAddDialog,
  setOpenEditDialog
}) {
  const navigate = useNavigate();

  const defaultProductData = {
    description: '',
    productName: '',
    prices: [],
    quantity: [],
    sizes: ['S', 'M', 'L'],
    category: 'Beverage',
    productImage: null,
    noSizeQuantity: 0,
    noSizePrice: 0,
  };

  const initialProductData = useMemo(() => {
    if (!isUpdate) return defaultProductData;
    
    const sizes = Array.isArray(itemSize) ? itemSize : [];
    const prices = Array.isArray(price) ? price : [price];
    const quantities = Array.isArray(itemQuantity) ? itemQuantity : [itemQuantity];
    
    return {
      productId: parseInt(productId, 10),
      description: itemDescription || '',
      productName: itemName || '',
      prices: prices,
      quantity: quantities,
      sizes: sizes,
      category: 'Beverage',
      productImage: itemImage || null,
      noSizePrice: !sizes.length && prices.length ? prices[0] : 0,
      noSizeQuantity: !sizes.length && quantities.length ? quantities[0] : 0,
    };
  }, [isUpdate, productId, itemDescription, itemName, price, itemQuantity, itemSize, itemImage]);

  const [productData, setProductData] = useState(initialProductData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [delField, setDelField] = useState('');
  const [hasSizes, setHasSizes] = useState(isUpdate ? productData.sizes.length > 0 : true);

  const handleProductChange = useCallback((e, newValue) => {
    const name = e?.target?.name || 'category';
    const value = newValue?.label || e?.target?.value || newValue;
    setProductData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePriceChange = (index, value) => {
    const updatedPrices = [...(productData.prices || [])];
    updatedPrices[index] = parseFloat(value);
    setProductData((prevData) => ({ ...prevData, prices: updatedPrices }));
  };

  const handleQuantityChange = (index, value) => {
    const updatedQuantities = [...(productData.quantity || [])];
    updatedQuantities[index] = parseInt(value, 10);
    setProductData((prevData) => ({ ...prevData, quantity: updatedQuantities }));
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'hkotisk');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dottgoo0p/image/upload',
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadImageToCloudinary(file);
        setProductData(prev => ({ ...prev, productImage: imageUrl }));
      } catch (error) {
        setError('Failed to upload image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('No authentication token provided. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const requestData = {
        productName: productData.productName,
        description: productData.description,
        category: productData.category,
        sizes: hasSizes ? productData.sizes : [],
        prices: hasSizes ? productData.prices : [productData.noSizePrice],
        quantity: hasSizes ? productData.quantity : [productData.noSizeQuantity],
      };

      if (isUpdate) {
        requestData.productId = productData.productId;
      }

      // Handle image separately if needed
      if (productData.productImage instanceof File) {
        const imageFormData = new FormData();
        imageFormData.append('file', productData.productImage);
        
        // Upload image first
        const imageResponse = await axios({
          method: 'post',
          url: `${baseUrl}/staff/product/upload`,
          data: imageFormData,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        requestData.productImage = imageResponse.data.url;
      } else if (productData.productImage) {
        requestData.productImage = productData.productImage;
      }

      // Send product data as JSON
      const endpoint = isUpdate ? `${baseUrl}/staff/product/${productData.productId}` : `${baseUrl}/staff/product`;
      const method = isUpdate ? 'put' : 'post';

      const response = await axios({
        method,
        url: endpoint,
        data: requestData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response)

      setOpen(true);
      if (onSuccess) {
        onSuccess();
      }
      if (setIsDeleted) {
        setIsDeleted(prev => !prev);
      }
      // Close any open dialogs
      if (setOpenAddDialog) {
        setOpenAddDialog(false);
      }
      if (setOpenEditDialog) {
        setOpenEditDialog(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'An error occurred while saving the product.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${baseUrl}/staff/product/${productData.productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleted(true);
      // Close dialog after successful delete
      if (setOpenEditDialog) {
        setOpenEditDialog(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
    }
    setOpenDialog(false);
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {isUpdate ? 'Update Product' : 'Add New Product'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Product Name"
            name="productName"
            value={productData.productName}
            onChange={handleProductChange}
            sx={{ marginBottom: '1.5rem' }}
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={productData.description}
            onChange={handleProductChange}
            multiline
            rows={4}
            sx={{ marginBottom: '1.5rem' }}
            required
          />

          <Autocomplete
            disablePortal
            options={categoryOptions}
            openOnFocus
            id="category"
            name="category"
            sx={{ width: '100%', marginBottom: '1.5rem' }}
            value={categoryOptions.find(option => option.label === productData.category)}
            onChange={handleProductChange}
            renderInput={(params) => <TextField {...params} label="Category" required />}
          />

          {!isUpdate && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Does this product have sizes?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant={hasSizes ? "contained" : "outlined"} 
                  onClick={() => setHasSizes(true)}
                >
                  Yes
                </Button>
                <Button 
                  variant={!hasSizes ? "contained" : "outlined"} 
                  onClick={() => setHasSizes(false)}
                >
                  No
                </Button>
              </Box>
            </Box>
          )}

          {(hasSizes || (isUpdate && productData.sizes?.length > 0)) ? (
            productData.sizes?.map((size, index) => (
              <Grid container spacing={2} key={size} sx={{ marginBottom: '1rem' }}>
                <Grid item xs={4}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    type="number"
                    label="Price"
                    value={productData.prices?.[index] || ''}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                   
                  />
                </Grid>
              </Grid>
            ))
          ) : (
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  name="noSizePrice"
                  value={productData.noSizePrice}
                  onChange={handleProductChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  required
                />
              </Grid>
            
              
            </Grid>
          )}

          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ marginBottom: '1.5rem' }}
          />

          {productData.productImage && (
            <Box sx={{ marginBottom: '1.5rem' }}>
              <img
                src={productData.productImage}
                alt="Product"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                ...buttonStyles,
                minWidth: '120px'
              }}
              disabled={isLoading}
            >
              {isUpdate ? 'Update' : 'Add Product'}
            </Button>

            {isUpdate && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  ...buttonStyles,
                  minWidth: '120px',
                  backgroundColor: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#b71c1c'
                  }
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </form>

        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            {isUpdate ? 'Product updated successfully!' : 'Product added successfully!'}
          </Alert>
        </Snackbar>

        <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Type 'DELETE' to confirm"
              fullWidth
              value={delField}
              onChange={(e) => setDelField(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={delField !== 'DELETE'}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default ProductForm;
