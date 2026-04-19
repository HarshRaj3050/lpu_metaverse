# Deployment Guide

## Backend Deployment on Render

### Steps:

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `r3f-backend` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev`
   - **Plan**: Free tier or paid

6. Add Environment Variables:
   - Go to **Environment** tab
   - Add: `CLIENT_URL=https://your-vercel-frontend.vercel.app` (update with your Vercel URL)

7. Deploy and get your Render URL (e.g., `https://r3f-backend.onrender.com`)

---

## Frontend Deployment on Vercel

### Steps:

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository (client folder)
3. Configure the project:
   - **Framework**: Vite
   - **Root Directory**: `client/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_SOCKET_URL=https://your-render-backend.onrender.com`
   - Replace with your actual Render backend URL

5. Deploy

---

## Local Development

### Backend:
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3001
```

### Frontend:
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

The socket will automatically connect to `http://localhost:3001` when running locally.

---

## Environment Variables Summary

### Server (Render):
- `PORT`: Auto-set by Render (default: 3001)
- `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

### Client (Vercel):
- `VITE_SOCKET_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com`)

---

## Troubleshooting

### Socket Connection Issues:
1. Check browser console for CORS errors
2. Ensure `VITE_SOCKET_URL` is set correctly on Vercel
3. Verify `CLIENT_URL` environment variable on Render
4. Check that Render backend is running (not sleeping)

### CORS Errors:
- The server now supports both localhost and production URLs
- Make sure your Vercel URL matches the `CLIENT_URL` on Render exactly

---

## Testing Before Deployment

1. Test locally with both `npm run dev` commands
2. Build for production locally:
   ```bash
   cd client
   npm run build
   npm run preview
   ```
3. Check console for any socket connection warnings
