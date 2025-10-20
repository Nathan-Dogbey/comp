# SpeedParts - Static Spare Parts Website

This is a lightweight, production-ready, single-page static website for a small vehicle spare-parts business. It is built with plain HTML, CSS, and vanilla JavaScript, with no frameworks or build tools, making it fast, easy to deploy, and simple to manage.

## Features

- **Product Catalog:** Displays products from a simple `products.json` file.
- **Client-Side Cart:** "Add to Cart" functionality with a persistent cart using `localStorage`.
- **Cart UI:** A mini cart icon with a badge count and a slide-in cart drawer.
- **Search & Filter:** Instantly search by name/part number and filter by make/condition.
- **Checkout Flow:**
    1.  Opens a pre-filled **WhatsApp** message to the seller.
    2.  Submits the order to a **form endpoint** (like Formspree/Getform) to be received via email.
    3.  Includes a `mailto:` fallback if the form endpoint is not configured.
- **Fully Responsive:** Modern, mobile-first design that looks great on all devices.
- **Easy to Edit:** Product information can be updated by editing the `products.json` file.
- **Zero Dependencies:** Runs in any modern browser without a build step.

---

## How to Use & Edit

This site is designed to be managed by someone with minimal technical knowledge.

### 1. Editing Product Information

All product data is stored in the `assets/products.json` file. To add, remove, or change products, simply edit this file with a text editor.

**Product Schema:**

Each product is an object with the following structure:

```json
{
  "id": 1,
  "name": "Front Brake Pads (Toyota Corolla 2006-2016)",
  "part_number": "BP-TY-001",
  "price": 180.00,
  "currency": "GHS",
  "condition": "new", // "new" or "used"
  "make": "Toyota",
  "model": "Corolla",
  "year": "2006-2016",
  "stock": 12,
  "images": ["assets/images/brake1.jpg"],
  "description": "High-friction ceramic brake pads..."
}
```

- **`id`**: A unique number for each product.
- **`images`**: A list containing the path to the product image. Place your images in the `assets/images/` folder and update the path here.
- **`stock`**: The number of items available. The "Add to Cart" button will be disabled if stock is 0.

### 2. Setting Up Your Contact Details

You need to configure your WhatsApp number and (optionally) a form endpoint to receive orders.

1.  Open the `assets/app.js` file.
2.  Find the configuration section at the top of the file.
3.  Update the following constants:

```javascript
// --- CONFIGURATION ---
const SELLER_PHONE = '+233240000000'; // <-- CHANGE THIS to your WhatsApp number (international format)
const FORM_ENDPOINT = 'https://formspree.io/f/your_form_id'; // <-- CHANGE THIS to your form endpoint URL
const CURRENCY = 'GHS'; // <-- CHANGE THIS to your currency symbol
```

- **`SELLER_PHONE`**: Your WhatsApp number, including the country code (e.g., `+1...`, `+44...`).
- **`FORM_ENDPOINT`**: The URL you get from a service like [Formspree](https://formspree.io/) or [Getform](https://getform.io/). This is where order details will be sent. If you leave it empty (`''`), it will fall back to opening a pre-filled email draft (`mailto:`).

---

## Deployment

This site can be deployed for free on services like Netlify or Vercel in under a minute.

### Option 1: Drag and Drop (Easiest)

1.  Zip the `speedparts-static` folder.
2.  Go to [Netlify](https://app.netlify.com/drop) or [Vercel](https://vercel.com/new).
3.  Drag and drop the zipped folder into their deployment area.
4.  Your site will be live!

### Option 2: Using GitHub

1.  Create a new repository on [GitHub](https://github.com) and upload the contents of the `speedparts-static` folder to it.
2.  Sign up for Netlify or Vercel and connect your GitHub account.
3.  Choose the repository you just created.
4.  The build settings are usually detected automatically. If not, just confirm the root directory is correct.
5.  Deploy the site. Future changes pushed to your GitHub repository will be deployed automatically.

---

## Troubleshooting & Local Testing

-   **CORS Error when testing locally:** When you open `index.html` directly in your browser (`file:///...`), fetching `products.json` may be blocked by a security policy (CORS). To fix this, you need to run a simple local server.
    -   If you have Python: `python -m http.server`
    -   If you have Node.js: `npx serve`
    -   Then open `http://localhost:8000` (or the address shown) in your browser.

-   **Simulating a Form Endpoint:** To test the form submission without a real endpoint, you can use a service like [Beeceptor](https://beeceptor.com/) to create a temporary, free endpoint that shows you the data it receives.

---

## Acceptance Test Checklist

You can use this checklist to verify that everything is working correctly:

-   [ ] **Page Load:** The page loads and displays products from `assets/products.json`.
-   [ ] **Search:** Searching for a product name (e.g., "Brake Pads") or part number correctly filters the grid.
-   [ ] **Filter:** Filtering by "Make" or "Condition" updates the product list.
-   [ ] **Add to Cart:** Clicking "Add to Cart" adds the item to the cart and updates the cart badge.
-   [ ] **Stock Limit:** You cannot add more items to the cart than the available `stock`.
-   [ ] **Cart Persistence:** The cart contents remain after reloading the page.
-   [ ] **Cart Drawer:**
    -   [ ] The cart drawer opens and shows the correct items.
    -   [ ] You can change item quantities.
    -   [ ] You can remove items from the cart.
    -   [ ] The subtotal and total are calculated correctly.
-   [ ] **Checkout:**
    -   [ ] The checkout form appears.
    -   [ ] Clicking "Place Order" opens WhatsApp with a pre-filled, detailed order message.
    -   [ ] The order data is also POSTed to your configured `FORM_ENDPOINT` (or falls back to `mailto:`).
    -   [ ] The cart is cleared after a successful order.
-   [ ] **Accessibility:**
    -   [ ] Modals and drawers can be closed with the `Esc` key.
    -   [ ] Focus is managed correctly when a modal or drawer is opened.
-   [ ] **Responsiveness:** The site looks good on both desktop and mobile screen sizes.
