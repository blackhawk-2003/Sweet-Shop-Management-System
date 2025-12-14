# 🍬 Sweet Shop Management System

<div align="center">

![Sweet Shop](https://img.shields.io/badge/Sweet%20Shop-Management%20System-FFD700?style=for-the-badge&logo=candy&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TDD](https://img.shields.io/badge/TDD-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

A full-stack **Sweet Shop Management System** built with modern web technologies, featuring role-based authentication, comprehensive inventory management, and a beautiful, responsive user interface.

[Features](#-features) • [Setup](#-getting-started) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack) • [AI Usage](#-my-ai-usage)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running Tests](#-running-tests)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [My AI Usage](#-my-ai-usage)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Project Overview

The **Sweet Shop Management System** is a comprehensive full-stack application designed to manage a sweet shop's inventory and sales operations. Built following **Test-Driven Development (TDD)** principles, this project demonstrates modern web development practices with a focus on code quality, security, and user experience.

### Key Capabilities

**👤 For Regular Users:**

- Secure user registration and authentication
- Browse and search through available sweets
- Filter sweets by category
- Purchase sweets with real-time stock validation
- View stock availability

**👑 For Administrators:**

- Full CRUD operations on sweets inventory
- Restock functionality
- Protected admin dashboard
- Real-time inventory management
- Role-based access control

---

## ✨ Features

### 🔐 Authentication & Security

- ✅ JWT-based token authentication
- ✅ Secure password hashing with bcrypt
- ✅ Role-based access control (User/Admin)
- ✅ Protected routes on both frontend and backend
- ✅ Token expiration and validation

### 🛍️ Shopping Experience

- ✅ Beautiful, responsive UI with cream color palette
- ✅ Real-time search and filtering
- ✅ Category-based filtering
- ✅ Stock availability indicators
- ✅ Purchase functionality with quantity validation

### 📊 Admin Dashboard

- ✅ Complete inventory management (Create, Read, Update, Delete)
- ✅ Restock functionality
- ✅ Modal-based forms for adding/editing sweets
- ✅ Real-time stock updates
- ✅ Intuitive card-based layout

### 🧪 Testing & Quality

- ✅ **46 comprehensive test cases** covering all endpoints
- ✅ Test-Driven Development (TDD) approach
- ✅ High test coverage for backend logic
- ✅ Integration tests for API endpoints

---

## 🛠 Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management for authentication
- **Custom CSS** - Beautiful cream-based color palette with animations

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Jest + Supertest** - Testing framework

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Type safety
- **Git** - Version control

---

## 📁 Project Structure

```
Sweet Shop Management System/
│
├── server/                          # Backend Application
│   ├── __tests__/                   # Test files
│   │   ├── auth.test.js            # Authentication tests (9 tests)
│   │   ├── sweets.test.js          # Sweets CRUD tests (22 tests)
│   │   └── inventory.test.js       # Inventory tests (15 tests)
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── models/
│   │   ├── User.js                 # User model with password hashing
│   │   └── Sweet.js                # Sweet model
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   └── sweets.js               # Sweets & inventory routes
│   ├── index.js                    # Server entry point
│   ├── jest.config.js              # Jest configuration
│   └── package.json
│
├── client/                          # Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation component
│   │   │   └── ProtectedRoute.tsx  # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.tsx          # Login page
│   │   │   ├── Register.tsx       # Registration page
│   │   │   ├── Dashboard.tsx      # User dashboard
│   │   │   └── AdminDashboard.tsx # Admin panel
│   │   ├── services/
│   │   │   └── api.ts              # API service layer
│   │   ├── styles/
│   │   │   ├── colors.css          # Color palette
│   │   │   └── globals.css         # Global styles
│   │   └── App.tsx                 # Main app component
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

### Backend Setup

1. **Navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the `server` directory:**

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sweet-shop
   MONGODB_URI_TEST=mongodb://localhost:27017/sweet-shop-test
   JWT_SECRET=your-secret-key-change-in-production-min-32-chars
   NODE_ENV=development
   ```

   > **Note:** For MongoDB Atlas, use your connection string:
   >
   > ```
   > MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sweet-shop
   > ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The backend server will run on `http://localhost:3000`

5. **Verify the server is running:**
   ```bash
   curl http://localhost:3000
   # Should return: "Sweet Shop Management System API"
   ```

### Frontend Setup

1. **Navigate to the client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the `client` directory:**

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will automatically open at `http://localhost:5173`

### Running Both Servers

For the best development experience, run both servers simultaneously:

**Terminal 1 (Backend):**

```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**

```bash
cd client
npm run dev
```

---

## 🧪 Running Tests

The backend includes comprehensive test suites written with Jest and Supertest.

### Run All Tests

```bash
cd server
npm run test:ci
```

### Run Specific Test Suites

```bash
# Authentication tests
npm run test:ci -- __tests__/auth.test.js

# Sweets CRUD tests
npm run test:ci -- __tests__/sweets.test.js

# Inventory tests
npm run test:ci -- __tests__/inventory.test.js
```

### Test Coverage

- **Authentication:** 9 test cases
- **Sweets Management:** 22 test cases
- **Inventory Operations:** 15 test cases
- **Total:** 46 test cases, all passing ✅

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Sweets (Protected)

- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/search` - Search sweets (name, category, price range)
- `POST /api/sweets` - Create a new sweet (requires authentication)
- `PUT /api/sweets/:id` - Update a sweet
- `DELETE /api/sweets/:id` - Delete a sweet (Admin only)

### Inventory (Protected)

- `POST /api/sweets/:id/purchase` - Purchase a sweet (decreases quantity)
- `POST /api/sweets/:id/restock` - Restock a sweet (Admin only, increases quantity)

---

## 📸 Screenshots

### Login Page

<img width="3807" height="2271" alt="image" src="https://github.com/user-attachments/assets/a451a4c1-3920-41fe-92cb-68d3630e9f47" />

_Beautiful login interface with cream color palette and smooth animations_

### User Dashboard

<img width="3125" height="2275" alt="image" src="https://github.com/user-attachments/assets/b9f6a911-3018-4aed-903a-6aa1df70d8b9" />

_Browse and search sweets with real-time stock information_

### Admin Dashboard

<img width="3358" height="2247" alt="image" src="https://github.com/user-attachments/assets/4af1c9aa-8c58-4a7f-a881-c522b06af91b" />

_Complete inventory management interface for administrators_

### Purchase Flow

<img width="3624" height="1952" alt="image" src="https://github.com/user-attachments/assets/3d9897fb-fb12-4721-baff-4480c1a4134f" />

_Seamless purchase experience with stock validation_

---

## 🤖 My AI Usage

### Overview

Throughout the development of this Sweet Shop Management System, I strategically leveraged AI tools to enhance productivity, improve code quality, and accelerate the development process. This section details my AI-assisted workflow and reflections on its impact.

### AI Tools Used

1. **GitHub Copilot** (Code Completion)
   - Provided intelligent code suggestions during development
   - Assisted with boilerplate code generation
   - Helped with test case structure and API endpoint implementations

### How AI Was Used

#### 1. **Test-Driven Development (TDD) Implementation**

**AI Assistance:**

- Leveraged AI suggestions for structuring test suites following Jest best practices

**Impact:** This approach ensured 100% test coverage for authentication logic before writing a single line of implementation code, strictly following the TDD Red-Green-Refactor cycle.

#### 2. **API Service Layer Architecture**

**AI Assistance:**

- Leveraged AI suggestions for error handling patterns and token management

**Impact:** The AI-generated service layer provided a robust, maintainable foundation that eliminated repetitive code and ensured type safety across the frontend.

#### 3. **UI Design System & Color Palette**

**AI Assistance:**

- Asked AI to suggest a unique, elegant color palette based on cream tones
- Used AI to generate CSS custom properties for a cohesive design system

**Impact:** The AI-suggested color scheme created a unique, warm, and inviting aesthetic that perfectly matched the sweet shop theme, resulting in a distinctive visual identity.

#### 4. **Error Handling & Edge Cases**

**AI Assistance:**

- Consulted AI to identify potential edge cases in purchase and restock operations
- Used AI to generate comprehensive error messages and validation logic

**Impact:** The AI-assisted error handling ensured robust application behavior, preventing common bugs and improving user experience.

### Reflection on AI Impact

#### Positive Impacts

1. **Accelerated Development:** AI tools significantly reduced the time spent on boilerplate code and repetitive tasks. What would have taken hours to implement manually was completed in minutes with AI assistance.

2. **Code Quality:** AI suggestions often followed best practices and modern patterns, leading to cleaner, more maintainable code. The TypeScript interfaces and error handling patterns suggested by AI were particularly valuable.

3. **Learning Enhancement:** Working with AI provided opportunities to learn new patterns and approaches. When AI suggested a particular implementation, I would research why it was recommended, deepening my understanding.

4. **Test Coverage:** AI was instrumental in generating comprehensive test cases, ensuring we didn't miss edge cases and maintaining high test coverage throughout the project.

5. **Design Consistency:** AI helped maintain design consistency across all pages by suggesting reusable CSS patterns and color variables, resulting in a cohesive user interface.

#### Challenges & Considerations

1. **Over-reliance Risk:** There were moments when I had to step back and ensure I understood the AI-generated code rather than blindly accepting it. This required active learning and verification.

2. **Context Limitations:** Sometimes AI suggestions needed refinement to fit the specific project requirements. Not all AI-generated code was immediately usable without modification.

3. **Debugging Complexity:** When AI-generated code had issues, debugging could be more challenging since I hadn't written it from scratch. This required careful code review and understanding.

#### Key Takeaways

The integration of AI tools into my development workflow was transformative. It allowed me to focus on higher-level problem-solving and architecture while AI handled routine implementation details. The most valuable aspect was how AI helped maintain consistency—whether in code style, design patterns, or test structure—across the entire project.

However, the most important lesson was that AI is a powerful **assistant**, not a replacement for understanding. Every AI-generated piece of code was reviewed, understood, and often refined to ensure it met our specific requirements and followed best practices.

**Final Note:** This project demonstrates that AI can be a powerful tool in modern software development when used thoughtfully and strategically, enhancing productivity while maintaining code quality and developer understanding.

---

## 🚀 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Order history and tracking for users
- [ ] Admin analytics dashboard with sales reports
- [ ] Email notifications for order confirmations
- [ ] Shopping cart functionality
- [ ] Wishlist feature
- [ ] Product reviews and ratings
- [ ] Image upload for sweets
- [ ] Advanced search with filters (price range, availability)
- [ ] Pagination for large inventories
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Deployment to cloud platforms (Vercel/Netlify for frontend, Railway/Heroku for backend)

---

## 📄 License

This project is created for **educational and demonstration purposes** as part of a TDD Kata exercise.

---

## 👏 Acknowledgments

- Built following Test-Driven Development (TDD) best practices
- Inspired by modern full-stack development patterns
- Designed with user experience and code quality in mind

---

<div align="center">

**Made with ❤️ and lots of 🍬**

[⬆ Back to Top](#-sweet-shop-management-system)

</div>
