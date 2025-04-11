import  { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Button, Checkbox, Card, CardContent, CardActions, Typography, 
Badge, Box, CircularProgress, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
TextField,
InputAdornment} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search'

const baseUrl = import.meta.env.VITE_BASE_URL;

function MyViewOrders(props) {
  const [token] = useState(props.token);

  const [orderList, setOrderList] = useState([]);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [checkedItems, setCheckedItems] = useState({});
  const [openDialog, setOpenDialog] = useState({});
  const prevOrderList = useRef();
  const [fltr, setFltr] = useState('PENDING');

  const [messages, setMessages] = useState([]);
  const [newOrder, setNewOrder] = useState(false);
  const [search, setSearch] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  
  const fetchOrders = async () => {
      
    try {
      if (token) {
        const response = await axios.get(`${baseUrl}/staff/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newOrderList = response.data.orderlist;
        console.log("Fetching orders......");

        // Check if the order list has changed
        if (JSON.stringify(newOrderList) !== JSON.stringify(prevOrderList.current)) {
          setOrderList(newOrderList);
          prevOrderList.current = newOrderList;
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  if (isUpdated || newOrder) {
    fetchOrders();
    setIsUpdated(false);
    setNewOrder(false);
  }
  const handleEnqueueUpdate = () => {
    enqueueSnackbar(messages);
  };
  const handleOnChangeSearch = (e) => {
    setSearch(e.target.value);
    console.log(search)
  };
  
  

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws/orders');
    socket.onopen = () => {
        console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
        console.log('Message received: ', event.data);
        setMessages(event.data);
        handleEnqueueUpdate();
        setNewOrder(true);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error: ', error);
    };

    return () => {
        socket.close();
    };
}, []);

  const isAllChecked = (orderId, products) => {
    return products.every(product => checkedItems[orderId]?.[product.cartId]);
  };


  const handleCheckboxChange = (orderId, cartId) => {
    setCheckedItems(prevState => ({
      ...prevState,
      [orderId]: {
        ...prevState[orderId],
        [cartId]: !prevState[orderId]?.[cartId]
      }
    }));
  };

  const handleUpdateOrder = async (id, email, status) => {
    try {
      // Update the order status
      const response = await axios.post(`${baseUrl}/staff/order`, {
        orderId: id,
        email: email,
        orderStatus: status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
     
      console.log("Update successful:", response.data);
  
      setIsUpdated(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClickOpen = (orderId) => {
    setOpenDialog(prevState => ({ ...prevState, [orderId]: true }));
  };

  const handleClose = (orderId) => {
    setOpenDialog(prevState => ({ ...prevState, [orderId]: false }));
  };

  const handleAgree = (orderId, email) => {
    handleUpdateOrder(orderId, email, 'CANCELED');
    setOpenDialog(prevState => ({ ...prevState, [orderId]: false }));
  };
  const handleFilter = (value) =>{
    setFltr(value);
  };

  return (
    isLoading ? (
      <Box sx={{ display: 'flex', mt: 50, ml: 100  }}>
        <CircularProgress />
      </Box>
    ) : (
      
      <div>
        <TextField
        
          label="Search"
          name="search"
          variant="outlined"
          color="inherit"
          onChange={handleOnChangeSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "90%",
            marginLeft: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
            "& .MuiFormLabel-root": {
              fontWeight: "bold",
              color: "black", 
            },
            "& .MuiFormLabel-root.Mui-focused": {
              color: "#F2C300", 
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "black",
              },
              "&:hover fieldset": {
                borderColor: "#F2C300", 
              },
              "&.Mui-focused fieldset": {
                borderColor: "#F2C300", 
              },
              "&:hover .MuiInputBase-input": {
                color: "#F2C300", 
              },
            },
            "&:hover .MuiSvgIcon-root": {
              color: "#F2C300",
            },
          }}
        />
      <div>
        <Button
          onClick={() => handleFilter('DONE')}
          sx={{
            marginLeft: "20px",
            color: "inherit",
            "&:hover": {
              backgroundColor: "#F0F0F0", 
              color: "green",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          Done
        </Button>
        <Button
          onClick={() => handleFilter('PENDING')}
          sx={{
            marginLeft: "20px",
            color: "inherit",
            "&:hover": {
              backgroundColor: "#F0F0F0",
              color: "orange",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          Pending
        </Button>
        <Button
          onClick={() => handleFilter('CANCELED')}
          sx={{
            marginLeft: "20px",
            color: "inherit",
            "&:hover": {
              backgroundColor: "#F0F0F0",
              color: "red",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          CANCELED
        </Button>
      </div>
       
        <Typography variant="h5" gutterBottom marginLeft={10} marginTop={5} >Order List</Typography>
        {orderList.length > 0 ? (
          <Box display="flex" flexWrap="wrap" gap={5} marginLeft={10}>
            
            {orderList
              .filter(order => order.orderStatus === fltr)
              .filter(order => search === '' ||order.orderId.toString().includes(search) || order.orderBy.replace(/@[\w.-]+$/, '').toLowerCase().includes(search.toLowerCase()))
              .map(order => (
                <Card key={order.orderId} variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: "500px", width: "400px", paddingRight: "10px" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: 2 }}>
                      <span>
                        <Typography variant="h5" component="div">Order No: {order.orderId}</Typography>
                        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                          <Typography variant="body2" component="div" color="textSecondary" style={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon style={{ marginRight: '8px' }} />
                              Ordered By: {order.orderBy.replace(/@[\w.-]+$/, '')}
                          </Typography>
                        </Box>
                      </span>
                      <span style={{ fontSize: '18px', marginRight: '10px' }}>
                        <Badge
                        
                          color="warning"
                          sx={{
                            display: 'flex',
                            color: 'black',
                            alignItems: 'center',
                            marginTop: 1,
                            backgroundColor: order.orderStatus === 'DONE'
                            ? '#A9E2A2'  
                            : order.orderStatus === 'PENDING'
                            ? '#FFFF8F'  
                            : '#F4A6A6', 

                            padding: '8px 12px',
                            borderRadius: '12px',
                          }}
                        >
                          <AccessTime sx={{ fontSize: 16, marginRight: 1 }} />
                          {order.orderStatus}
                        </Badge>
                      </span>
                    </Box>
                    <Typography variant="body1" component="div" sx={{ marginTop: 2, fontWeight: 'bold' }}>Items</Typography>
                    {order.products.length > 0 ? (
                      <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        {order.products.map(product => (
                          <Box key={product.cartId} display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: 2 }}>
                           {order.orderStatus === "PENDING" ? (
                              <Checkbox
                                id={`product-${product.cartId}`}
                                cartid={`product-${product.cartId}`}
                                checked={checkedItems[order.orderId]?.[product.cartId] || false}
                                onChange={() => handleCheckboxChange(order.orderId, product.cartId)}
                              />
                            ) : (
                              <div style={{ marginLeft: '20px' }}></div>
                            )}
                            <label htmlFor={`product-${product.cartId}`} style={{ flexGrow: 1, userSelect: 'none' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '20px' }}>
                                  {product.productName}
                                  <span style={{ fontSize: '15px', color: '#8B4543' }}> {'(Size '}{product.productSize}{')'}</span>
                                </span>
                                <div style={{ fontSize: '14px', marginTop: '5px', opacity: 0.8 }}>
                                  Quantity: {product.quantity}
                                </div>
                              </div>
                            </label>
                            <span style={{ fontSize: '18px', marginRight: '10px', userSelect: 'none' }}>
                              ₱{(product.price * product.quantity).toFixed(2)}
                            </span>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" component="div">No products in this order.</Typography>
                    )}
                  </CardContent>
                  <Divider sx={{width:350, marginLeft:3}} />
                  <Typography variant="body1" component="div" sx={{ marginTop: 2, fontWeight: 'bold' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: 2 }}>
                      <span style={{ fontSize: '20px', marginLeft: '10px', userSelect: 'none' }}>Total Price:</span>
                      <span style={{ fontSize: '20px' }}>
                        ₱{order.products.reduce((sum, product) => sum + product.price * product.quantity, 0).toFixed(2)}
                      </span>
                    </Box>
                  </Typography>
                  <CardActions sx={{ justifyContent: 'center' }}>
                      {order.orderStatus === "CANCELED" && (
                        <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: '#34bd4c',
                                  '&:hover': {
                                    backgroundColor: '#63c474',
                                  },
                                }}
                                fullWidth
                                onClick={() => handleUpdateOrder(order.orderId, order.orderBy, 'PENDING')}
                              >
                                RESTORE
                              </Button>
                      )}
                      {order.orderStatus === "PENDING" && (
                            <>
                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: '#6ad661',
                                  '&:hover': {
                                    backgroundColor: '#74ef6a',
                                  },
                                }}
                                fullWidth
                                onClick={() => handleUpdateOrder(order.orderId, order.orderBy, 'DONE')}
                                disabled={!isAllChecked(order.orderId, order.products)}
                              >
                                Order Served
                              </Button>

                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: '#8B4543',
                                  '&:hover': {
                                   backgroundColor: '#693432',
                                  },
                                }}
                                fullWidth
                                onClick={() => handleClickOpen(order.orderId)}
                              >
                                Cancel Order
                              </Button>
                            </>
                          )}
                    <Dialog
                      open={openDialog[order.orderId] || false}
                      onClose={() => handleClose(order.orderId)}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">{"Cancel Order?"}</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Are you sure you want to cancel this order?
                        
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => handleClose(order.orderId)} color="primary">No</Button>
                        <Button color="error" onClick={() => handleAgree(order.orderId, order.orderBy)} autoFocus>
                          Yes
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </CardActions>
                </Card>
              ))}
          </Box>
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ marginLeft: '10px' }}>No orders to display.</Typography>
        )}
        <SnackbarProvider maxSnack={3}/>
       
      </div>
      
    )
  );
}

MyViewOrders.propTypes = {
  token: PropTypes.string.isRequired
};

export default MyViewOrders;
