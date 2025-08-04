# 🚀 Mobile-AI Setup Guide (Using Termux + Ollama)

This guide walks you through setting up **Mobile-AI** on your Android device using Termux and Ollama.

---

## 📲 Prerequisites

Install **Termux** from the Google Play Store:

```bash
https://play.google.com/store/apps/details?id=com.termux
```

---

## 📦 Initial Setup in Termux

Run the following commands one by one:

```bash
pkg update && pkg upgrade
pkg install git
pkg install nodejs
pkg install ollama
```

---

## 🧠 Install Ollama Model

Replace `<model-name>` with your desired Ollama model (e.g. `llama2`, `mistral`, etc.):

```bash
ollama run <model-name>
```

---

## 🔁 Clone the Mobile-AI Repository

```bash
git clone https://github.com/shad-ct/Mobile-AI
cd Mobile-AI
```

---

## 🌐 Get Your Local IP Address

This will help you access the server from other devices on your network:

```bash
ifconfig
```

---

## 🖥️ Start the Node.js Server

```bash
node server.js
```

---

## 🔌 Run Ollama Server

Ensure Ollama listens on all interfaces:

```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

---

## ✅ You're All Set!

Your mobile AI server is now live and ready to interact. Be sure you're connected to the same local network when accessing it from other devices.

Navigate to the web interface using:

```bash
http://<your-ip-address>:3001
```

Replace `<your-ip-address>` with the IP you found using `ifconfig`.

---
