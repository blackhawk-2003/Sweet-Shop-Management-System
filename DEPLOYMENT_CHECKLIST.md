# ✅ Deployment Checklist

## Pre-Deployment

### Backend (Render)
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and connection string obtained
- [ ] MongoDB network access configured (allow all IPs: `0.0.0.0/0`)
- [ ] Database user created with read/write permissions
- [ ] JWT_SECRET generated (minimum 32 characters)
- [ ] Code pushed to GitHub

### Frontend (Vercel)
- [ ] Code pushed to GitHub
- [ ] Build tested locally: `cd client && npm run build`
- [ ] No TypeScript errors
- [ ] All dependencies installed

---

## Deployment Steps

### 1. Deploy Backend to Render

1. [ ] Go to [Render Dashboard](https://dashboard.render.com/)
2. [ ] Click "New +" → "Web Service"
3. [ ] Connect GitHub repository
4. [ ] Configure:
   - Name: `sweet-shop-api`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. [ ] Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = `your-mongodb-connection-string`
   - `JWT_SECRET` = `your-secret-key-32-chars-min`
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app` (update after frontend deploy)
6. [ ] Click "Create Web Service"
7. [ ] Wait for deployment (5-10 minutes)
8. [ ] Copy backend URL: `https://sweet-shop-api.onrender.com`
9. [ ] Test backend: Visit `https://sweet-shop-api.onrender.com` (should see "Sweet Shop Management System API")

### 2. Deploy Frontend to Vercel

1. [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. [ ] Click "Add New Project"
3. [ ] Import GitHub repository
4. [ ] Configure:
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. [ ] Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
6. [ ] Click "Deploy"
7. [ ] Wait for deployment (2-3 minutes)
8. [ ] Copy frontend URL: `https://your-app.vercel.app`

### 3. Update Backend CORS

1. [ ] Go back to Render Dashboard
2. [ ] Edit Environment Variables
3. [ ] Update `FRONTEND_URL` with your Vercel URL
4. [ ] Save and redeploy backend

### 4. Final Testing

1. [ ] Visit frontend URL
2. [ ] Test user registration
3. [ ] Test user login
4. [ ] Test viewing sweets
5. [ ] Test purchasing sweets
6. [ ] Test search functionality
7. [ ] Test admin dashboard (create admin user first)

---

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sweet-shop
JWT_SECRET=your-secret-key-minimum-32-characters
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Quick Commands

### Test Backend Locally
```bash
cd server
npm start
```

### Test Frontend Build
```bash
cd client
npm run build
npm run preview
```

### Check Backend Health
```bash
curl https://your-backend.onrender.com
```

---

## Troubleshooting

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs

**CORS errors:**
- Ensure FRONTEND_URL matches exactly (including https://)
- Check backend logs for CORS errors

**Frontend can't connect:**
- Verify VITE_API_URL is set correctly
- Check browser console for errors
- Ensure backend is running

---

## 🎉 Deployment Complete!

Once everything is working:
- Share your deployed URLs
- Test all features
- Celebrate! 🎊

