import { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Snackbar, 
  Alert,
  IconButton,
  TextField
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PropTypes from 'prop-types';
import axios from 'axios';

// Define custom theme colors
const theme = {
  primary: '#FFD700', // Gold
  secondary: '#800000', // Maroon
  background: '#FFFFFF', // White
  text: '#000000', // Black
};

const baseUrl = import.meta.env.VITE_BASE_URL;

const flyToCart = keyframes`
  0% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
  50% {
    transform: scale(0.5) translate(50%, -50%);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.1) translate(200%, -200%);
    opacity: 0;
  }
`;

// Styled components
const PriceChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#FFD700',
  color: '#000000',
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '0.5rem',
  height: 'auto',
  borderRadius: '16px',
  '& .MuiChip-label': {
    padding: '0 8px',
  }
}));

const SizeButton = styled(Button)(({ selected }) => ({
  minWidth: '40px',
  backgroundColor: selected ? '#1976d2' : 'transparent',
  color: selected ? 'white' : '#1976d2',
  border: `1px solid ${selected ? '#1976d2' : '#1976d2'}`,
  '&:hover': {
    backgroundColor: selected ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
  },
}));

const CartButton = styled(Button)(() => ({
  backgroundColor: '#800000',
  color: '#FFFFFF',
  width: '100%',
  padding: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#600000',
  },
}));

function MyItemCard({
  itemSize = [],
  price = [],
  productId,
  itemQuantity = 1,
  itemImage,
  itemName,
  itemDescription,
  myToken,
  setisUpated,
}) {
  const [size, setSize] = useState();
  const [priceValue, setPrice] = useState(price[0] || 0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(myToken);
  const [open, setOpen] = useState(false);
  const myRole =  JSON.parse(sessionStorage.getItem('role'));
  const [listQuantity, setListQuantity] = useState(
    Array.isArray(itemQuantity) && itemQuantity.length > 0 
      ? parseInt(itemQuantity[0]) 
      : typeof itemQuantity === 'number' 
        ? itemQuantity 
        : 1
  );

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setToken(myToken);
  }, [myToken]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setError('');
  };

  const addToCart = async () => {
    setIsLoading(true);
    setIsAnimating(true);

    if (!token) {
      setError('You must be logged in to add items to the cart.');
      setIsLoading(false);
      setIsAnimating(false);
      return;
    }

    if (itemSize.length > 0 && !size) {
      setError('Please select a size.');
      setIsLoading(false);
      setIsAnimating(false);
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/user/cart`, {
        productId: parseInt(productId, 10),
        quantity: quantity,
        price: parseFloat(priceValue),
        ...(size && { size: String(size) })
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Added to Cart successfully:', response.data);
      setOpen(true);
      setQuantity(1);
    } catch (error) {
      setError('Failed to add to cart. Please try again.');
      console.error(error);
    } finally {
      setTimeout(() => setIsAnimating(false), 600); // End animation after duration
      setIsLoading(false);
    }
  };

  return (
    <Card
      sx={{ 
        width: '300px',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        animation: isAnimating ? `${flyToCart} 0.6s ease-in-out` : 'none',
      }}
    >
      <CardMedia
        component="img"
        image={itemImage}
        alt={itemName}
        sx={{ 
          height: 200,
          objectFit: 'contain',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
      />
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 600,
            mb: 0.5,
            fontSize: '1.1rem',
            lineHeight: 1.2
          }}
        >
          {itemName}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2 }}
        >
          {itemDescription}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1
        }}>
          <PriceChip label={`₱${priceValue.toFixed(2)}`} />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
           {myRole !== 'staff' && (
            <Typography variant="body2" color="text.secondary">Quantity:</Typography>
           )}
            {myRole !== 'staff' && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '4px'
            }}>
              
            <IconButton 
              size="small" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              sx={{ 
                color: '#800000',
                '&:hover': { backgroundColor: 'rgba(128, 0, 0, 0.04)' }
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
           
            <TextField
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, val));
              }}
              inputProps={{
                min: 1,
                style: { 
                  textAlign: 'center',
                  width: '40px',
                  padding: '4px',
                  '-moz-appearance': 'textfield'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                }
              }}
            />
           
            <IconButton 
              size="small" 
              onClick={() => setQuantity(quantity + 1)}
              sx={{ 
                color: '#800000',
                '&:hover': { backgroundColor: 'rgba(128, 0, 0, 0.04)' }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          
          </Box>
             )}
        </Box>
      
        {itemSize.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Size
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {itemSize.map((s, index) => (
                price[index] > 0 && (
                  <SizeButton
                    key={s}
                    selected={size === s}
                    onClick={() => {
                      setSize(s);
                      setPrice(price[index] || 0);
                      setListQuantity(Array.isArray(itemQuantity) ? itemQuantity[index] : itemQuantity);
                    }}
                  >
                    {s}
                  </SizeButton>
                )
              ))}
            </Box>
          </Box>
        )}
       {myRole !== 'staff' && (
        <Box sx={{ mt: 'auto' }}>
          <CartButton
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={addToCart}
            disabled={isLoading}
          >
            ADD TO CART
          </CartButton>
        </Box>
      )}
      </CardContent>

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success">
          Added to Cart successfully
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
}

MyItemCard.propTypes = {
  itemSize: PropTypes.arrayOf(PropTypes.string),
  price: PropTypes.arrayOf(PropTypes.number),
  productId: PropTypes.number,
  itemQuantity: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]),
  itemImage: PropTypes.string,
  itemName: PropTypes.string,
  itemDescription: PropTypes.string,
  myToken: PropTypes.string,
  setisUpated: PropTypes.func
};

export default MyItemCard;