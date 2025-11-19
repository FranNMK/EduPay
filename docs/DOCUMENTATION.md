<p align="center">
  <img src="../Assets/Images/logo edu pay.jpg" alt="EduPay Logo" width="120">
</p>

<p align="center" font-size="80px">
   EduPay - Project Documentation
</p>

<p align="center">
  Welcome to the official documentation for EduPay, a smart digital fees payment and management system. This document provides a deep dive into the project's architecture, features, and future roadmap.
</p>

---

## 1. Introduction

**EduPay** is a robust and secure platform designed to simplify the process of fee payment and management for schools, colleges, and other educational institutions. It provides an intuitive interface for administrators to manage student fees, track payments, and generate reports, while offering parents and students a convenient way to pay fees online.

The backend is built with Node.js and Express.js, providing a RESTful API for a frontend client to consume.

---

## 2. Core Technologies

The backend stack consists of:

*   **Runtime Environment:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB with Mongoose as the ODM (Object Data Modeling) library.
*   **Authentication:** JSON Web Tokens (JWT) for securing API endpoints.
*   **Security:** bcryptjs for hashing user passwords before storing them.
*   **Environment Management:** dotenv for managing environment variables.
*   **CORS:** cors middleware to enable Cross-Origin Resource Sharing.

---

## 3. How It Works: Current Features

The system is designed around a set of core features that are accessible via API endpoints.

### 3.1 Secure User Authentication

*   **How it works:** The system employs a token-based authentication mechanism with differentiated login flows based on user roles:
    *   **For Administrators:** Admins will log in using a traditional username/email and password combination. Upon successful validation, their password (encrypted using `bcryptjs`) is verified against the stored hash. A JSON Web Token (JWT) signed with a secret key (`JWT_SECRET`) is then generated and sent back to the client.
    *   **For Parents (and potentially Students):** Parents will use an OTP (One-Time Password) sent to their registered email address for login. When a parent initiates a login, the system generates a unique OTP and sends it to their email. The parent then enters this OTP, which is validated by the server. Upon successful OTP verification, a JWT is generated and sent to the client. This method enhances convenience and security by eliminating the need for parents to remember complex passwords.
*   **API Usage:** For subsequent requests to protected routes, the client must include this JWT in the `Authorization` header (e.g., `Authorization: Bearer <token>`). A middleware on the server verifies the token's validity before granting access to the requested resource.
*   **Roles:** The system is designed to support different user roles (e.g., 'admin', 'student'). The user's role is encoded within the JWT payload, allowing the backend to enforce role-based access control (RBAC) on different API endpoints.

    *   **Note:** The implementation for OTP via email will require integration with an email service provider (e.g., SendGrid, Nodemailer) to send the OTPs.

### 3.2 Student & Fee Management (Admin)

*   **How it works:** Administrators have exclusive access to endpoints that allow them to perform CRUD (Create, Read, Update, Delete) operations on student records. They can also define and manage fee structures.
*   **Data Models:**
    *   A `Student` model likely contains information like name, admission number, class, and parent details.
    *   A `FeeStructure` model would define different types of fees (e.g., tuition, library, sports, exam) and their amounts, possibly on a per-class or per-student basis.
    *   A `Fee` model would link students to their assigned fees for a specific academic period, including due dates and status (e.g., 'paid', 'unpaid', 'overdue').

### 3.3 Online Payments

*   **How it works:** This feature allows students or parents to pay fees through a client application. The client would integrate with a payment gateway (like Stripe, PayPal, or a local provider).
*   **Process Flow:**
    1.  A student/parent logs in and views their outstanding fees.
    2.  They initiate a payment, and the client application communicates with the chosen payment gateway to process the transaction.
    3.  Upon successful payment, the payment gateway sends a confirmation to the client and/or a webhook notification to the EduPay backend.
    4.  The backend verifies the payment and updates the corresponding fee record in the database to 'paid', generating a transaction record.

### 3.4 Payment Tracking and History

*   **How it works:** All transactions are logged in the database. Users can view their complete payment history, including dates, amounts paid, and transaction IDs. They can also download receipts for their payments.
*   **Receipts:** The backend can generate a receipt (e.g., as a PDF or simple HTML) for each successful transaction, which can be downloaded by the user.

---

## 4. Future Advanced Features (Roadmap)

The following features are planned for future development to enhance the capabilities of EduPay.

### 4.1 Automated Reminders & Notifications

*   **Concept:** Implement an automated system to send reminders for upcoming fee due dates and and alerts for overdue payments.
*   **Implementation:**
    *   Use a cron job scheduler (like `node-cron`) to run a daily script.
    *   This script will scan the database for fees that are due soon or are already overdue.
    *   Integrate with third-party services like **SendGrid** (for email) or **Twilio** (for SMS) to send out notifications to the registered email addresses or phone numbers of parents/students.

### 4.2 Advanced Dashboard & Analytics

*   **Concept:** Develop a comprehensive administrative dashboard that provides real-time insights and visual analytics.
*   **Implementation:**
    *   Create new API endpoints that perform complex database aggregations using the MongoDB Aggregation Pipeline.
    *   These endpoints will calculate key metrics like:
        *   Total fees collected over a specific period (day, week, month).
        *   Total outstanding amount.
        *   A list of top defaulters.
        *   Collection trends (e.g., month-over-month growth).
        *   Breakdown of revenue by fee type (tuition, sports, etc.).
    *   The frontend will use charting libraries (like Chart.js or D3.js) to visualize this data.

### 4.3 Installment & Fine Management

*   **Concept:** Allow for flexible fee payments through installments and automatically calculate and apply fines for late payments.
*   **Implementation:**
    *   Update the `Fee` model to support an `installments` array, where each installment has its own due date and amount.
    *   Create a configuration setting for administrators to define the late fee policy (e.g., a fixed amount or a percentage of the overdue amount per day/week).
    *   The same cron job for reminders can be used to check for overdue payments and automatically apply the calculated fines.

### 4.4 Bulk Student Upload

*   **Concept:** Enable administrators to add or update student records in bulk by uploading a file.
*   **Implementation:**
    *   Create an endpoint that accepts a file upload (e.g., CSV or Excel).
    *   Use a library like `csv-parser` to parse the file.
    *   The backend will validate each row of data and then perform a bulk insert or update operation into the `Student` collection in the database.

---

### 4.5 Mobile App & Payment Channel Expansion

*   **Concept:** Develop a dedicated mobile application to provide a seamless user experience for parents and students, alongside expanding payment options to cater to a wider demographic, including those without smartphones.
*   **Implementation:**
    *   **Online Mobile Application:** Initial development will focus on an online mobile application (iOS/Android) allowing users to view fees, make payments, and access payment history directly from their smartphones.
    *   **Offline Capabilities (Future Phase):** Enhance the mobile app to support certain offline functionalities, such as viewing cached fee details or generating payment requests that can be processed once an internet connection is restored.
    *   **M-Pesa Integration:** Implement direct integration with M-Pesa, a popular mobile money service, to allow users to pay fees directly from their M-Pesa accounts. This will involve setting up M-Pesa APIs (e.g., Lipa na M-Pesa, STK Push) to facilitate secure and instant transactions.
    *   **USSD Version:** Develop a USSD (Unstructured Supplementary Service Data) interface for basic payment functionalities. This will enable non-smartphone users or those with limited internet access to check fee balances and initiate payments through simple USSD codes, ensuring maximum inclusivity.

---

## 5. Author & Contact

This project is maintained by the following author:

*   **Author:** FranNMK
*   **GitHub Profile:** [https://github.com/FranNMK](https://github.com/FranNMK)
*   **Project Link:** [https://github.com/FranNMK/EduPay](https://github.com/FranNMK/EduPay)