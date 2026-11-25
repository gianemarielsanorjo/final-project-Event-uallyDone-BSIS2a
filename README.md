# EVENT-UALLY DONE
### Event Inventory and Reservation Management System

## Project Description

EVENT-UALLY DONE is a web-based Event Inventory and Reservation Management System developed by BSIS 2A. It helps organize, monitor, and manage event materials and equipment such as laptops, phones, projectors, and other resources needed for school events.

The system provides a centralized platform for managing inventory, handling reservations, and monitoring event-related resources.

## Implemented Features

### 1. User Authentication
- User registration
- User login
- User profile page
- Role-based access control
- Password validation and security

### 2. Dashboard
- Displays inventory information
- Shows reservation statistics
- Provides an overview of system activities

### 3. Inventory Management
- View inventory items dynamically from the backend
- Add new inventory items
- Edit existing inventory information
- Delete inventory items
- Monitor item quantities and availability
- Search inventory records
- Filter items by category and status
- Display inventory summary cards

### 4. Reservation Management
- Create new reservations
- Select inventory items
- Enter event details and event dates
- Validate requested quantities against available stock
- View submitted reservations
- Monitor reservation status

### 5. Checklist Management
- View event checklist items
- Mark checklist tasks as completed

### 6. Product Management
- Add and retrieve product records
- Store product names, prices, and descriptions

### 7. Data Retrieval and Display (Phase 5)
- Retrieve backend records using JavaScript Fetch API
- Display inventory data dynamically on the frontend
- Use DOM manipulation to update displayed records
- Implement search and filtering functionality
- Connect frontend pages to backend API endpoints
- Support inventory CRUD operations through API requests

### 8. Web Security
- Input validation
- XSS prevention and sanitization
- Password validation
- Helmet security headers
- Login rate limiting
- Protected routes using authentication middleware

## Frontend Technologies

- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- Fetch API
- DOM Manipulation

## Backend Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Express Validator
- Helmet
- Express Rate Limit
- XSS

## API Endpoints

The following GET endpoints were tested and returned JSON responses:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Retrieves user records |
| GET | `/api/products` | Retrieves product records |
| GET | `/api/orders` | Retrieves order records |
| GET | `/api/items` | Retrieves inventory records |

Other API operations support user authentication, inventory management, reservations, and product management.

## Project Structure

```text
EVENTUALLY-DONE-LOCAL/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── public/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── items.html
│   ├── add-product.html
│   ├── reservations.html
│   ├── checklists.html
│   └── js/
│       └── items.js
├── database/
├── docs/
├── README.md
└── .gitignore
```

## Alignment with the Use Case Diagram

The implemented frontend pages support the planned user interactions of EVENT-UALLY DONE.

- Users can register and log in.
- Users can view their dashboard and profile.
- Users can manage inventory records.
- Users can submit and view equipment reservations.
- Users can monitor event checklist tasks.

## Alignment with the Entity Relationship Diagram (ERD)

The frontend forms and displayed information correspond to the system's data entities:

- **User:** Account registration, login, and profile information.
- **Item:** Item name, category, quantity, available quantity, and status.
- **Reservation:** Event name, selected item, quantity, event date, description, and reservation status.
- **Product:** Product name, price, description, and creator.
- **Order:** User reference, ordered items, quantities, and total amount.
- **Checklist:** Event-related tasks and completion status.

## How to Run the Project

1. Clone or download the project repository.
2. Open the project folder in Visual Studio Code.
3. Open the terminal and navigate to the backend folder:

   ```bash
   cd backend
   ```

4. Install the required dependencies:

   ```bash
   npm install
   ```

5. Configure the MongoDB connection and environment variables in the `.env` file.
6. Start the backend server:

   ```bash
   npm run dev
   ```

7. Open your browser and visit:

   ```text
   http://localhost:3000
   ```

## Project Information

**Project Name:** EVENT-UALLY DONE  
**Group Name:** Event Handlers  
**Section:** BSIS 2A  
**Project Type:** Web-Based Event Inventory and Reservation Management System  
**Course:** IT 112 – Web Systems and Technologies

Developed as part of the Web Systems and Technologies course by BSIS 2A.
