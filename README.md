# DevPulse - Developer Productivity Dashboard 

A full-stack analytics dashboard designed to measure and visualize developer productivity using engineering workflow data. The platform consolidates data from Jira issues, pull requests, deployments, and bug reports to generate meaningful performance insights for individual developers.

**Overview**

Engineering productivity data is often scattered across multiple tools, making it difficult to evaluate performance clearly. This project solves that problem by providing a centralized dashboard where users can select a developer and month to view productivity metrics, quality indicators, and improvement recommendations.

**Key Features**

- Developer-wise monthly productivity analysis
- KPI-based performance dashboard
- Intelligent insights generation
- Executive summary of monthly performance
- Strength areas identification
- Risk area detection
- Recommended improvement actions
- Clean and modern corporate UI

**Metrics Tracked**

- PR Throughput – Number of merged pull requests
- Deployment Frequency – Successful production deployments
- Lead Time – Average time from code change to deployment
- Cycle Time – Average task completion duration
- Bug Rate – Production bugs relative to completed work

**Tech Stack**

Frontend

- React.js
- CSS3
- JavaScript

Backend

- Node.js
- Express.js

Database

- MySQL

**How It Works**

1. User enters Developer ID
2. User selects month and year
3. Frontend sends request to backend API
4. Backend fetches productivity data from MySQL
5. Metrics are calculated using SQL queries
6. Dashboard displays KPIs and insights

**Dashboard Output Includes**

- Productivity KPI cards
- Overall assessment
- Strength areas
- Risk areas
- Recommended actions

**Screenshots**

<img width="1906" height="882" alt="Screenshot 2026-04-26 183449" src="https://github.com/user-attachments/assets/081c8f1e-93fc-425d-a0dc-dc62966b7a3a" />
<img width="1918" height="739" alt="Screenshot 2026-04-26 183547" src="https://github.com/user-attachments/assets/569760b9-d3d1-460e-a633-422256554ecd" />


**Future Enhancements**

- Productivity trend charts
- Team benchmarking
- Export reports (PDF / Excel)
- AI-powered coaching recommendations
- Predictive performance analytics

**Why This Project Matters**

This project demonstrates how software engineering data can be transformed into actionable business intelligence. It combines full-stack development, SQL analytics, backend logic, and frontend design into one practical product.

**Installation**

Backend

-cd backend
-npm install
-node server.js

Frontend

-cd frontend
-npm install
-npm start

**Author**

Developed as part of an analytics/productivity engineering assignment.

**License**

This project is for educational and demonstration purposes.
