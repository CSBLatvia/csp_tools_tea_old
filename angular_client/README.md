# Angular Client Documentation

This project is an Angular-based application that provides interactive data visualization tools for economic analysis with support for multiple languages (Latvian and English).

## Technical Stack

- **Angular**: 16.2.12
- **Clarity Design System**: 16.2.0
- **ngx-slider-v2**: 16.0.2

## Application Routes

The application uses a language-based routing structure with the following routes:

### Main Routes
- `/:lang/landing` - Landing page
- `/:lang/about` - About project information
- `/:lang/api` - API documentation

### Map Routes
- `/:lang/map/:year/:M1/:M2/:T1/:T2/:M3/:M4` - Map visualization with parameters

Where:
- `:lang` - Language code ('lv' or 'en')
- `:year` - Year for data display
- `:M1` - First parameter (workplace/place-of-residence)
- `:M2` - Second parameter (number-of-employees/added-value/value-produced)
- `:T1` - Territory level (territories-3/territories-4/territories-7)
- `:T2` - Selected territory or 'all'
- `:M3` - Third parameter (industry/profession/sector) or 'none'
- `:M4` - Fourth parameter or 'none'

## Map Visualization System

The map visualization system is a core feature that provides interactive data visualization capabilities.

### Visualization Types

The application supports multiple visualization types based on route parameters:
1. **Circles Visualization (VIZ=1)** - When M3='none', M4='none', T2='all'
2. **Circles Region Visualization (VIZ=2)** - When M3='none', M4='none', T2≠'all'
3. **Circles Sectors Visualization (VIZ=3)** - When M3≠'none', T2='all'
4. **Circles Sectors Region Visualization (VIZ=4)** - When M3≠'none', T2≠'all'

### Core Components

#### Map Modules
- **mod-map** - Main map module with routing and components
- **mod-landing** - Landing page module
- **mod-about** - About page module
- **mod-about-api** - API documentation module
- **mod-translations-admin** - Translation management module

#### UI Components
- **components-shared-all** - Shared components across the application
- **components-shared-ui** - UI-specific shared components
- **ui-controls** - Custom UI controls (combo boxes, dropdowns, toggles, etc.)

#### View Components
- **view-landing** - Landing page view
- **view-about** - About page view
- **view-about-api** - API documentation view
- **view-map** - Map visualization view
- **view-settings** - Settings view

### Data Management

The application uses a central ModelService that manages:
- Route handling and parameter parsing
- Data loading and processing
- Translation management
- Configuration settings
- Event handling for updates

## Configuration System

The application uses JSON configuration files located in `src/assets/config/`:
- `config.json` - Main application configuration
- `translations.json` - Translation strings

## Development Information

### Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later)

### Installation
```
npm install
```

### Development Server
```
npm start
```
This will start the application on `http://localhost:4200/`.

### Building for Production
```
npm run build
```
For a production build with optimizations:
```
npm run build:prod
```

The build artifacts will be stored in the `dist/` directory.

### Browser Compatibility
- Browser list can be managed with browserlist queries in the `.browserlistrc` file
- To see active browsers run command: `npx browserslist`

### Additional Notes
- For screenshot functionality, use the event: `document.body.classList.add('screenShotReady')`
