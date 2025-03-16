# 📊 Real-Time Stock-Like Chart (MERN + Socket.io + Recharts)

This project demonstrates a real-time line chart system using the MERN stack, with data updates every 2 seconds. It mimics a stock-market style chart with smooth transitions, bullet points, and includes advanced features like zooming, panning, pausing/resuming updates, and exporting charts as PNG.

---

## 🚀 Features

- Real-time chart updates every **2 seconds**.
- Maintains only the **latest 10 data points**.
- Tracks **active users connected**.
- **Smooth, unidirectional chart movement** (stock-market style).
- **Brush control** for zooming & panning.
- **Pause / Resume** live data stream.
- **Export chart as PNG**.
- Built using **MERN**, **Socket.io**, **Recharts**, **TailwindCSS**, and **Vite**.

---

## 🏗️ Tech Stack

- **Backend:** Node.js, Express, Socket.io
- **Frontend:** React.js (Vite), TailwindCSS, Recharts
- **Real-time Communication:** Socket.io

---

## 📂 Folder Structure

```
root/
├── backend/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chart.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── index.html
└── README.md
```

---

## 🔥 Quick Start

### 1️⃣ Backend Setup

```bash
cd backend
npm install
npm start2  # Runs on port 5000
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

**Make sure your `vite.config.js` includes proxy setup (if needed) to forward `/socket.io` to `localhost:5000`.**

---

## 🛠️ Key Files

### Backend: `server.js`
- Emits random data every 2 sec.
- Tracks and broadcasts active users.
- Sends latest 10 points only (no DB storage).

### Frontend: `Chart.jsx`
- Real-time line chart with:
  - Smooth animation
  - Bullet points
  - Zoom/pan brush control
  - Pause/Resume toggle
  - Export PNG button

---

## 📸 Screenshots

| Real-Time Chart | Zoom & Pan | Export Button |
|-----------------|------------|---------------|
| ![Chart](screenshot1.png) | ![Brush](screenshot2.png) | ![Export](screenshot3.png) |

---

## 🌍 Future Enhancements

- Deployment with Docker & NGINX
- Redis adapter for scalable WebSocket handling
- User authentication & roles
- Chart theming (Dark/Light toggle)

---

## 📜 License

MIT License. Free to use & modify.

