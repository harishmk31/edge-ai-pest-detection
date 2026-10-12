# MongoDB Atlas Setup Guide for AgriVision AI

AgriVision AI is built with flexible database persistence. By default, it operates in **Local Development Storage Mode** if no MongoDB credentials are provided. When you are ready to persist diagnoses to the cloud, follow these steps to connect MongoDB Atlas.

---

## 1. Create a MongoDB Atlas Cluster (Free M0 Tier)

1. Sign up or log in at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Project (e.g. `AgriVision-AI`).
3. Deploy a free cluster (select **M0 Free**, AWS/GCP, region closest to your location).

---

## 2. Configure Database Access & Network Security

1. **Database Access**:
   - Go to **Security > Database Users**.
   - Click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username (e.g. `agrivision_admin`) and a secure password.
   - Set privileges to **Read and write to any database**.

2. **Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - For local development, choose **Allow Access from Anywhere** (`0.0.0.0/0`) or enter your current public IP address.

---

## 3. Retrieve Connection String

1. Go to **Deployments > Database**.
2. Click **Connect** on your cluster.
3. Select **Drivers** (Driver: `Python`, Version: `3.11 or later`).
4. Copy the connection string format:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

---

## 4. Configure in AgriVision AI

1. Open `.env` in `C:\Users\Harish\Desktop\Agrivision Ai Web\.env`.
2. Set the `MONGODB_URI` variable with your credentials:
   ```env
   MONGODB_URI=mongodb+srv://agrivision_admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=agrivision_ai
   ```
3. Restart the backend server.
4. Check the status indicator in the top navbar: it will display **Atlas DB** in green.

---

## 5. Offline & Development Fallback

If `MONGODB_URI` is left blank, the application automatically logs:
```
[INFO] agrivision.mongodb: MongoDB URI not provided. Using offline development storage.
```
All diagnoses will still be recorded and displayed under the History tab using local JSON storage (`uploads/local_history.json`), with image files saved in `uploads/images/`.
