# 🚀 Deployment Guide

This guide will help you deploy the Sweet Shop Management System to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (for frontend)
- Render account (for backend)
- MongoDB Atlas account (or MongoDB connection string)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Ensure your frontend is ready:**

   ```bash
   cd client
   npm run build
   ```

2. **Create/Update `.env` file** (for local testing):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Navigate to client directory:**

   ```bash
   cd client
   ```

4. **Deploy:**

   ```bash
   vercel
   ```

5. **Follow the prompts:**

   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name: `sweet-shop-frontend` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? **No**

6. **Add Environment Variable:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - Redeploy the project

#### Option B: Using GitHub Integration

1. **Push your code to GitHub** (if not already done)

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure Project:**

   - Framework Preset: **Vite**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Add Environment Variable:**

   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
   - Environment: Production, Preview, Development

7. **Click "Deploy"**

### Step 3: Update CORS on Backend

After getting your Vercel URL, update the backend CORS settings (see Backend Deployment section).

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend

1. **Ensure MongoDB is accessible:**

   - Use MongoDB Atlas (recommended)
   - Get your connection string

2. **Update server code** (already done - CORS is configured)

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**

   - **Name:** `sweet-shop-api` (or your choice)
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid if needed)

5. **Add Environment Variables:**
   Click "Add Environment Variable" and add:

   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = your-mongodb-connection-string
   JWT_SECRET = your-secret-key-min-32-chars
   FRONTEND_URL = https://your-vercel-app.vercel.app
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (first deployment takes ~5-10 minutes)

8. **Copy your service URL** (e.g., `https://sweet-shop-api.onrender.com`)

#### Option B: Using render.yaml (Recommended)

1. **The `render.yaml` file is already created in the `server` directory**

2. **Push your code to GitHub**

3. **Go to Render Dashboard → "New +" → "Blueprint"**

4. **Connect your repository**

5. **Render will automatically detect `render.yaml`**

6. **Add Environment Variables in Render Dashboard:**

   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure secret key (min 32 characters)
   - `FRONTEND_URL` - Your Vercel frontend URL

7. **Deploy**

### Step 3: Update Frontend Environment Variable

1. **Go to Vercel Dashboard**

2. **Navigate to your project → Settings → Environment Variables**

3. **Update `VITE_API_URL`:**

   - Value: `https://your-backend-url.onrender.com/api`
   - Make sure it's set for Production, Preview, and Development

4. **Redeploy** your frontend

---

## 🔄 Post-Deployment Checklist

### Backend (Render)

- [ ] Service is running and healthy
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working
- [ ] API endpoints are accessible
- [ ] CORS is configured for frontend URL

### Frontend (Vercel)

- [ ] Build completes successfully
- [ ] Environment variable `VITE_API_URL` is set
- [ ] Frontend can connect to backend API
- [ ] All routes work correctly
- [ ] Authentication flow works

### Testing

- [ ] Test user registration
- [ ] Test user login
- [ ] Test viewing sweets
- [ ] Test purchasing sweets
- [ ] Test admin dashboard (if admin user exists)
- [ ] Test search and filter functionality

---

## 🔐 Environment Variables Reference

### Backend (Render)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sweet-shop
JWT_SECRET=your-secret-key-minimum-32-characters-long
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Service fails to start

- Check environment variables are set correctly
- Verify MongoDB connection string is valid
- Check Render logs for error messages

**Problem:** CORS errors (Most Common Issue!)

- **Step 1:** Get your exact Vercel frontend URL (e.g., `https://sweet-shop-management-system-e1hk.vercel.app`)
- **Step 2:** Go to Render Dashboard → Your Service → Environment
- **Step 3:** Set `FRONTEND_URL` to your Vercel URL **exactly** (no trailing slash):
  ```
  FRONTEND_URL=https://your-vercel-app.vercel.app
  ```
- **Step 4:** **IMPORTANT:** After updating, click "Save Changes" and **manually trigger a redeploy**
- **Step 5:** Check Render logs - you should see: "Allowed CORS origins: [your-url]"
- **Step 6:** If still failing, check browser console for the exact origin being blocked
- **Note:** The CORS configuration normalizes URLs (removes trailing slashes), but it's best to set it without a trailing slash

**Problem:** MongoDB connection fails

- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Verify connection string credentials
- Check MongoDB Atlas network access settings

### Frontend Issues

**Problem:** API calls fail

- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is running and accessible

**Problem:** Build fails

- Check for TypeScript errors: `npm run build` locally
- Verify all dependencies are in `package.json`
- Check Vercel build logs

**Problem:** Routes not working (404)

- Verify `vercel.json` rewrite rules are correct
- Check that build output is `dist` directory

---

## 📝 Notes

- **Render Free Tier:** Services spin down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds.
- **Vercel:** Free tier is generous and suitable for this project.
- **MongoDB Atlas:** Free tier (M0) is sufficient for development and testing.

---

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Render Dashboard](https://dashboard.render.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ✅ Deployment Complete!

Once both services are deployed:

1. Test the full application flow
2. Share your deployed URLs
3. Update README with production URLs (optional)

**Frontend URL:** `https://your-app.vercel.app`  
**Backend URL:** `https://your-api.onrender.com`
