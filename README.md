## 👤 Roles & Permissions

| Role           | Description                                                                 | Key Permissions & Features                                                                 |
|----------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| Super Admin    | Overall system administrator.                                                | Manage all users and roles, view analytics/reports, system backup, manage admins, settings |
| Admin          | Election and candidate manager.                                              | Create/manage elections, manage candidates, view analytics/reports, manage student voters  |
| Student (Voter)| Registered student user.                                                     | Register/login, view elections, cast vote, view history, receive notifications             |
| Observer       | Election observer for transparency and reporting.                            | Access observer dashboard, view election progress, submit reports, monitor voting process  |
| Agent          | Support/admin assistant (if enabled).                                        | Assist with user management, data entry, or specific admin tasks (customizable)            |
| Candidate      | Student running for election (if enabled).                                   | Submit campaign materials, view own stats, receive notifications                           |
| Guest          | Unauthenticated user.                                                        | View public info (if enabled), register/login                                              |

### Feature Access Matrix

| Feature                        | Super Admin | Admin | Observer | Agent | Candidate | Student | Guest |
|--------------------------------|:-----------:|:-----:|:--------:|:-----:|:---------:|:-------:|:-----:|
| Manage Users/Roles             |      ✔      |   ✖   |    ✖     |  (✔)  |     ✖     |    ✖    |   ✖   |
| Create/Manage Elections        |      ✔      |   ✔   |    ✖     |  (✔)  |     ✖     |    ✖    |   ✖   |
| Manage Candidates              |      ✔      |   ✔   |    ✖     |  (✔)  |     ✔     |    ✖    |   ✖   |
| Cast Vote                      |      ✖      |   ✖   |    ✖     |   ✖   |     ✖     |    ✔    |   ✖   |
| View Analytics/Reports         |      ✔      |   ✔   |    ✔     |   ✖   |     (✔)   |    (✔)  |   ✖   |
| Observer Dashboard/Reporting   |      ✔      |   ✔   |    ✔     |   ✖   |     ✖     |    ✖    |   ✖   |
| Submit Campaign Materials      |      ✖      |   ✖   |    ✖     |   ✖   |     ✔     |    ✖    |   ✖   |
| System Backup/Settings         |      ✔      |   ✖   |    ✖     |   ✖   |     ✖     |    ✖    |   ✖   |
| View Public Info               |      ✔      |   ✔   |    ✔     |   ✔   |     ✔     |    ✔    |   ✔   |

✔ = Full access, ✖ = No access, (✔) = Limited/optional access, (✔) = Feature may be enabled for this role depending on configuration.


# 🗳️ Campus Ballot Voting System

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blueviolet?style=for-the-badge&logo=mongodb&logoColor=white)
![Deployed at campusballot.tech](https://img.shields.io/badge/Deployed%20at-campusballot.tech-46E3B7?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)

---


## 🌐 Live Demo

[View Deployed App](https://campusballot.tech)

---

## 📘 Overview

Campus Ballot is a secure, scalable, and user-friendly digital voting platform built with the **MERN stack** (MongoDB, Express, React, Node.js) and MySQL. It enables university students to participate in elections online, while administrators manage elections, candidates, and results. The system is responsive, role-based, and fully deployed at [campusballot.tech](https://campusballot.tech) for cloud scalability.

---

## 🚀 Features

### 👥 User Roles

- **Super Admin**: System administrator, analytics, reports, manage student voters, system backup, register/manage admins
- **Admin**: Create/manage elections, manage candidates, analytics, reports, manage student voters
- **Student (Voter)**: Register/login, view elections, cast vote (once per election), view voting history, notifications

---

## 💡 Core Modules

### 🔐 Authentication
- JWT-based login/signup
- Role-based access control
- Password encryption (bcrypt)
- Protected routes & session handling

### 🧭 Frontend (React.js)
- Responsive UI
- Role-based dashboards
- Charts & analytics (Chart.js)
- State management (Redux Toolkit)
- Accessibility & error boundaries
- Real-time notifications

### ⚙️ Backend (Node.js + Express)
- RESTful API for users, votes, candidates, elections
- Input validation & rate limiting
- Centralized error handling
- WebSocket for real-time updates
- Audit logging

### 🗄️ Database (MongoDB & MySQL)
- Stores users, elections, votes, candidates
- Mongoose models for consistency
- Data encryption for sensitive info

### ☁️ Deployment
- Hosted at [campusballot.tech](https://campusballot.tech) (frontend & backend)
- Auto builds on GitHub push
- CI/CD pipeline
- Environment variable management

---

## 🧩 Tech Stack

| Layer             | Technology                        |
|-------------------|-----------------------------------|
| **Frontend**      | React.js, Redux Toolkit, Chart.js  |
| **Backend**       | Node.js, Express.js                |
| **Database**      | MongoDB (Mongoose ORM), MySQL      |
| **Authentication**| JWT, bcrypt                        |
| **Deployment**    | Render Cloud Platform              |
| **Version Control**| Git & GitHub                      |

---

## ⚙️ Installation & Setup

1. **Clone the Repository**
	```bash
	git clone https://github.com/Chemistry2i/campus-ballot.git
	cd campus-ballot
	```
2. **Backend Setup**
	```bash
	cd backend
	npm install
	# Set environment variables in .env
	PORT=5000
	MONGO_URI=your_mongodb_connection_string
	JWT_SECRET=your_secret_key
	npm run dev
	```
3. **Frontend Setup**
	```bash
	cd ../frontend
	npm install
	npm run dev
	```
	- Frontend: http://localhost:5173
	- Backend: http://localhost:5000

---

## ✅ Highlights

- Professional GitHub Markdown
- Badges, architecture diagram, and screenshots
- Complete installation & deployment instructions
- Suitable for technical and non-technical readers

---

[Live Demo: campusballot.tech](https://campusballot.tech)

---




