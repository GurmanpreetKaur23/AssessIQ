# AssessIQ

A modern web-based online assessment platform built using the MERN stack. AssessIQ automates the traditional assessment process by enabling users to take tests digitally, receive instant results, and securely manage assessments.

---

## 📌 Overview

Traditional assessment systems are often manual, time-consuming, and prone to human errors. AssessIQ solves these problems by providing:

* Secure online assessments
* Instant automated evaluation
* Real-time feedback
* Scalable architecture
* Responsive user experience

The platform is designed for educational institutions, training organizations, and online learning environments.

---

## 🚀 Features

* 🔐 Secure JWT Authentication
* 📝 Online Test & Assessment Management
* ⚡ Instant Result Generation
* 📊 Automated Evaluation System
* 📱 Responsive User Interface
* 🔄 RESTful API Communication
* 📦 Modular Full-Stack Architecture
* ☁️ Future-ready scalable system

---

## 🛠️ Tech Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication

* JSON Web Token (JWT)

### Version Control

* Git
* GitHub

---

## 🏗️ System Architecture

### Frontend Layer

Handles:

* User registration
* Login system
* Assessment interface
* Result display

### Backend Layer

Responsible for:

* REST API handling
* Authentication
* Evaluation logic
* Request processing

### Database Layer

Stores:

* User information
* Questions
* Responses
* Results

### Authentication Module

* JWT-based secure authentication
* Protected routes
* Session management

---

## ⚙️ Workflow

1. User registers or logs in.
2. JWT token is generated after authentication.
3. User selects and attempts an assessment.
4. Responses are submitted to the backend.
5. Backend evaluates answers automatically.
6. Results are calculated instantly.
7. Results are displayed and stored in MongoDB.

---

## 📂 Project Structure

```bash
AssessIQ/
│
├── frontend/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/           # Node.js + Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
├── database/
│
├── README.md
└── package.json
```

---

## 🔧 Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/your-username/AssessIQ.git
cd AssessIQ
```

---

### Backend Setup

```bash
cd backend
npm install
npm start
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌐 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 📸 Screenshots

Add screenshots of:

* Login Page
* Registration Page
* Test Interface
* Result Page

---

## 📈 Major Outcomes

* Reduced manual effort in assessment handling
* Improved accuracy and reliability
* Faster evaluation and result generation
* Better user experience through responsive design
* Scalable system architecture

---

## 🔮 Future Scope

* Adaptive testing system
* AI-powered analytics
* Anti-cheating mechanisms
* Cloud deployment
* Mobile application support
* Performance tracking dashboards

---

## 📚 References

* React.js – [https://react.dev](https://react.dev)
* Node.js – [https://nodejs.org](https://nodejs.org)
* Express.js – [https://expressjs.com](https://expressjs.com)
* MongoDB – [https://www.mongodb.com](https://www.mongodb.com)
* JWT – [https://jwt.io](https://jwt.io)
* REST API Principles – [https://restfulapi.net](https://restfulapi.net)

---

## 👨‍💻 Authors

### Parth Gera

Bachelor of Engineering – Computer Science & Engineering
Chitkara University, Punjab

### Gurmanpreet Kaur

Bachelor of Engineering – Computer Science & Engineering
Chitkara University, Punjab

---

## 🙏 Acknowledgement

Special thanks to Dr. Gurpreet Singh for guidance, support, and mentorship throughout the development of the project.

---

## 📄 License

This project is developed for academic and learning purposes.
