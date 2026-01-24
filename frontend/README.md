
# Fzokart Full Stack Auth System

## 🚀 Setup Instructions

### Backend
1. Initialize a new Node project: `npm init -y`
2. Install dependencies: `npm install express mongoose jsonwebtoken bcryptjs cookie-parser dotenv`
3. Create a `.env` file:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   NODE_ENV=development
   ```
4. Place the files from `server/` into your project root.
5. Start server: `node server/server.js`

### Frontend
1. The frontend logic is already integrated into the React components.
2. In production, change the mock logic in `services/authService.ts` to use real `axios` calls to your backend URL.
3. Use `withCredentials: true` in your Axios config to support secure cookies.
