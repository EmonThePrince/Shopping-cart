import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  calculateTotal,
  cart,
  loadCartFromLocalStorage
} from './cart.js';
import { fetchProducts } from './products.js';

let productsCache = [];

async function displayProducts() {
  try {
    productsCache = await fetchProducts();
    const productContainer = document.getElementById('products');
    
    productContainer.innerHTML = productsCache.map(product => `
      <div class="product">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-content">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="price">$${product.price.toFixed(2)}</p>
          <button data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `).join('');

    attachProductEventListeners();
    updateCartUI();
  } catch (error) {
    console.error('Error displaying products:', error);
    showError('Failed to load products. Please try again later.');
  }
}

function attachProductEventListeners() {
  document.querySelectorAll('.product button').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id, 10);
      if (addToCart(productId)) {
        updateCartUI();
        showSuccess('Item added to cart');
      }
    });
  });
}

function updateCartUI() {
  const cartContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const cartCount = document.getElementById('cart-count');

  if (!cart.length) {
    cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartCount.textContent = '0';
    cartTotal.textContent = '0.00';
    return;
  }

  cartContainer.innerHTML = cart.map(item => {
    const product = productsCache.find(p => p.id === item.id);
    if (!product) return '';
    
    return `
      <div class="cart-item">
        <h4>${product.name}</h4>
        <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
        <span class="remove-item" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </span>
      </div>
    `;
  }).join('');

  cartTotal.textContent = calculateTotal(productsCache).toFixed(2);
  cartCount.textContent = cart.length.toString();

  attachCartEventListeners();
}

function attachCartEventListeners() {
  // Quantity input listeners
  document.querySelectorAll('#cart-items input').forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = parseInt(e.target.dataset.id, 10);
      const quantity = parseInt(e.target.value, 10);
      updateQuantity(productId, quantity);
      updateCartUI();
    });
  });

  // Remove item listeners
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.closest('.remove-item').dataset.id, 10);
      removeFromCart(productId);
      updateCartUI();
      showSuccess('Item removed from cart');
    });
  });
}

function showCheckoutModal() {
  const modal = document.createElement('div');
  modal.className = 'checkout-modal';
  modal.innerHTML = `
    <div class="checkout-content">
      <h2>Checkout</h2>
      <form id="checkout-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input type="text" id="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" required>
        </div>
        <div class="form-group">
          <label for="address">Shipping Address</label>
          <textarea id="address" required></textarea>
        </div>
        <button type="submit">Complete Order</button>
        <button type="button" class="cancel-checkout">Cancel</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  
  const form = modal.querySelector('#checkout-form');
  const cancelButton = modal.querySelector('.cancel-checkout');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const total = calculateTotal(productsCache);
    
    // Show success message
    modal.remove();
    showOrderConfirmation(total);
    
    // Clear cart
    clearCart();
    updateCartUI();
  });

  cancelButton.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function showOrderConfirmation(total) {
  const confirmationModal = document.createElement('div');
  confirmationModal.className = 'checkout-modal';
  confirmationModal.innerHTML = `
    <div class="checkout-content">
      <h2>Order Confirmed!</h2>
      <p>Thank you for your purchase.</p>
      <p>Total amount: $${total.toFixed(2)}</p>
      <button onclick="this.closest('.checkout-modal').remove()">Close</button>
    </div>
  `;
  document.body.appendChild(confirmationModal);
}

function showSuccess(message) {
  // You can implement a toast notification here
  alert(message);
}

function showError(message) {
  // You can implement a toast notification here
  alert(message);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalStorage();
  displayProducts();

  document.getElementById('clear-cart').addEventListener('click', () => {
    clearCart();
    updateCartUI();
    showSuccess('Cart cleared');
  });

  document.getElementById('checkout').addEventListener('click', () => {
    if (cart.length === 0) {
      showError('Your cart is empty');
      return;
    }
    showCheckoutModal();
  });
});