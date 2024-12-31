// Constant variable for the CSV URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_DTbWdGZ3eB4_PbsUcI0RYlvHaDG6AsJXHybYlE38mvCYXyR5b82VqbHhHCjEh0PMOc0YheJOJTqk/pub?gid=0&single=true&output=csv';

// Function to load products from CSV
async function loadProducts() {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const products = parseCSV(csvText);
    displayProducts(products);
}

// Parse the CSV into an array of objects
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim().length > 0);
    const headers = lines[0]
    .split(',')
    .map(header => header.replace(/^\"|\"$/g, '').trim())  // First remove quotes and trim
    .map(header => header.replace(/^\"|\"$/g, '').trim());  // Second remove quotes and trim again


    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.replace(/^\"|\"$/g, '').trim());
        const product = {};
        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });
        return product;
    }).filter(product => product);
}

// Display products in grid
function displayProducts(products) {
    console.log(products);
    const productGrid = document.getElementById('product-grid');
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card'; // This will apply the font to the product card

        // Adding font to the dynamically created product info section
        const productImage = product.product_image ? product.product_image : 'https://via.placeholder.com/300';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${productImage}" alt="${product.product_name}">
            </div>
            <div class="product-info">
                <h3 id="${product.product_name}">${product.product_name}</h3>
                <p>${product.product_description}</p>
                <p class="price">$${product.product_price}</p>
                <button class="add-to-cart" data-product-name="${product.product_name}" data-product-price="${product.product_price}">Agregar al carrito</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });

    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}


// Function to add product to the cart
function addToCart(event) {
    const button = event.target;
    const productName = button.getAttribute('data-product-name');
    const productPrice = button.getAttribute('data-product-price');

    const product = {
        name: productName,
        price: parseFloat(productPrice),
        quantity: 1
    };

    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product is already in the cart
    const existingProduct = cart.find(item => item.name === product.name);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count and total price
    updateCart();
}

// Update cart count and total price in the header
function updateCart() {
    // Get the cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const cartCount = cart.reduce((total, product) => total + product.quantity, 0);
    const totalPrice = cart.reduce((total, product) => total + (product.price * product.quantity), 0).toFixed(2);

    // Update cart count indicator
    document.getElementById('cart-count-indicator').textContent = cartCount > 0 ? cartCount : '0';

    // Optionally, you can update the total price somewhere in the header, if needed
    document.getElementById('cart-total').textContent = totalPrice;
}

// Function to open the cart modal
function viewCart() {
    const cartItemsList = document.getElementById('cart-items');
    cartItemsList.innerHTML = ''; // Clear previous cart items

    // Get the cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Tu carrito está vacío</li>';
        const totalPrice = cart.reduce((total, product) => total + (product.price * product.quantity), 0).toFixed(2);
        document.getElementById('total-price').textContent = `Total: $${totalPrice}`;
    } else {
        // Display all products in the cart
        cart.forEach(product => {
            const listItem = document.createElement('li');
            listItem.textContent = `${product.name} - $${product.price} x ${product.quantity}`;
            cartItemsList.appendChild(listItem);
        });

        // Calculate and display total price
        const totalPrice = cart.reduce((total, product) => total + (product.price * product.quantity), 0).toFixed(2);
        document.getElementById('total-price').textContent = `Total: $${totalPrice}`;
    }

    // Show cart modal
    document.getElementById('cart-modal').style.display = 'block';
}

// Function to close the cart modal
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

function sendCartViaWhatsapp() {
    let cartDetails = "Hola! Quiero comprar los siguientes productos:\n\n";
    let total = 0;

    // Get the cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.forEach(product => {
        cartDetails += `${product.name}: $${product.price.toFixed(2)} x ${product.quantity}\n`;
        total += product.price * product.quantity;
    });

    cartDetails += `\nTotal: $${total.toFixed(2)}`;

    // Encode cart details for URL
    const message = encodeURIComponent(cartDetails);

    // Replace with your WhatsApp number
    const whatsappNumber = "+5491166734594"; // Replace with your WhatsApp number
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

    // Open WhatsApp link
    window.open(whatsappLink, '_blank');
}

// Function to empty the cart
function clearCart() {
    // Empty the cart in localStorage
    document.getElementById('cart-modal').style.display = 'none';
    localStorage.removeItem('cart');
    updateCart();
}

document.getElementById('clear-cart').addEventListener('click', clearCart);
document.getElementById('view-cart-button').addEventListener('click', viewCart);

// Load products when the page loads
window.onload = function() {
    // Reload the products and update the cart display
    loadProducts();
    updateCart();
};
