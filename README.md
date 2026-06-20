# 🌿 Verna

### AI-Powered Plant Care Ecosystem

Verna is an intelligent plant care platform that combines Artificial Intelligence, Computer Vision, and Smart Gardening technologies to help users identify plants, diagnose diseases, track growth, and receive personalized care recommendations.

The project consists of:

* **Django REST Framework Backend**
* **React Web Application**
* **React Native (Expo) Mobile Application**
* **Future IoT Smart Gardening Integration**

---

## ✨ Features

### 📸 AI Plant Identification

Identify plants instantly using a photo.

* Species recognition
* Scientific names
* Care instructions
* Watering schedules
* Soil recommendations
* Toxicity information

---

### 🏥 Plant Disease Diagnosis

Detect plant diseases through image analysis.

* Disease recognition
* Nutrient deficiency detection
* Pest identification
* Treatment recommendations
* Prevention strategies

---

### 🎯 Personalized Plant Recommendation

Find the perfect plant based on your lifestyle.

Factors include:

* Available sunlight
* Climate conditions
* Living space
* Pet safety requirements
* Maintenance preferences
* Budget constraints

---

### 🪴 Virtual Garden Management

Manage all your plants in one place.

Features:

* Personal plant collection
* Custom plant names
* Growth history
* Health tracking
* Care reminders

---

### 📈 Growth Analytics

Monitor plant development over time.

Track:

* Height
* Pot size
* Canopy width
* Health score
* Growth trends

---

### 🤖 Context-Aware AI Assistant

Each plant has its own intelligent assistant.

The AI can access:

* Plant profile
* Growth history
* Previous measurements
* Care records

to provide personalized recommendations.

---

## 🚀 Future Roadmap

### 🌱 Smart IoT Ecosystem

Planned hardware integrations include:

* Soil moisture sensors
* Light sensors
* Humidity sensors
* Smart irrigation systems
* Automated watering modules

### 💧 Automated Plant Care

AI-driven automation based on real-time sensor data.

---

## 🏗️ Architecture

```text
┌─────────────────────┐
│     Mobile App      │
│ React Native Expo   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      REST API       │
│ Django + DRF        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘

           ▲
           │
┌─────────────────────┐
│      Web App        │
│ React + TypeScript  │
└─────────────────────┘
```

---

## 🛠 Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL
* SQLite (Development)

### Web Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Mobile App

* React Native
* Expo
* TypeScript
* NativeWind
* Gluestack UI

### AI & Machine Learning

* Computer Vision Models
* Large Language Models (LLMs)
* Plant Disease Classification
* Recommendation Systems

---

## 📂 Project Structure

```text
Backend/
├── blog/
├── diseases/
├── gardens/
├── plants/
└── users/

Frontend/
├── plants_site/
└── plants_app/

README.md
```

---

## ⚙️ Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* PostgreSQL (optional)
* Expo Go (for mobile testing)

---

### 1. Backend Setup

```bash
cd Backend

python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create environment variables:

```bash
cp .env.example .env
```

Apply migrations:

```bash
python manage.py migrate
```

Populate initial data:

```bash
python manage.py populate_plants
python manage.py populate_diseases
```

Run server:

```bash
python manage.py runserver
```

---

### 2. Web Application

```bash
cd Frontend/plants_site

npm install
npm run dev
```

---

### 3. Mobile Application

```bash
cd Frontend/plants_app

npm install
npx expo start
```

Scan the generated QR code using Expo Go.

---

## 💰 Monetization Strategy

### Freemium Subscription

Premium features:

* Unlimited disease diagnosis
* Advanced analytics
* Unlimited AI consultations

### IoT Hardware

Future products:

* Smart pots
* Moisture sensors
* Automated irrigation systems

### Partner Marketplace

Connecting users with:

* Local nurseries
* Plant stores
* Florists

---

## 🤝 Contributing

Contributions are welcome.

```bash
# Fork repository

git checkout -b feature/new-feature

git commit -m "Add new feature"

git push origin feature/new-feature
```

Then create a Pull Request.

