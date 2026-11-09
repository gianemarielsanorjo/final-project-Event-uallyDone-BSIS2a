# EVENT-UALLY DONE – Backend

## Project Overview

EVENT-UALLY DONE is a web-based event inventory management system designed to help manage and monitor equipment and materials used for school events.

The backend handles data storage, database connections, and API requests using Node.js, Express.js, and MongoDB.

## Technologies Used

- Node.js – JavaScript runtime environment
- Express.js – Backend web framework
- MongoDB Atlas – Cloud database
- Mongoose – MongoDB object modeling
- dotenv – Environment variable management
- Nodemon – Automatic server restarting during development
- Thunder Client – API testing

## Backend Folder Structure

```text
backend/
│
├── models/
│   ├── User.js
│   ├── Item.js
│   ├── Order.js
│   └── Product.js
│
├── routes/
│   ├── users.js
│   ├── items.js
│   ├── orders.js
│   └── products.js
│
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── seed.js
└── server.js
```

## Database Connection

The project uses MongoDB Atlas as its database.

The database connection is configured using an environment variable stored in the `.env` file.

Example:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
```

**Note:** Never upload your actual `.env` file or database credentials to GitHub.

## Current Database Models

### 1. User Model

Stores user information, including:

- full_name
- email
- password
- role
- created_at

### 2. Item Model

Stores inventory information, including:

- item_name
- category
- quantity
- available_quantity
- status

### 3. Order Model

Stores order information, including:

- user
- items
- totalAmount

The User and Item fields use MongoDB references to establish relationships.

### 4. Product Model

Stores product information, including:

- name
- price
- description
- createdBy

The createdBy field references the User model.

## API Routes

The backend currently registers the following API route groups:

| Route | Description |
|---|---|
| `/api/users` | User management |
| `/api/items` | Inventory item management |
| `/api/orders` | Order management |
| `/api/products` | Product management |
| `/api/health` | Checks server status |
| `/api/orders-list` | Retrieves orders with populated user and item details |

### Successfully Tested GET Requests

**GET /api/products**

Retrieves product records from MongoDB.

**GET /api/orders**

Retrieves order records with populated user and item information.

**GET /api/health**

Checks whether the backend server is running.

## How to Run the Backend Locally

### 1. Open the backend folder

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add your MongoDB connection string and port number.

### 4. Start the server

```bash
node server.js
```

If the connection is successful, the terminal displays:

```text
MongoDB connected!
Database: test
Server running on port 3000
```

### 5. Test the API

Open Thunder Client or Postman and use:

```text
http://localhost:3000/api/health
http://localhost:3000/api/products
http://localhost:3000/api/orders
```

## Database Seeding

The project includes a `seed.js` file to insert sample user, item, and order records into the MongoDB database.

To run the seed file:

```bash
node seed.js
```

## API Testing

Thunder Client was used to test the backend API endpoints.

The following GET requests were successfully tested:

- GET `/api/products` – Retrieved Laptop and Phone product records.
- GET `/api/orders` – Retrieved an order with populated user and item information.

Both requests returned successful HTTP 200 OK responses.

## Project Repository

GitHub Repository:

https://github.com/gianemarielsanorjo/final-project-Event-uallyDone-BSIS2a

## Phase 3 – Backend Development and API Integration

### Database Configuration

The MongoDB database connection was separated from the main server file and transferred to:

- `config/db.js` – Handles the MongoDB connection.

### MVC Structure

The backend was organized using the Model-View-Controller (MVC) approach.

- **Model:** Handles database schemas and data.
- **View:** Handles the frontend interface.
- **Controller:** Handles the application logic and CRUD operations.
- **Routes:** Defines API endpoints and connects them to the appropriate controllers.

### User Controller

The user CRUD logic was transferred to `controllers/usersController.js`.

### User API CRUD Testing

The following endpoints were successfully tested using Thunder Client:

| Method | Endpoint | Result |
|---|---|---|
| GET | `/api/users` | Successfully retrieved users |
| POST | `/api/users` | Successfully created a user |
| PUT | `/api/users/:id` | Successfully updated a user |
| DELETE | `/api/users/:id` | Successfully deleted a user |

### Testing Results

All four CRUD operations returned successful responses.

- GET returned existing user records.
- POST created Maria Santos successfully.
- PUT updated Maria Santos's name and email.
- DELETE removed Maria Santos from the database.
- A final GET request confirmed that the deleted user no longer appeared in the records.

Passwords were not included in the returned user information.

### Phase 3 Status

Database connection configuration, MVC organization, and User API CRUD operations were successfully implemented and tested.


Project: EVENT-UALLY DONE  
Course: IS Elec 2 – Web Systems and Technologies  
Section: BSIS 2A  
Group: Event Handlers