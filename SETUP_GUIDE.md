# Plant App Setup Guide

This guide will help you set up the Plant App project for development.

## Prerequisites

- Python 3.8+
- Node.js 16+
- Flutter SDK
- Git

## Repository Structure

```
plant_app/
├── Backend/           # Django backend
├── Frontend/          # Frontend applications
│   ├── plants_app/    # Flutter mobile app
│   └── plants_site/   # React web app
├── README.md          # Main project description
├── SETUP_GUIDE.md     # This file
└── .gitignore         # Files to ignore in Git
```

## Backend Setup (Django)

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser account:
   ```bash
   python manage.py createsuperuser
   ```

6. Load initial data (optional):
   ```bash
   python manage.py populate_plants
   python manage.py populate_diseases
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Machine Learning Models Setup

The ML models are not included in the repository due to their large size. To download them:

1. For plant identification models:
   ```bash
   python manage.py populate_db
   ```

2. Or manually download the models to the `Backend/models/` directory according to the requirements in your code.

## Frontend Setup

### Flutter Mobile App (plants_app)

1. Navigate to the Flutter app directory:
   ```bash
   cd Frontend/plants_app
   ```

2. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

### React Web App (plants_site)

1. Navigate to the React app directory:
   ```bash
   cd Frontend/plants_site
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables:
   ```
   REACT_APP_API_URL=http://localhost:8000/api/
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create `.env` files in the appropriate directories with the following variables:

### Backend (.env in Backend/)
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
OPENAI_API_KEY=your-openai-api-key
```

### Frontend/plants_site (.env in Frontend/plants_site/)
```
VITE_API_URL=http://localhost:8000/api/
```

## Running Tests

### Backend Tests
```bash
cd Backend
python manage.py test
```

### Frontend Tests
For Flutter:
```bash
cd Frontend/plants_app
flutter test
```

For React:
```bash
cd Frontend/plants_site
npm test
```

## API Documentation

The backend API is available at `http://localhost:8000/api/` when running locally.
Documentation is available at `http://localhost:8000/api/docs/`.

## Troubleshooting

1. **Module not found errors**: Make sure you've activated your virtual environment and installed all dependencies.

2. **Database errors**: Run migrations with `python manage.py migrate`.

3. **ML Model errors**: Ensure the models are properly downloaded to the `Backend/models/` directory.

4. **Frontend build errors**: Clear cache with `flutter clean` or `npm run clean` and reinstall dependencies.