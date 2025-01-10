async function fetchProducts() {
    try {
      const response = await fetch('data/products.json');
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
  
export { fetchProducts };