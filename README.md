<!--
# Body Build House - Backend

This is the backend server for the **Body Build House** web application. It is built using **Node.js**, **Express.js**, and **MongoDB**, and supports **JWT-based authentication** with role-based access. The system allows users to register, manage classes, trainers, payments, forums, reviews, and more. It also integrates **Stripe** for secure payment processing.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [License](#license)

---

## Features

- User registration and authentication (JWT-based)
- Role management (Admin, Trainer, Member)
- Add, update, and fetch fitness classes
- Apply as a trainer and manage trainer slots
- Manage payments with Stripe integration
- Forum system (post, vote, view discussions)
- Add reviews and testimonials
- Subscription management
- Pagination and search support
- Protected routes for authenticated users
- Admin-only routes with role-based restrictions

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
- Stripe (Payments)
- CORS
- Morgan (Logger)
- dotenv (Environment variables)

---

## Installation

### Server Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/shorifulbd1st/Hotel-Rose-Server-Side.git
   cd body-build-house-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   node index.js
   ```

   --- OR ---

   ```bash
   nodemon index.js
   ```

4. Open the project in a code editor:
   ```bash
   code .
   ```
5. Add the `.env` file in the root directory and include the following environment variables:
   ```bash
   DB_USER=.....................
   DB_PASS=.....................
   ACCESS_TOKEN_SECRET=.........
   STRIPE_SECRET_KEY=...........
   ```

### API Endpoints
Running the Server
node index.js


Or with nodemon for development:

nodemon index.js


Server will run on:

http://localhost:5000

API Endpoints
## - Authentication

POST /jwt → Generate JWT token

GET /user/admin/:email → Check admin role

## - Users

POST /users → Register new user

GET /user → Get all users

GET /user/:email → Get user by email

PATCH /user/:email → Update user role

## - Classes

GET /class → Get all classes

GET /class/:id → Get class by ID

GET /all-class?page=&size= → Paginated classes

POST /class (Admin only) → Add new class

PATCH /class-update/:id → Update class count

GET /top-class → Get top 6 classes

GET /class-name?search= → Search classes by name

## - Trainers

POST /trainer-register → Apply as trainer

GET /trainer-register/:email → Get trainer application by email

GET /apply-trainers → Get all trainer applications

DELETE /apply-trainers/:id → Delete trainer application

POST /trainer → Add trainer

GET /trainer → Get all trainers

GET /trainer/:id → Get trainer by ID

PATCH /add-slot → Add class slots for a trainer

DELETE /trainer/:id → Remove trainer

## - Payments

POST /create-payment-intent → Create Stripe payment intent

POST /payment → Save payment

GET /payment → Get latest 6 payments + total revenue

GET /payment/:email → Get payments by user email

## - Forum

POST /addNewForum → Add new forum post

GET /NewForum → Get all forums

GET /top-NewForum → Get top 6 forums

PATCH /forum-update/:id → Update votes on forum post

GET /forum-details/:id → Get forum post details

## - Reviews & Testimonials

POST /review → Add review

GET /review/:email → Get review by email

POST /testimonial → Add testimonial

GET /testimonials → Get all testimonials

## - Subscriptions

POST /subscribe → Add subscriber

GET /subscribe → Get all subscribers
## 🧑‍💻 Authors

- Shoriful Islam (Lead Developer)
- Lead Developer & Maintainer
- Connect with me on [_Portfolio_](https://shoriful1st-portfolio.netlify.app/) -->
