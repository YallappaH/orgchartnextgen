# NextGen OrgChart Project

This project is a Salesforce Lightning Web Components (LWC) application that displays an interactive organization chart using data retrieved via an Apex controller. It provides various filtering options (by department, pending training, and training course) and displays detailed employee information—including profile images, direct reports count, and pending training courses—in a side panel.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [File Details](#file-details)
  - [Apex Class](#apex-class)
  - [Lightning Web Components](#lightning-web-components)
    - [orgChartNextGen](#orgchartnextgen)
    - [orgNodeNextGen](#orgnodenextgen)
    - [employeeDetailNextGen](#employeedetailnextgen)
- [Deployment Instructions](#deployment-instructions)
- [Testing the Application](#testing-the-application)
- [Notes & Troubleshooting](#notes--troubleshooting)
- [Recent Updates](#recent-updates)

## Overview

The NextGen OrgChart project visualizes the organization hierarchy and allows users to filter the view by:
- **Department**: Filter employees by selecting a department from the interactive color legend.
- **Pending Training**: Toggle to show only employees with pending training (the button shows a count badge).
- **Training Course**: Choose a specific training course (displayed as "Course Name - YYYY-MM-DD") to filter employees.

When an employee node is clicked, the employee's details are shown in a side panel. These details include the profile image, full name, title, department, email, direct reports count, pending training courses (with color-coded indicators and emojis based on due date proximity), and additional statistics like Git commits and tickets solved.

## Features

- **Interactive Department Filtering**: Click on department colors in the legend to filter employees
- **Visual Department Colors**: Each department has a distinctive color for easy identification
- **Connector Lines**: Clear visual indicators of reporting relationships
- **Responsive Layout**: Adapts to different screen sizes
- **Training Status Indicators**: Color-coded training alerts with due date indicators
- **Collapsible Hierarchy**: Support for expanding and collapsing subordinate nodes
- **Fallback Data**: Sample data provided when the actual data source is unavailable

## Folder Structure

The project follows the standard SFDX project structure. The package directory is located at:

```
OrgChartNextGen/
└── force-app/main/default
    ├── classes/
    │   └── OrgChartControllerNextGen.cls         // Apex controller to query employee data
    └── lwc/
        ├── orgChartNextGen/
        │   ├── orgChartNextGen.html              // Main component layout with filters and org chart
        │   ├── orgChartNextGen.js                // JavaScript to load data, build tree, compute direct reports, and apply filters
        │   └── orgChartNextGen.css               // Styles for the org chart layout and filter controls
        ├── orgNodeNextGen/
        │   ├── orgNodeNextGen.html               // Template for rendering individual org nodes
        │   ├── orgNodeNextGen.js                 // Logic for collapsible nodes, event handling, and layout (horizontal vs. vertical)
        │   └── orgNodeNextGen.css                // Styles for nodes, subordinates layout, and connector lines
        └── employeeDetailNextGen/
            ├── employeeDetailNextGen.html        // Template for displaying detailed employee information
            ├── employeeDetailNextGen.js          // Minimal JavaScript exposing the employee attribute
            └── employeeDetailNextGen.css         // Styles for the detail view (training colors, layout, etc.)
```

The project root also contains the `sfdx-project.json` file which specifies the package directory path.

## File Details

### Apex Class

- **OrgChartControllerNextGen.cls**  
  Retrieves employee data from Salesforce, including fields such as department, email, profile image link, pending training status, and pending courses details. Includes error handling and fallback to sample data when the actual data source is unavailable.

### Lightning Web Components

#### orgChartNextGen

This is the main component that displays the interactive org chart and filtering controls.

- **orgChartNextGen.html**  
  Contains the markup for the interactive department legend, filter controls (Hide Contractors, Pending Training with count, and Training Course dropdown) and renders the org chart on the left along with a detail panel on the right.
  
- **orgChartNextGen.js**  
  Loads employee data via Apex, builds the full organization tree while preserving the original order, computes direct report counts, and applies filters based on the user's selections. Includes methods for handling interactive department legend clicks.
  
- **orgChartNextGen.css**  
  Provides styling for layout, ensuring horizontal scrolling for the org chart, proper spacing of filter controls, styling for the detail panel, and the interactive department color legend.

#### orgNodeNextGen

This component renders an individual node (employee) of the org chart. It supports collapsible subtrees and different layouts for subordinates (horizontal for the top layers and vertical for deeper layers or for specific employees).

- **orgNodeNextGen.html**  
  Template for displaying the node content (profile image and employee name) and its subordinates.
  
- **orgNodeNextGen.js**  
  Contains the logic for handling node clicks (to select an employee), toggling collapse/expand of subordinates, and determining if the subordinates should be displayed horizontally or vertically. Includes methods for handling selection styling.
  
- **orgNodeNextGen.css**  
  Styles individual nodes, the layout for horizontal and vertical subordinate presentation, connector lines between nodes, and department-specific colors.

#### employeeDetailNextGen

This component shows detailed information about a selected employee.

- **employeeDetailNextGen.html**  
  Contains the markup for the detail view, including profile image, name, title, department, email, direct reports count, and a list of pending training courses (with due dates, color coding, and emojis).
  
- **employeeDetailNextGen.js**  
  JavaScript that exposes the employee attribute to the template and calculates training statistics.
  
- **employeeDetailNextGen.css**  
  Provides styles for the detail view, including color definitions for training status (red, yellow, grey, green), styling for the "None" message, and optional department background colors. Includes visual indicators for training status.

## Deployment Instructions

1. **Verify `sfdx-project.json`**  
   Confirm that the `packageDirectories` property in your `sfdx-project.json` file points to `"OrgChartNextGen"`:
   ```json
   {
       "packageDirectories": [
           {
               "path": "OrgChartNextGen",
               "default": true
           }
       ],
       "namespace": "",
       "sfdcLoginUrl": "https://login.salesforce.com",
       "sourceApiVersion": "63.0"
   }
   ```

2. **Deploy to Your Salesforce Org**  
   Open your terminal (or command prompt) and run:

   ```
   sfdx force:source:deploy -p OrgChartNextGen -u YourOrgAlias
   ```

   Or with the newer CLI format:
   ```
   sf project deploy start --source-dir OrgChartNextGen --target-org YourOrgAlias
   ```

   This command will deploy all the metadata (Apex class and LWC components) to your Salesforce org.

3. **Verify Deployment**  
   Check the terminal output to ensure all components and classes have been successfully deployed.

## Testing the Application

1. **Open the Lightning Page**  
   Navigate to the Lightning App, Home Page, or a custom Lightning Page where the NextGen OrgChart component is added.

2. **Interact with the Org Chart**  
   - **Filters:**
     - Use the Hide Contractors button to toggle the display of non-FTE employees.
     - Click on a department color in the legend to filter by department.
     - Click Pending Training (which shows a badge count) to toggle filtering employees with pending training.
     - Use the Training Course dropdown to filter by a specific training course (the options display as "Course Name - YYYY-MM-DD").
   - **Org Chart:**
     - The org chart is displayed on the left with nodes arranged to reflect the organization hierarchy.
     - The top-level nodes appear in their original order, with direct reports displayed according to the layout rules.
     - Connector lines visually indicate reporting relationships.
   - **Employee Details:**
     - Clicking an employee node displays a detailed view on the right side of the page.
     - The detail view shows the employee's profile image, name, title, department, email, direct reports count, and pending training courses (with due dates, color-coded status, and emojis).

## Notes & Troubleshooting

- **Console Logs:**  
  The JavaScript outputs debug logs (using console.log) that indicate how nodes are filtered and how departments/courses are compared. Use your browser's developer tools (F12) to review these logs if filters don't work as expected.

- **Date Parsing:**  
  If any training course has an invalid or unexpected due date format, a warning will be logged, and that course will be skipped from the training options. Ensure your Apex data uses parseable date strings (preferably in "YYYY-MM-DD" format).

- **Data Source Issues:**  
  If the application cannot connect to the actual data source (Int_SNOW_NextGen_SV_EMPLOYEE_ORG_HIERARC__dlm), it will automatically fall back to sample data to ensure the component still functions.

- **Styling Adjustments:**  
  The provided CSS can be adjusted in the respective files to further refine the look and feel of the org chart and detail panel.

## Recent Updates

- **Interactive Department Filtering:** Replaced the department dropdown with an interactive color legend for more intuitive filtering
- **Enhanced Department Colors:** Updated the department colors for better visibility
- **Visual Indicators:** Added clear visual indicators for the active department filter
- **Improved Connector Lines:** Enhanced the connector lines between manager and direct reports
- **Fallback Data Source:** Added robust error handling with sample data when the actual data source is unavailable
- **Style Enhancements:** Improved the overall styling and layout of the application
- **Fixed Object Immutability Issues:** Resolved issues with object extensibility in the JavaScript
- **Additional Department Support:** Added support for new departments (EDH, Data Cloud) with appropriate color coding
