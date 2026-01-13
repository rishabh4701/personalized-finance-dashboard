# Personalized Finance Dashboard 💰📊

A full-stack **Personalized Finance Dashboard** that helps users track spending, manage cash flow, monitor budgets, and get reminders for upcoming EMIs.  
Built with a **secure, performance-optimized backend** and a **clean, modern frontend dashboard**.

---

## 🚀 Features

### 🔐 Authentication
- User registration & login
- JWT-based authentication
- Protected routes for all financial data

### 💸 Transaction Management
- Supports income & expense transactions
- Bulk transaction ingestion (optimized for performance)
- Category-based expense tracking

### 📊 Analytics
- Cashflow summary (Income, Expense, Net Balance)
- Category-wise spending analytics (visualized using charts)
- Monthly & date-based aggregation using MongoDB pipelines

### 📅 EMI Tracking
- Add EMIs with due dates
- View upcoming EMIs for the next 7 days
- Mark EMIs as paid

### 🚨 Budget Management
- Set category-wise budgets (weekly/monthly)
- Automatic overspending alerts
- Clear visual alerts on dashboard

---

## 🧠 System Architecture
Frontend (React + Tailwind)
|
| REST APIs (JWT Auth)
|
Backend (Node.js + Express)
|
| Aggregation Pipelines
|
MongoDB (Indexed Collections)


### Key Design Principles
- **Business logic in backend**, UI-only frontend
- **JWT-based stateless authentication**
- **Aggregation pipelines** for analytics (not JS loops)
- **Compound indexing** aligned with query patterns
- Clean separation of concerns

---

## ⚙️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt.js

---

## ⚡ Performance & Optimization

- Bulk inserted **5,000+ transactions in ~1.7 seconds**
- Optimized analytics using **MongoDB aggregation pipelines**
- Designed **compound indexes** (`userId + date`, `userId + category`)
- Reduced analytics query latency by **~60–70%**
- Verified index usage via MongoDB Atlas

---

## 🖥️ Dashboard Preview

> Add screenshots here (recommended):
- Cashflow summary cards
- Category-wise spending chart
- EMI list
- Budget alerts

*(Screenshots greatly improve recruiter engagement)*

---

## 🔧 How to Run Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/personalized-finance-dashboard.git
cd personalized-finance-dashboard

```
### 2️⃣ Backend Setup
```bash
cd backend
npm install
```
Create a .env file:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start backend:
```bash
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
