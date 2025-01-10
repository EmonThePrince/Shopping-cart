const cart = [];

function addToCart(productId, quantity = 1) {
  try {
    const validQuantity = Math.max(1, parseInt(quantity));
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += validQuantity;
    } else {
      cart.push({ id: productId, quantity: validQuantity });
    }
    
    saveCartToLocalStorage();
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
}

function removeFromCart(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    saveCartToLocalStorage();
  }
}

function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, parseInt(quantity));
    saveCartToLocalStorage();
  }
}

function clearCart() {
  cart.length = 0;
  localStorage.removeItem('cart');
}

function calculateTotal(products) {
  return cart.reduce((total, cartItem) => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return total;
    return total + (product.price * cartItem.quantity);
  }, 0);
}

function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      cart.length = 0;
      cart.push(...parsedCart);
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error);
  }
}

export {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  calculateTotal,
  cart,
  loadCartFromLocalStorage
};