# EduPay Application - Basic Feature Testing Guide

This document outlines the basic test cases for the EduPay application to ensure core functionalities are working as expected. It is intended for developers, QA testers, or anyone who needs to verify the application's stability.

---

## Prerequisites

Before you begin testing, please ensure the following:

1.  **Backend Server is Running:**
    *   Open a terminal.
    *   Navigate to the `backend` directory: `cd backend`
    *   Start the server: `npm start`
    *   You should see a confirmation message like `Server is running on http://localhost:3000`.

2.  **Frontend is Accessible:**
    *   Open the `index.html` file in your web browser (e.g., by using a Live Server extension in VS Code or by double-clicking the file).

3.  **Test Credentials:**
    Use the following credentials for testing. Note that these users must be created in the database for the tests to work.
    *   **Admin User:**
        *   Email: `frankmk2025@gmail.com`
        *   Password: `admin123`
    *   **Parent User:**
        *   Email: `parent@test.com`
    *   **Student User:**
        *   Email: `student@test.com`

---

## Test Cases

### TC-01: Landing Page & UI Verification

**Objective:** Ensure all primary components of the landing page load and display correctly.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Open `index.html` in the browser. | The page loads without errors. The EduPay logo, navigation bar, and hero section are visible. |
| 2 | Scroll down the page. | The "Why Choose EduPay?" features section and the "Ready to Digitize?" contact section are visible. |
| 3 | Verify the footer. | The footer with social media links and the copyright notice is present at the bottom. |
| 4 | Check for the WhatsApp icon. | A green WhatsApp icon is visible at the bottom-right corner of the screen. |

### TC-02: Admin Authentication

**Objective:** Verify that an administrator can log in successfully and that invalid attempts are rejected.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | On the homepage, click the "Get Started Today!" or "Login/Register" button. | The authentication modal pops up. |
| 2 | In the modal, click the **"Admin"** role button. | The Admin login form (Email/Password) becomes visible. |
| 3 | **Test Case: Invalid Login** <br> Enter an incorrect email or password and click "Login". | An error message like "Invalid credentials" or "User not found" should appear. You should not be redirected. |
| 4 | **Test Case: Valid Login** <br> Enter the correct admin email and password and click "Login". | The modal closes, and you are redirected to the admin dashboard. A success message may appear briefly. |

### TC-03: Parent/Student Authentication

**Objective:** Verify that a parent or student can log in successfully.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | If not already open, click a "Login/Register" button to open the auth modal. | The authentication modal pops up. |
| 2 | Ensure the **"Parent/Student"** role is selected (it's the default). | The Parent/Student login form (Email) is visible. |
| 3 | **Test Case: Invalid Email** <br> Enter an email that is not registered in the system and click "Login". | An error message like "User not found" or "Please register first" should appear. |
| 4 | **Test Case: Valid Email** <br> Enter a correct, registered parent/student email and click "Login". | The form should switch to an OTP (One-Time Password) verification screen. You should receive an OTP in your email inbox. |
| 5 | Enter the correct OTP from your email and click "Verify". | The modal closes, and you are redirected to the student/parent dashboard. |

### TC-04: Basic Navigation

**Objective:** Ensure the primary navigation links and buttons work correctly.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | On the homepage, scroll to the "Ready to Digitize Your Fee Collection?" section. | The section is visible. |
| 2 | Click the **"Contact Sales Team"** button. | You are redirected to the `contact.html` page. |
| 3 | Go back to the homepage. Click the navigation links in the header (e.g., "Features", "Contact"). | The page smoothly scrolls to the corresponding section. |

---

## Reporting Bugs

If a test case fails (the "Actual Result" does not match the "Expected Result"), please report it with the following information:

*   **Test Case ID:** (e.g., `TC-02`)
*   **Browser:** (e.g., Chrome, Firefox)
*   **Description:** A clear description of what went wrong.
*   **Screenshots:** Include a screenshot of the error message or incorrect UI.
*   **Console Logs:** Open the browser's developer tools (F12), go to the "Console" tab, and copy any red error messages.
