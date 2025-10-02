# Globe News Monitor 🌍

A beautiful 3D interactive globe application built with React, Three.js, and Tailwind CSS that displays news activity across different countries and cities.

## Features

- **Interactive 3D Globe**: Google Earth-like experience with smooth rotations and zoom
- **Country Selection**: Click on any country to see detailed information
- **City News Monitoring**: Visual indicators showing news activity levels with color coding
- **Real-time News Panel**: Comprehensive news feed with categorized articles
- **Responsive Design**: Works seamlessly across different screen sizes
- **Beautiful UI**: Modern dark theme with smooth animations

## Tech Stack

- **React** - Frontend framework
- **Three.js** - 3D graphics and WebGL rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three-fiber
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd globe-news-app
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Globe Interaction
- **Left click + drag**: Rotate the globe
- **Right click + drag**: Pan the view
- **Scroll wheel**: Zoom in/out
- **Click country markers**: Select a country to view details

### News Activity Colors
- 🔴 **Red**: High activity (20+ news items)
- 🟠 **Orange**: Medium-high activity (15-20 items)
- 🟡 **Yellow**: Medium activity (10-15 items)
- 🟢 **Light Green**: Low-medium activity (5-10 items)
- 🟢 **Green**: Low activity (0-5 items)

## Project Structure

```
src/
├── App.js                 # Main App component
├── Globe.js               # Main Globe component with 3D rendering
├── NewsPanel.js           # News panel with city details and news feed
├── EnhancedEarth.js       # Alternative enhanced Earth component
├── index.css              # Global styles with Tailwind
└── index.js               # React entry point
```

## Components

### Globe.js
- Main component handling the 3D globe rendering
- Country and city markers with interaction
- Integration with Three.js and react-three-fiber

### NewsPanel.js
- Sidebar panel showing country and city information
- News feed with categorized articles
- Interactive city selection

## Features for Your Team

The application is designed with modularity in mind. Your team can easily:

1. **Replace News Data**: Update the `sampleNewsData` object in `NewsPanel.js` with real API calls
2. **Add More Countries**: Extend the `countriesData` array in `Globe.js`
3. **Customize Colors**: Modify the color scheme in the `getNewsColor` function
4. **Add New Features**: The component structure allows for easy extension

## API Integration Points

To connect with real news APIs, update these areas:

1. **News Data**: Replace `sampleNewsData` in `NewsPanel.js`
2. **Country Data**: Update `countriesData` with your backend data
3. **Real-time Updates**: Add WebSocket or polling mechanisms for live updates

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)
