import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import InfoIcon from '@mui/icons-material/Info';
import MyItemCard from './ui/MyItemCard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import axios from 'axios';
import './css/dashboard.css'; 
import AddProducts from './staff/AddProducts';
import MyCart from './MyCart';
import MyLogOut from './auth/MyLogOut';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import MyViewOrders from './staff/MyViewOrders';
import Logo from "../assets/componentsRes/hkotiskLogo.png";
import { SearchIcon } from 'lucide-react';
import { InputAdornment, TextField } from '@mui/material';
import MyUpdateProduct from './staff/MyUpdateProduct';
import ImageUploader from './staff/ImageUploader';
import StaffProductsView from './staff/StaffProductsView';

const baseUrl = import.meta.env.VITE_BASE_URL;
const wsURL = import.meta.env.VITE_WS_URL;

const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
  breakpoints: { values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 } },
});

const fetchData = async (url, token, setData) => {
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200){
      setData(response.data.oblist);
    }
  } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
  }
};

function MyDashboard({ window }) {
  const [pathname, setPathname] = useState(() => {
    const role = JSON.parse(sessionStorage.getItem('role'));
    return role === 'staff' ? '/manage-products' : '/Snacks';
  });
  const [token, setToken] = useState('');
  const [products, setProducts] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);
  const myRole =  JSON.parse(sessionStorage.getItem('role'));
  const [newProduct, setNewProduct] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const STUDENT_NAVIGATION = useMemo(() => [
    { segment: 'Snacks', title: 'Snacks', icon: <FastfoodIcon /> },
    { segment: 'Food', title: 'Food', icon: <LocalPizzaIcon /> },
    { segment: 'Beverage', title: 'Beverage', icon: <LocalDrinkIcon /> },

   
  ], []);

  const STAFF_NAVIGATION = useMemo(() => [
    { segment: 'ViewOrders', title: 'Orders', icon: <FormatListBulletedIcon /> },
    { segment: 'manage-products', title: 'Products', icon: <ModeEditOutlineIcon /> },
  ], []);

  const NAVIGATION = useMemo(() => [
    { segment: 'Favorites', title: 'Favorites', icon: <DashboardIcon /> },
    { segment: 'Snacks', title: 'Snacks', icon: <FastfoodIcon /> },
    { segment: 'AddProducts', title: 'AddProducts', icon: <AddCircleOutlineIcon /> },
    { segment: 'UpdateProducts', title: 'UpdateProducts', icon: <ModeEditOutlineIcon /> },
    { segment: 'ViewOrders', title: 'ViewOrders', icon: <FormatListBulletedIcon /> },
    { segment: 'WaitingArea', title: 'WaitingArea', icon: <FormatListBulletedIcon /> },
    { kind: 'divider' },
    { segment: 'Info', title: 'Info', icon: <InfoIcon /> },
  ], []);

  const drawerItems = useMemo(() => [
    {
      text: 'Manage Products',
      icon: <ModeEditOutlineIcon />,
      path: '/manage-products',
      component: <StaffProductsView />,
      roles: ['staff']
    },
  ], []);

  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('token');
      if (savedToken) {
        // Remove quotes if they exist
        const cleanToken = savedToken.replace(/^"|"$/g, '');
        setToken(cleanToken);
      } else {
        console.log("No token found");
        // Redirect to login if no token
        navigate('/auth');
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
      // Redirect to login on error
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (token) {
        try {
          await fetchData(`${baseUrl}/user/product`, token, setProducts);
        } catch (error) {
          if (error.response?.status === 403) {
            // Token expired or invalid, redirect to login
           
            navigate('/auth');
          }
        }
      }
      setIsDeleted(false);
    };

    fetchProducts();
  }, [token, isDeleted, navigate]);

  const router = useMemo(() => ({
    pathname,
    searchParams: new URLSearchParams(),
    navigate: setPathname,
  
  }), [pathname]);
  // const handleOnChangeSearch = (e) => {
  //   setSearch(e.target.value);
  //   console.log(search)
  // };
  const [isConnected, setIsConnected] = useState(false);

      useEffect(() => {
        const socket = new WebSocket(`ws://${wsURL}/ws/products`);
      
        socket.onopen = () => {
          console.log('WebSocket connection established');
          setIsConnected(true);
        };
      
        socket.onmessage = (event) => {
          console.log('Message received: ', event.data);
          if (event.data.includes('New Item added') || event.data.includes('Product with')) {
            // if(myRole !== 'staff')
            fetchData(`${baseUrl}/user/product`, token, setProducts);
            setNewProduct(true);
            return;
          }
          try {
            // Handle text messages
            if (typeof event.data === 'string') {
              // Ignore connection messages
              if (event.data.startsWith('Connection')) {
                return;
              }
              
              // Check if the message is valid JSON
              let data;
              try {
                data = JSON.parse(event.data);
              } catch (jsonError) {
                console.warn('Received non-JSON message:', event.data);
                return; // Exit if the message is not valid JSON
              }

              // Handle product update messages
              if (event.data.includes('New Item added')) {
                fetchData(`${baseUrl}/user/product`, token, setProducts);
                setNewProduct(true);
                return;
              }
            }
            
            // Try to parse as JSON for other messages
            const data = JSON.parse(event.data);
            if (newProduct || data.type === 'update' || data.type === 'create') {
              fetchData(`${baseUrl}/user/product`, token, setProducts);
              setNewProduct(false)
            } else if (data.type === 'delete') {
              setProducts(prevProducts => 
                prevProducts.filter(product => product.id !== data.productId)
              );
            }
            setNewProduct(true);
          } catch (error) {
            // Only log errors for non-connection messages
            if (!event.data.startsWith('Connection')) {
              console.error('Error processing WebSocket message:', error);
              console.debug('Raw message:', event.data);
            }
          }
        };
      
        socket.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            setIsConnected(false);
          }, 5000);
        };
      
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      
        return () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      }, [token]);
      const handleOnChangeSearch = (e) => {
        setSearch(e.target.value);
        console.log(search)
      };
  const filteredProducts = useMemo(() => {
        return products.filter(product => 
          product.productName.toLowerCase().includes(search.toLowerCase())
        );
      }, [products, search]);
      
  const DemoPageContent = useCallback(() => (
    <>
    <Box sx={{ py: 4, display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
        {pathname === '/dashboard' && <Typography>Welcome to the Dashboard</Typography>}
        {pathname === '/ViewProducts' && 
        products.map(product => (
          
          <MyItemCard
            key={product.productId}
            productId={parseInt(product.productId, 10)}
            price={product.prices}
            itemName={product.productName}
            itemImage={product.productImage || '/src/assets/componentsRes/hkotiskLogo.png'}
            itemDescription={product.description}
            itemSize={product.sizes}
            itemQuantity={product.quantity}
            myToken={token}
          />
        
        ))}
        {pathname === '/Snacks' && 
        products.map(product => (
          
          <MyItemCard
            key={product.productId}
            productId={parseInt(product.productId, 10)}
            price={product.prices}
            itemName={product.productName}
            itemImage={product.productImage || '/src/assets/componentsRes/hkotiskLogo.png'}
            itemDescription={product.description}
            itemSize={product.sizes}
            itemQuantity={product.quantity}
            myToken={token}
          />
        
        ))}
      {pathname === '/Food' && filteredProducts
        .filter(product => product.category === 'Food')
        .sort((a, b) => a.productName.localeCompare(b.productName))
        .map(product => (
          <MyItemCard
            key={product.productId}
            productId={parseInt(product.productId, 10)}
            price={product.prices}
            itemName={product.productName}
            itemImage={product.productImage || '/src/assets/componentsRes/hkotiskLogo.png'}
            itemDescription={product.description}
            itemSize={product.sizes}
            itemQuantity={product.quantity}
            myToken={token}
          />
        ))}
        {pathname === '/Beverage'  && 
          products
            .filter(order => order.category === 'Beverage')
            .map(product => (
              <MyItemCard
                key={product.productId}
                productId={parseInt(product.productId, 10)}
                price={product.prices}
                itemName={product.productName}
                itemImage={product.productImage || '/src/assets/componentsRes/hkotiskLogo.png'}
                itemDescription={product.description}
                itemSize={product.sizes}
                itemQuantity={product.quantity}
                myToken={token}
              />
            ))}

       
      </Box>
      <Box>
        { pathname === '/ViewOrders' && <MyViewOrders token={token}/>}
        </Box>
        <Box sx={{ py: 4, display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', alignItems: 'center' }}>
        { pathname === '/manage-products' && <StaffProductsView token={token} />}
      </Box>
      </>
  ), [pathname, products, search,token]);
  
  function MyCartFunc() {
    return (
      <>
         {myRole !== 'staff' && <MyCart sx={{ display: 'flex', justifyContent: 'center' }} />}
        <div><MyLogOut /></div>
      </>
    );
  }
  
 
  return (
    <AppProvider
      navigation={myRole === 'staff' ?  STAFF_NAVIGATION : STUDENT_NAVIGATION}
      branding={{ logo: <img src={Logo} alt="Logo" />, title: '' }}
      router={router}
      theme={demoTheme}
      window={typeof window !== 'undefined' ? window() : undefined}
      
    >
     <DashboardLayout 
      slots={{ toolbarActions: MyCartFunc }} 
      sx={{ height: "100vh" }}
    >
        <DemoPageContent />
      </DashboardLayout>
    </AppProvider>
  );
}


MyDashboard.propTypes = {
  window: PropTypes.func,
};

export default MyDashboard;
