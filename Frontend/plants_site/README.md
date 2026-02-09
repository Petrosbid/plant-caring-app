# PlantCare Pro - Plant Identification and Care Application

## Overview
PlantCare Pro is a comprehensive plant identification and care application that allows users to:
- Identify plants by uploading photos
- Detect plant diseases and get treatment recommendations
- Access detailed plant care guides
- Set personalized care reminders
- Browse an extensive plant database

## Features

### Plant Identification
- Upload photos of plants for instant identification
- Detailed information about identified plants
- Care instructions specific to each plant

### Disease Detection
- Upload photos of diseased plants
- Receive accurate disease diagnosis
- Get treatment and prevention recommendations

### Care Guides
- Comprehensive care instructions for different plant types
- Watering, lighting, fertilizing, and pruning guidelines
- Seasonal care adjustments

### Care Reminders
- Set personalized watering and care reminders
- Notifications for plant care tasks
- Customizable schedules

### Plant Library
- Extensive database of plants
- Search and filter capabilities
- Detailed plant information

## Technology Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/         # Common components (Header, Footer, etc.)
│   ├── plant-identification/ # Plant identification components
│   ├── disease-detection/    # Disease detection components
│   ├── care-reminders/       # Reminder components
│   └── ui/             # Basic UI components (Button, Card, etc.)
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── services/           # API service functions
├── utils/              # Utility functions
└── contexts/           # React Context providers
```

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd Frontend/plants_site
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

   Note: If you encounter network issues during installation, try:
   - Changing your network connection
   - Using a VPN to access npm registries
   - Installing packages individually: `npm install react-router-dom @types/react-router-dom`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run lint` - Runs ESLint to check for code issues
- `npm run preview` - Locally preview the production build

## API Integration

The application is designed to connect with a backend API for:
- Plant identification
- Disease detection
- User authentication
- Data persistence

Mock API services are implemented for demonstration purposes.

## Responsive Design

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Note on Dependencies

Due to potential network connectivity issues during installation, the application includes a fallback navigation system that doesn't rely on react-router-dom. If you encounter import errors related to react-router-dom, ensure all dependencies are properly installed using `npm install`.