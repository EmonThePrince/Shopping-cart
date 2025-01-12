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

let appliedPromoCode = null;

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
        <div class="form-group">
          <label for="promo-code">Promo Code</label>
          <input type="text" id="promo-code">
          <button type="button" id="apply-promo">Apply</button>
        </div>
        <div id="discount-summary">
          <p>Subtotal: $<span id="subtotal">0.00</span></p>
          <p>Discount: -$<span id="discount">0.00</span></p>
          <p><strong>Total: $<span id="final-total">0.00</span></strong></p>
        </div>
        <button type="submit">Complete Order</button>
        <button type="button" class="cancel-checkout">Cancel</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('#checkout-form');
  const cancelButton = modal.querySelector('.cancel-checkout');
  const applyPromoButton = modal.querySelector('#apply-promo');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const total = calculateDiscountedTotal();
    
    modal.remove();
    showOrderConfirmation(total);

    clearCart();
    appliedPromoCode = null; // Reset promo code after successful checkout
    updateCartUI();
  });

  applyPromoButton.addEventListener('click', () => {
    const promoCodeInput = modal.querySelector('#promo-code');
    const promoCode = promoCodeInput.value.trim().toLowerCase();
    applyPromoCode(promoCode);
    updateCheckoutSummary();
  });

  cancelButton.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  updateCheckoutSummary();
}

function calculateDiscountedTotal() {
  const subtotal = calculateTotal(productsCache);
  let discount = 0;

  if (appliedPromoCode === 'ostad10') discount = subtotal * 0.10;
  if (appliedPromoCode === 'ostad5') discount = subtotal * 0.05;

  return subtotal - discount;
}

function applyPromoCode(promoCode) {
  if (appliedPromoCode) {
    showError('Promo code already applied');
    return;
  }

  if (promoCode === 'ostad10' || promoCode === 'ostad5') {
    appliedPromoCode = promoCode;
    showSuccess(`Promo code "${promoCode}" applied successfully`);
  } else {
    showError('Invalid promo code');
  }
}

function updateCheckoutSummary() {
  const subtotal = calculateTotal(productsCache);
  const total = calculateDiscountedTotal();
  const discount = subtotal - total;

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('discount').textContent = discount.toFixed(2);
  document.getElementById('final-total').textContent = total.toFixed(2);
}

function showSuccess(message) {
  alert(message); 
}

function showError(message) {
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





