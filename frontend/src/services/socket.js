import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const subscribeToUpdates = (callback) => {
  const socket = getSocket();
  socket.on('priceUpdate', callback);
  
  return () => {
    socket.off('priceUpdate', callback);
  };
};

export const subscribeToBulkUpdates = (callback) => {
  const socket = getSocket();
  socket.on('bulkPriceUpdate', callback);
  
  return () => {
    socket.off('bulkPriceUpdate', callback);
  };
};

export const requestPriceUpdate = (productName) => {
  const socket = getSocket();
  socket.emit('requestPriceUpdate', { productName });
};

export const subscribeToScheduledUpdates = (callback) => {
  const socket = getSocket();
  socket.on('scheduledUpdateComplete', callback);
  
  return () => {
    socket.off('scheduledUpdateComplete', callback);
  };
};

export const subscribeToPriceUpdateResponse = (callback) => {
  const socket = getSocket();
  socket.on('priceUpdateResponse', callback);
  
  return () => {
    socket.off('priceUpdateResponse', callback);
  };
};

export const subscribeToPriceUpdateError = (callback) => {
  const socket = getSocket();
  socket.on('priceUpdateError', callback);
  
  return () => {
    socket.off('priceUpdateError', callback);
  };
};

export default { 
  initSocket, 
  getSocket, 
  subscribeToUpdates, 
  subscribeToBulkUpdates,
  requestPriceUpdate,
  subscribeToScheduledUpdates,
  subscribeToPriceUpdateResponse,
  subscribeToPriceUpdateError
};