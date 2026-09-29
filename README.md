# Library School System

A web-based library management system for schools. This application provides functionality for managing books, users, and library operations.

## Features

- 📚 Book Management
- 👥 User Management (Admin & Regular Users)
- 📋 Library Operations
- 📊 Activity Logging
- 💬 Feedback System

## Project Structure

```
Library-School-System/
├── src/
│   ├── pages/          # Page components
│   │   ├── home.js
│   │   ├── admin.js
│   │   ├── feedback.js
│   │   └── logs.js
│   ├── js/             # JavaScript logic
│   │   ├── app.js      # Main application file
│   │   ├── router.js   # Page routing
│   │   └── store.js    # State management
│   ├── css/            # Stylesheets
│   │   ├── base.css
│   │   ├── forms.css
│   │   ├── header.css
│   │   └── tables.css
│   ├── assets/         # Images and resources
│   │   └── logo.png
│   └── README.md       # Source documentation
├── index.html          # Entry point
├── main.pjs            # Main process file
└── README.md           # This file

```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server installation required - runs entirely in the browser

### Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/DavidLinker101/Library-School-System.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Library-School-System
   ```

3. Open `index.html` in your web browser

### Usage

- **Home Page**: View library information and available books
- **Admin Panel**: Manage books, users, and system settings
- **Feedback**: Submit feedback about the library system
- **Logs**: View system activity and operations history

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser LocalStorage / IndexedDB
- **Architecture**: Single Page Application (SPA)

## For Groupmates

This is a collaborative school project. All source code is in the `src/` folder:
- Modify pages in `src/pages/`
- Add logic in `src/js/`
- Update styles in `src/css/`

To contribute:
1. Each member can work on different pages or features
2. Test your changes in `index.html`
3. Push your changes back to this repository

## File Descriptions

| File | Purpose |
|------|---------|
| `index.html` | Main entry point - open this in a browser |
| `src/js/app.js` | Core application logic |
| `src/js/router.js` | Handles page navigation |
| `src/js/store.js` | Manages application state |
| `src/pages/*.js` | Individual page components |
| `src/css/*.css` | Styling for different sections |

## Notes

- This project was created for educational purposes
- All data is stored locally in the browser
- No database server is required

## License

School Project

## Questions?

If you have questions about the code, check the source files or ask your groupmates!

---

**Last Updated**: September 2026
