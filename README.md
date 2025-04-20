# GISChat

تطبيق ويب لرفع وعرض البيانات الجغرافية باستخدام GeoServer، Node.js، وReact.

## المتطلبات
- [Docker Desktop](https://www.docker.com/get-started)

## التثبيت
1. استنسخ المستودع:
   ```bash
   git clone https://github.com/your-username/gischat.git
   cd gischat

   GIS Chat - Frontend
This repository contains the frontend of the GIS Chat application, built with React. It provides an interactive GIS interface for map visualization and geospatial data interaction. The backend is located in the GIS Chat Backend repository.
Getting Started

Clone the repository:
git clone https://github.com/OmarEltayeb606/GIS-chat-front-end.git
cd GIS-chat-front-end


Install dependencies:
npm install


Start the development server:
npm start


Open the app: Navigate to http://localhost:3000 in your browser.


Project Structure

src/: Contains React components and styles.
components/Home/: Home page components (WelcomeScreen, ExploreWithUsVector).
components/MapView/: Map visualization component.
styles/: Global CSS styles (global.css).


public/: Static assets.

Styling
The project uses modern CSS with animations for a professional look:

Global Styles (src/styles/global.css): Defines fonts, colors, and animated background.
Home Styles (src/components/Home/Home.css): Styles for the home page with fade-in and hover animations.
MapView Styles (src/components/MapView/MapView.css): Styles for the map interface with zoom-in animation.

To update styles locally:

Replace the contents of each CSS file with the provided code.

Ensure the CSS files are imported in their respective components:
import './Home.css'; // In Home.js
import './MapView.css'; // In MapView.js
import './styles/global.css'; // In App.js or index.js



Large Files
Large geospatial files (e.g., *.TIF, *.tiff) are stored externally due to GitHub's file size limits. Download them from [Insert Google Drive/AWS S3 link] and place them in src/components/server/uploads/.
Backend
The frontend communicates with a Python-based backend. Refer to the Backend Repository for setup instructions.
