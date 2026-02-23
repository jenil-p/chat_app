# 💬 Real-Time Chat App

A full-stack real-time one-on-one messaging application built with Next.js, Convex, and Clerk.

---

## Tech Stack

- Next.js (App Router) – Frontend & UI
- Convex – Database, backend functions & real-time subscriptions
- Clerk – Authentication (Email + Social login)
- Tailwind CSS – Styling & responsive design

## ✨ Key Features
#### 🔐 Authentication
- Email & social login using Clerk
- Sign up, log in, log out
- Displays user name and avatar
- User profiles stored in Convex

#### 👥 User List & Search
- View all registered users (excluding yourself)
- Live search filter by name
- Click a user to create/open conversation

#### 💬 Direct Messaging
- One-on-one private conversations
- Real-time messaging via Convex subscriptions
- Sidebar with conversation previews

#### 🟢 Online / Offline Status

- Green indicator for active users that updates every 4-5 seconds if user's status changes (online -> ofline), changes immedietly if user (ofline -> online)
- Real-time presence updates

#### ✍️ Typing Indicator
- Shows: "Alex is typing..."
- Auto-disappears after ~2 seconds
- Real-time updates

#### 🔔 Unread Message Count
- Badge with unread messages per conversation
- Clears when conversation is opened
- Real-time updates

#### Delete Own Messages
- Users can delete their own messages
- Soft delete (data remains in DB)
- Displays: "This message was deleted"


## 📁 Project Structure
```bash
.
├── app/        → Next.js App Router (UI + Pages)
├── convex/     → Convex functions + schema
├── .env.example
└── README.md
```


## 🛠 Local Setup
1️⃣ Clone the Repository
```
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2️⃣ Install Dependencies
```
npm install
```

3️⃣ Setup Environment Variables

Copy the example file and fill in the required values:
```
cp .env.example .env.local
```

4️⃣ Start Convex (Backend)
```
npx convex dev
```

5️⃣ Start Next.js App
```
npm run dev
```

App will run at:
```
http://localhost:3000
```
