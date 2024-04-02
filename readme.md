# D3 Choropleth Map of Oregon and Northern California Wildfire Ignition Probability

**Author:** Alister Fenix @AFenix

## Project Description

This D3.js project creates an interactive choropleth map that visualizes data through hexagonal bins across Oregon and Northern California. Developed for the GEOG575: Interactive Cartography & Geovisualization course, the goal of this project is to build skills in geovisualization techniques using D3 and topojson. This map represents public and private data sets on wildfire, emphasizing spatial distribution and densities with a hexagonal tessellation overlay and includes state boundaries for geographical context.

## Feedback & Contributions

I welcome insights and constructive criticisms from you to enhance this project further. I am particularly interested in suggestions on:
- Enhancing data representation, scaling, and styling.
- Innovative features or user interactions that could be integrated.
- Implementing UX/UI design principles more effectively.

## Dependencies

- **D3.js v6** for creating dynamic, interactive data visualizations in the web browser.
- **TopoJSON** for efficient transmission of geographic data.

## Project Structure

This repository is organized as follows:

- `index.html`: Serves as the entry point, incorporating the map along with its interactive functionalities.
- `js/main.js`: Contains the JavaScript logic for generating the choropleth map, including data loading and visual effects.
- `css/style.css`: Defines custom styles for the map and other webpage elements to improve aesthetics and user experience.
- `data/region-data.json`: GeoJSON or TopoJSON dataset detailing the geographical and data aspects for Oregon and Northern California.
- `lib/`: Folder containing the D3.js library and potentially other dependencies.
- `img/`: Directory for storing image files used in the project. Currently empty.

## Getting Started

1. Clone or download this repository to your local system.
2. Open the project in a code editor or IDE (e.g., Visual Studio Code, Atom, Sublime Text).
3. **Launch a Local Server**:
   - **Using Python**:
     - Ensure Python is installed on your system. If not, download it [here](https://www.python.org/downloads/).
     - Open a terminal or command prompt and navigate to the project directory.
     - Execute `python3 -m http.server` (or `python -m SimpleHTTPServer` for Python 2.x).
     - Access `http://localhost:8000/index.html` in your web browser (adjust the port number if necessary).
   - **Using an IDE Extension**:
     - Many IDEs provide server extensions (e.g., "Live Server" for Visual Studio Code).
     - Install the relevant extension, then follow its instructions to start the server and view the project in your browser.

