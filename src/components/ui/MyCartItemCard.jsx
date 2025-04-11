import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import PropTypes from 'prop-types';

const baseUrl = import.meta.env.VITE_BASE_URL;

function MyCartItemCard(props) {
  const [quantity, setQuantity] = useState(props.itemQuantity);
  const [productSize] = useState(props.itemSize); 
  const [price, setPrice] = useState(props.itemPrice);
  const [token, setToken] = useState(props.myToken);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [cartData, setCartData] = useState({ 
    id: props.itemId, 
    quantity, 
    size: productSize,
    price: price 
  });
  
  const updateCartData = async (newQuantity) => {
    try {
      setIsLoading(true);
      const updatedCartData = { 
        ...cartData, 
        quantity: newQuantity,
        size: productSize 
      };
      
      const response = await axios.put(
        `${baseUrl}/user/cart`,
        updatedCartData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Update successful:", response.data);
      if (response.data.token) {
        setToken(response.data.token);
        sessionStorage.setItem('token', JSON.stringify(response.data.token));
      }
      
      setQuantity(newQuantity);
      setCartData(updatedCartData);
      props.setIsUpdated(true);
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (!isLoading) {
      const newQuantity = quantity + 1;
      updateCartData(newQuantity);
    }
  };

  const decrementQuantity = () => {
    if (!isLoading && quantity > 1) {
      const newQuantity = quantity - 1;
      updateCartData(newQuantity);
    }
  };

  const handleRemoveItem = async (e) => {
    e.preventDefault();
    try {
      const itemIdInt = parseInt(props.itemId, 10);
      const response = await axios.delete(`${baseUrl}/user/cart?cartId=${itemIdInt}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      props.setIsDeleted(true);
      console.log("Item removed from cart successfully:", response.data);
    } catch (error) {
      console.error('Error Removing Item:', error);
      setErrorMessage('Failed to remove item. Please try again.');
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 390, mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Product Image */}
          <div style={{ width: 100, height: 100, flexShrink: 0 }}>
            <img
              src={props.itemImage}
              alt={props.itemName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </div>
          
          {/* Product Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>{props.itemName}</Typography>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>₱{(price * quantity).toFixed(2)}</Typography>
            </div>
            
            {productSize && 
             productSize !== 'null' && 
             productSize !== 'undefined' && 
             productSize !== 'NULL' && (
              <Typography variant="body2" color="text.secondary">Size: {productSize}</Typography>
            )}
            
            {/* Quantity Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 'auto' }}>
              <IconButton 
                size="small" 
                onClick={decrementQuantity} 
                disabled={quantity <= 1 || isLoading}
                sx={{ bgcolor: 'action.hover' }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              
              <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>
                {quantity}
              </Typography>
              
              <IconButton 
                size="small" 
                onClick={incrementQuantity} 
                disabled={isLoading}
                sx={{ bgcolor: 'action.hover' }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                onClick={handleRemoveItem}
                sx={{ ml: 'auto' }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MyCartItemCard;

MyCartItemCard.propTypes = {
  itemId: PropTypes.number.isRequired,
  itemName: PropTypes.string.isRequired,
  itemQuantity: PropTypes.number,
  itemSize: PropTypes.string,
  setIsDeleted: PropTypes.func,
  setIsUpdated: PropTypes.func,
  itemPrice: PropTypes.number.isRequired,
  productId: PropTypes.number.isRequired,
  myToken: PropTypes.string.isRequired,
  itemImage: PropTypes.string.isRequired
};
