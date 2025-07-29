# Revibes Backend

This repository contains the backend source code for the Revibes project, built with Node.js, Express, Firebase, and TypeScript.

## Project Structure

```

functions/

  └── src/

      ├── controllers/         # Business logic for resources (e.g., Inventory, Voucher, Country)

      ├── dto/                 # Data transfer objects and validation schemas

      ├── handlers/            # HTTP route handlers

      ├── middlewares/         # Express middlewares (auth, error handling, etc.)

      ├── models/              # Data models (User, InventoryItem, etc.)

      ├── utils/               # Utility functions (formatters, i18n, firebase, etc.)

      └── constant/            # Constants and configuration

```

## Main Features

* **Authentication & Authorization:** Secures endpoints using JWT and Firebase Auth, managing user access and permissions.
* **Inventory Management:** Provides comprehensive CRUD (Create, Read, Update, Delete) operations for inventory items, including seamless image handling via Firebase Storage.
* **Voucher System:** Enables the creation, editing, and validation of promotional vouchers, complete with configurable claim periods.
* **Daily Missions:** Manages daily challenges and tasks for users, integrating with the reward system.
* **App Banner Management:** Supports the dynamic creation, updating, and display of in-app banners.
* **Point & Reward System:** Tracks user points and facilitates the distribution of rewards based on completed actions or achieved milestones.
* **Country & Logistic Management:** Handles country-specific data and provides support for logistic order processing.
* **Error Handling & Validation:** Features centralized error formatting and robust request validation using Zod for consistent and reliable API responses.
* **Internationalization (i18n):** Offers multi-language support for both error and success messages, enhancing global user experience.

## Getting Started

Api documentation:

https://www.postman.com/blue-sunset-9254/revibes/collection/zum1xp2/revibes?action=share&creator=7070614

### Prerequisites

- Node.js (v18+ recommended)
- Firebase project (Firestore & Storage enabled)
- Service account credentials for Firebase Admin SDK

### Installation

1. Clone the repository:

   ```sh

   git clone https://github.com/your-org/Revibes-Backend.git

   cd Revibes-Backend/functions

   ```
2. Install dependencies:

   ```sh

   npm install

   ```
3. Set up environment variables:

   - Copy `.env.example` to `.env` and fill in your Firebase and other secrets.
4. Add your Firebase service account key to `functions/src/utils/firebase/serviceAccount.json`.

### Running Locally

Start the development server:

```sh

npm run serve

```

### Deploying to Firebase

Deploy functions to Firebase:

```sh
npm run deploy
```
