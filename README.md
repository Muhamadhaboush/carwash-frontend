# Car Wash Management System - Frontend Interface

![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8.svg)
![i18next](https://img.shields.io/badge/i18next-Multi--Language-success.svg)

This is the modern, responsive frontend application for the Car Wash and Valet Management System. It provides intuitive dashboards for both customers and administrators.

## Features
- **Multi-Language Support (i18n):** Full localization support (English & Turkish) allowing users to switch languages dynamically.
- **Responsive Design:** A premium, mobile-first UI built with Tailwind CSS, featuring dark mode support and glassmorphism elements.
- **Customer Portal:** Allows users to manage vehicles, addresses, track appointment statuses, and initiate secure payments.
- **Admin Dashboard:** Comprehensive control panel for managing services, viewing revenue analytics, processing corporate agreements, and updating appointment statuses (Pending -> Approved -> Completed).
- **Secure Routing:** Protected routes using React Router and JWT-based authentication states via Axios interceptors.
- **WhatsApp Integration:** Direct communication links embedded in the UI for quick customer support.

## Tech Stack
- **Core:** React 18, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **State & Data Fetching:** React Hooks, Axios
- **Routing:** React Router DOM
- **Localization:** react-i18next
- **Notifications:** React Hot Toast

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
