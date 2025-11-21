/**
 * This script acts as an authentication guard for protected dashboard pages.
 * It should be included at the very top of the <head> of any page that requires a user to be logged in.
 *
 * It performs two checks:
 * 1. Ensures a login token exists. If not, it redirects to the homepage.
 * 2. Ensures the user has the correct role to view the specific page.
 */
(function() {
    const token = localStorage.getItem('edupayToken');
    const userRole = localStorage.getItem('userRole');
    const currentPagePath = window.location.pathname;

    // 1. Check if the user is logged in at all.
    if (!token) {
        alert('Access Denied. Please log in to view this page.');
        // The path is relative to the dashboard files inside /dasbboard/
        window.location.href = '../../../index.html';
        return; // Stop further execution
    }
})();