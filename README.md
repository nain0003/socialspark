# ✦ SocialSpark

**A full-stack social awareness web application** that connects communities with local campaigns and causes.

🌐 **Live Demo:** [https://socialspark1-n8z6.onrender.com](https://socialspark1-n8z6.onrender.com)


## 🚀 About the Project

SocialSpark is a community platform where users can discover and support local social campaigns, small businesses can promote their services, and admins can manage content through an approval workflow.

Built as a university project across 3 stages — from wireframes and prototype all the way to a fully deployed cloud application.

---

## ✨ Features

- 🔍 **Browse Campaigns** — explore approved campaigns with category filtering
- 📢 **Post a Campaign** — logged-in users submit campaigns for admin review
- ✅ **Admin Approval** — admins approve or reject submitted campaigns
- 🏪 **Business Accounts** — dedicated account type for small business owners
- 🔐 **JWT Authentication** — secure login with bcrypt password hashing
- 📱 **Fully Responsive** — works on mobile, tablet, and desktop
- 📄 **Full supporting pages** — About, FAQ, Help Centre, Privacy Policy, Contact

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Deployment | Render (single web service) |
| Version Control | GitHub |

---

## 🗂️ Project Structure

```
socialspark/
├── package.json          # Root — build and start commands
├── backend/
│   ├── server.js         # Entry point
│   ├── src/
│   │   ├── app.js        # Express setup, routes, serves React build
│   │   ├── config/db.js  # MongoDB connection
│   │   ├── models/       # User.js, Campaign.js
│   │   ├── controllers/  # authController.js, campaignController.js
│   │   ├── routes/       # authRoutes.js, campaignRoutes.js
│   │   └── middleware/   # authMiddleware.js, adminMiddleware.js
└── frontend/
    ├── src/
    │   ├── App.jsx        # All pages and components
    │   ├── AuthContext.jsx # Global auth state
    │   └── api.js         # All API calls
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account

### Installation

```bash
# Clone the repo
git clone https://github.com/nain0003/socialspark.git
cd socialspark

# Install and start backend
cd backend
npm install
npm run dev

# In a new terminal — install and start frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env` file in the `backend/` folder:

```
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/socialspark
JWT_SECRET=your-secret-key
```

### Make yourself admin

```bash
cd backend
node makeAdmin.js your@email.com
```

---

## 🌐 Deployment

The app is deployed on **Render** as a single web service. The Express backend serves both the API and the built React frontend from one URL.

| Setting | Value |
|---------|-------|
| Build command | `npm run build && cd backend && npm install` |
| Start command | `npm start` |
| Database | MongoDB Atlas |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register new user |
| POST | /api/auth/login | None | Login — returns JWT |
| GET | /api/auth/profile | JWT | Get user profile |
| GET | /api/campaigns | None | Get approved campaigns |
| POST | /api/campaigns | JWT | Submit new campaign |
| GET | /api/campaigns/pending | Admin | Get pending campaigns |
| PUT | /api/campaigns/:id/approve | Admin | Approve campaign |
| PUT | /api/campaigns/:id/reject | Admin | Reject campaign |

---

## 📄 License

This project was built for educational purposes as part of a university assignment.
