# Car Wash Management System - Frontend Interface

![React](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8.svg)
![i18next](https://img.shields.io/badge/i18next-Multi--Language-success.svg)

This is the modern, responsive frontend application for the **Car Wash and Valet Management System**. It provides intuitive, high-performance dashboards that bridge the gap between auto garage administrators and their customers.

## Project Overview & User Experience
The platform is designed to provide a premium digital experience for car wash customers while giving administrators full control over their daily operations.

**For Customers:**
- **Digital Garage:** Users can add and manage multiple vehicles (tracking license plates, brands, and models) and personal addresses for valet pickups.
- **Seamless Booking Flow:** A step-by-step appointment booking system where users select their vehicle, desired service, delivery method (Valet or Self Drop-off), and an available time slot.
- **Secure Payments:** Integrated checkout flow equipped to handle Virtual POS (e.g., PayTR) API integrations, updating the appointment status in real-time.
- **Localization:** Full bilingual support (English & Turkish) to cater to a broader demographic.

**For Administrators:**
- **Daily Operations Dashboard:** A centralized hub to track total daily revenue, view upcoming appointments, and monitor the most popular wash services.
- **Workflow Management:** Admins can transition appointments through various stages (`Pending` -> `Approved` -> `Completed`) with a single click, automatically triggering backend email notifications to the customer.
- **Corporate Client Management:** Interface to set up custom pricing agreements for B2B corporate accounts.

## Tech Stack
- **Core:** React 18, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **State & Data Fetching:** React Hooks, Axios with secure JWT Interceptors
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
