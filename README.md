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

### 2. Dashboard
- Displays inventory information
- Shows reservation statistics
- Provides an overview of system activities

### 3. Inventory Management
- View available inventory items
- Add new inventory items
- Edit existing inventory information
- Delete inventory items
- Monitor item quantities and availability

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

## Frontend Technologies

- HTML5
- CSS3
- Bootstrap 5
- JavaScript

## Backend Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure

```text
EVENTUALLY-DONE-LOCAL/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── public/
│   │   └── css/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── items.html
│   ├── reservations.html
│   └── checklists.html
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

The pages and interactions are designed to support the system's planned functions and user workflows.

## Alignment with the Entity Relationship Diagram (ERD)

The frontend forms and displayed information correspond to the system's data entities:

- **User:** Account registration, login, and profile information.
- **Item:** Item name, category, quantity, available quantity, and status.
- **Reservation:** Event name, selected item, quantity, event date, description, and reservation status.
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
**Section:** BSIS 2A  
**Project Type:** Web-Based Event Inventory and Reservation Management System  
**Course:** Web Systems

Developed as part of the Web Systems course by BSIS 2A.