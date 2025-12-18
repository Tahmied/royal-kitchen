# Royal Kitchen – Premium Kitchen Interior Design Platform (Based in Poland)

<img src='https://raw.githubusercontent.com/Tahmied/royal-kitchen/refs/heads/main/public/screenshot.png'/>


Royal Kitchen is a premium kitchen interior design company based in Poland.
This repository contains the official website, lead collection system, admin panel, and sales panel.

The project has been professionally designed (UI/UX by a dedicated designer) and developers implemented the frontend using raw HTML, CSS, and JavaScript.
The backend follows a clean, scalable, production-grade architecture built with Node.js and Express.

Live Website: [https://premium.royal-kitchen.pl/](url)

# About the Project

Royal Kitchen’s digital platform consists of three major components:

## 1. Landing Page (Public)

A beautifully crafted, visually polished landing page created from a professional UI design.
The purpose of this page is simple: collect customer leads.

- Built using raw HTML, CSS, and vanilla JavaScript
- Fully responsive premium UI
- High-converting lead forms
- Displays:
 -Projects (from admin panel)
 - User feedback / testimonials
 - Company branding
 - Blog sections (managed by admin)

## 2. Admin Panel

Admins can:

- View dashboard with key metrics
- Manage projects (create, edit, delete)
- Manage feedback/testimonials (create, edit, delete)
- Manage blog posts with a custom-built rich text editor
- Manage salespersons (add, edit, delete with email/password)
- Manage all leads collected from the landing page
 - Edit lead info
 - Update lead status
 - Filter & paginate leads
 - Download leads
 - Assign multiple leads to selected salespersons
- Fully role-based authentication system

# 3.Sales Panel

Salespersons can:
- Log in using credentials created by Admin
- See only the leads assigned to them
- Update lead status
- Add notes for each lead
- Restricted access (no admin features)

# Features

## Landing Page

- Fully custom-designed UI
- Built using raw HTML + CSS + JS
- Responsive and high performance
- Lead collection forms integrated with backend
- Automatically pulls: Projects, Feedbacks, Blog data

## Admin Panel

- Secure login (role-based)
- Dashboard with overview metrics
- CRUD operations for: Projects, Feedback, Blog posts, Salespersons
- Custom-built Rich Text Editor for blog content
- Lead management with: Pagination, Filtering, Editing, Status update, CSV/Excel download, Bulk assignment to sales team,
- Professional folder structure and backend architecture

## Sales Panel

- Salesperson login
- Limited role permissions
- View assigned leads only
- Update status and notes

## Backend

- Industry-level MVC structure
- Versioned API:
```bash
/api/v1/admin
/api/v1/leads
/api/v1/sales
/api/v1/projects
/api/v1/feedbacks
```
- Authentication with secure sessions/JWT
- Clean routing and controllers
- Proper middleware usage

# Tech Stack

## Frontend (Public Website)
- Raw HTML
- Raw CSS
- Vanilla JavaScript
- No frontend frameworks (high performance)

## Admin + Sales Panels
- Handled fully by the backend and templating/static files 
- Communication via REST APIs

## Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt for password security
- dotenv
- CORS

# API Route Definitions
In app.js you'll find these routes and their paths as well. Each route file has the controllers defined in it. 

```bash
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/leads', leadRoutes)
app.use('/api/v1/sales', salesAuth)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/feedbacks', feedbackRoutes)
```
## API Modules
| Base Path           | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `/api/v1/admin`     | Admin auth + dashboard + CRUD (projects, blog, feedback, salespersons) |
| `/api/v1/leads`     | Lead collection + lead management                                      |
| `/api/v1/sales`     | Salesperson login & assigned leads                                     |
| `/api/v1/projects`  | Public project data API                                                |
| `/api/v1/feedbacks` | Public testimonials API                                                |


# Installation

Clone the repository:

```bash
git clone https://github.com/Tahmied/royal-kitchen.git
cd royal-kitchen
```

Install dependencies:

```bash
npm install
```

And run this command in local terminal to run the app - 

```bash
npm run dev
```

# Environment Variables

Create a .env file:

```bash
PORT = 
MONGODB_URI = 

# auth
ADMIN_ACCESS_TOKEN_KEY = 
ADMIN_ACCESS_TOKEN_EXPIRY = 

ADMIN_REFRESH_TOKEN_KEY = 
ADMIN_REFRESH_TOKEN_EXPIRY = 

SALES_ACCESS_TOKEN_KEY = 
SALES_ACCESS_TOKEN_EXPIRY = 

SALES_REFRESH_TOKEN_KEY = 
SALES_REFRESH_TOKEN_EXPIRY = 
```
