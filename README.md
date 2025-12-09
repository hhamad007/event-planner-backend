# Event Planner Backend

A Node.js/Express backend for managing events, users, RSVPs, and image uploads.  
Supports authentication, event creation, RSVP management, organiser dashboards, and file uploads via Cloudinary.

---

## 🚀 Features

- **User Authentication:** Register, login, profile, JWT-based auth
- **Event Management:** Create, update, delete, view, and search events
- **RSVP System:** RSVP to events, manage attendance, view attendees
- **Organiser Dashboard:** View events created by organiser
- **Image Uploads:** Upload event images and user avatars (Cloudinary)
- **Robust Validation & Error Handling**
- **Environment-based configuration**

---

## 📦 Folder Structure

```
.
├── app.js / server.js         # Entry points
├── config/                    # DB & Cloudinary config
├── controllers/               # Route logic
├── middleware/                # Auth & error handling
├── models/                    # Mongoose schemas
├── routes/                    # API route definitions
├── tests/                     # API test scripts
├── utils/                     # Utility functions
├── .env                       # Environment variables
├── package.json
```

---

## ⚡️ Getting Started

### 1. **Clone the repo**
```bash
git clone: https://github.com/hhamad007/event-planner-backend.git
cd event-planner-backtend
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Configure environment variables**

Create a `.env` file with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PORT=5001
```

### 4. **Run the server**
```bash
npm run dev
```
or
```bash
node server.js
```

---

## 🛣️ API Endpoints

### **Auth**
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `GET /api/auth/profile` — Get logged-in user's profile

### **Events**
- `POST /api/events` — Create event
- `GET /api/events` — List all events
- `GET /api/events/:id` — Get event by ID
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete/cancel event
- `GET /api/events/organiser/:organiserId` — Events by organiser
- `GET /api/events/my-events` — Events by logged-in organiser
- `GET /api/events/:id/stats` — Event statistics

### **RSVP**
- `POST /api/rsvp/:eventId` — RSVP to event
- `DELETE /api/rsvp/:eventId` — Cancel RSVP
- `PUT /api/rsvp/:eventId` — Update RSVP
- `GET /api/rsvp/:eventId/status` — Get RSVP status
- `GET /api/rsvp/:eventId/attendees` — Get event attendees
- `GET /api/rsvp/user` — Get RSVPs for logged-in user

### **Users**
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### **Upload**
- `POST /api/upload/event/:eventId` — Upload event image
- `POST /api/upload/avatar` — Upload user avatar

### **Health**
- `GET /api/health` — Health check

---

## 🧪 Testing

- Use Postman or the scripts in `/tests` to test endpoints.
- For file uploads, use `form-data` and send nested objects as JSON strings.

---

## 🛠️ Tech Stack

- Node.js
- Express
- MongoDB & Mongoose
- JWT for authentication
- Cloudinary for image uploads
- Multer for file handling

---

## 👤 Author

Hamadh H.
