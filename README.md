# TrivoGroup - Project Management System

## Overview
TrivoGroup is a comprehensive project management system built with Next.js (frontend) and Node.js/Express (backend). The system enables efficient management of projects, employees, tasks, and team collaboration.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **UI Icons**: Lucide React

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based authentication
- **File Upload**: Multer with Cloudinary
- **Email Service**: Nodemailer

## Project Structure

```
trivo_client/
├── src/app/
│   ├── admin/          # Admin dashboard routes
│   ├── employee/       # Employee dashboard routes
│   ├── manager/        # Manager dashboard routes
│   ├── components/     # Reusable UI components
│   ├── api/           # API utilities
│   └── store/         # Redux store configuration

trivo_server/
├── src/
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── configs/       # Configuration files
```

## Key Features

### 1. Employee Management
- **Add Employee**: Comprehensive employee onboarding with search dropdown for manager assignment
- **Search & Select**: Real-time search with debounced API calls
- **Profile Management**: Complete employee profile with image upload
- **Role-based Access**: Different views for admin, manager, and employee roles

### 2. Project Management
- **Create Projects**: Add new projects with detailed information
- **Assign Members**: Search dropdown to select and assign multiple employees
- **Task Management**: Add multiple tasks to projects with employee assignment
- **Progress Tracking**: Real-time project status and progress monitoring

### 3. Search Functionality
- **Employee Search**: Search employees by name with dropdown selection
- **Manager Search**: Search and assign managers to employees
- **Project Search**: Search projects with real-time filtering
- **Multi-select**: Add multiple employees/tasks in single operation

## Core Components

### Search Dropdown Components
The system uses reusable search dropdown components for employee/manager selection:

#### ManagerSearchDropdown
```typescript
// Usage for manager selection
<ManagerSearchDropdown
  value={selectedManagerId}
  onChange={(managerId) => setManagerId(managerId)}
  placeholder="Search and select manager"
/>
```

#### ManagerProjectSearch
```typescript
// Usage for employee selection in projects
<ManagerProjectSearch
  role="employee"
  selectedUser={selectedEmployee}
  onSelect={(user) => handleEmployeeSelect(user)}
/>
```

### Project Assignment Flow
1. **Project Selection**: Search and select existing projects
2. **Employee Assignment**: Search dropdown for employee selection
3. **Task Creation**: Add multiple tasks with employee assignment
4. **Bulk Operations**: Add multiple employees and tasks in single operation

## API Endpoints

### Authentication
- `POST /auth/register` - Register new employee/manager
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Project Management
- `GET /manager/:id/getProjectByManager` - Get manager's projects
- `POST /manager/addManagerProject` - Assign employee to project
- `POST /manager/addTask` - Add task to project
- `GET /projectManagerSearch/:managerId` - Search manager's projects

### Search Endpoints
- `GET /search?query=&role=` - Search users by name and role
- `GET /projectManagerSearch/:managerId?query=` - Search projects by manager

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd TrivoGroup
```

2. **Install dependencies**
```bash
# Frontend
cd trivo_client
npm install

# Backend
cd ../trivo_server
npm install
```

3. **Environment Configuration**

Create `.env` files:

**trivo_server/.env**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trivogroup
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
```

**trivo_client/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. **Database Setup**
```bash
# Start MongoDB
mongod

# The application will create collections automatically
```

5. **Start Development Servers**

```bash
# Backend
cd trivo_server
npm run dev

# Frontend (new terminal)
cd trivo_client
npm run dev
```

## Usage Guide

### Adding Employees with Manager Assignment

1. **Navigate to Admin Dashboard**
   - Login as admin
   - Go to `/admin/employee`

2. **Add New Employee**
   - Click "Add Employee" button
   - Fill in employee details
   - Use manager search dropdown to assign reporting manager
   - The search provides real-time suggestions with debounced API calls

3. **Search Functionality**
   - Type 3+ characters to trigger search
   - Select from dropdown results
   - Selected manager ID is automatically assigned

### Project Management Workflow

1. **Create Project**
   - Navigate to manager dashboard
   - Click "Add Project" to create new project

2. **Assign Project Members**
   - Use search dropdown to find employees
   - Select multiple employees for assignment
   - Each assignment creates tasks automatically

3. **Add Multiple Tasks**
   - Use "Add Member" button to add more task assignments
   - Each member can have multiple tasks
   - Bulk save operation for efficiency

### Search Features

- **Real-time Search**: 300ms debounce for optimal performance
- **Role-based Filtering**: Search specific user roles (employee/manager)
- **Visual Feedback**: Loading states and no-results messages
- **Keyboard Navigation**: Arrow keys and Enter for selection
- **Click Outside**: Auto-close dropdown on outside clicks

## Development Guidelines

### Component Architecture
- **Reusable Components**: All search functionality uses consistent components
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Comprehensive error states and user feedback
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### API Integration
- **Axios Interceptors**: Centralized error handling
- **Loading States**: Consistent loading indicators
- **Debounced Requests**: Optimized API calls
- **Error Boundaries**: Graceful error handling

### Code Style
- **ESLint**: Enforced code quality
- **Prettier**: Consistent formatting
- **TypeScript**: Strict type checking
- **Component Documentation**: JSDoc comments for complex functions

## Troubleshooting

### Common Issues

1. **Search Not Working**
   - Check API endpoints are accessible
   - Verify CORS configuration
   - Check network tab for API responses

2. **Image Upload Issues**
   - Verify Cloudinary configuration
   - Check file size limits (5MB max)
   - Ensure proper file type validation

3. **Database Connection**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure database permissions

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=trivo:* npm run dev
```

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit with descriptive messages
4. Push to branch and create pull request
5. Ensure all tests pass

## Support
For issues and questions, please create an issue in the repository or contact the development team.
