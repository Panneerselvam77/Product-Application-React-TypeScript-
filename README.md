# Storefront

A React e-commerce storefront for browsing products, viewing product details, managing a shopping cart, and stepping through checkout.

## Features

- Browse products with paginated loading
- Search products from the navigation bar
- View product details, images, stock status, specifications, and reviews
- Add products to the cart, change quantities, remove items, or clear the cart
- Review cart totals and proceed through checkout
- View order and payment confirmation states
- Responsive UI styled with CSS and Bootstrap components

> Product data and order actions use DummyJSON. This is a practice/demo project; it does not process real payments or provide production order persistence.

## Tech stack

- **React 19** — component-based UI
- **TypeScript** — typed application code
- **Vite** — development server and production build
- **React Router** — client-side routing
- **Redux Toolkit and React Redux** — application state and async actions
- **Axios** — HTTP requests to DummyJSON
- **Bootstrap and React Bootstrap** — styling utilities and UI components
- **ESLint** — code linting

## Getting started

### Requirements

- Node.js and npm

### Install dependencies

```bash
npm install

npm run dev

npm run build

npm run lint

npm run preview



├── public/
├── src/
│   ├── api/
│   │   └── apiClient.ts
│   ├── component/
│   │   ├── NavBar.tsx
│   │   ├── ProductCard.tsx
│   │   └── SpinningLoader.tsx
│   ├── css/
│   │   ├── Cart.css
│   │   ├── CheckOutPage.css
│   │   ├── NavBar.css
│   │   ├── PlaceOrder.css
│   │   ├── ProductCard.css
│   │   └── Productdetailspage.css
│   ├── hooks/
│   │   ├── hooks.ts
│   │   ├── useDebounce.ts
│   │   └── useThrottle.ts
│   ├── Layout/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Cart.tsx
│   │   ├── CheckOutPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── PlaceOrder.tsx
│   │   └── ProductDetailsPage.tsx
│   ├── redux/
│   │   ├── features/
│   │   │   ├── cartSlice.ts
│   │   │   ├── checkoutSlice.ts
│   │   │   ├── placeorderSlice.ts
│   │   │   ├── productSlice.ts
│   │   │   └── userSlice.ts
│   │   └── store.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
└── README.md
```
