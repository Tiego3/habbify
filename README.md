# Habbify

A Django-based habit tracking and productivity application that helps users build better habits, manage tasks, and track their personal growth journey.

## Overview

Habbify is a comprehensive productivity platform that combines habit tracking, todo management, and user analytics into a single, cohesive application. Built with Django, it provides users with the tools they need to establish positive routines, complete tasks efficiently, and visualize their progress over time.

## Features

### Habit Tracking
- Create and manage custom habits
- Set frequency goals (daily, weekly, monthly)
- Track habit completion with streaks
- Visual progress indicators
- Habit statistics and insights

### Todo Management
- Create, update, and delete tasks
- Priority levels and due dates
- Task categorization
- Completion tracking
- Task filtering and search

### User Management
- Secure user authentication
- User profiles and preferences
- Personal dashboard
- Activity history
- Progress analytics

## Technology Stack

- **Backend Framework**: Django (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Template Engine**: Django Templates


## Project Structure

```
habbify/
├── habits/              # Habit tracking app
├── todo_app/            # Todo/task management app
├── users/              # User authentication and profiles
├── happify/            # Main project configuration
├── todo_project/       # Additional todo project settings
├── templates/          # Global HTML templates
├── static/             # CSS, JavaScript, and images
├── manage.py           # Django management script
├── settings.py         # Django settings
├── urls.py             # URL routing configuration
├── wsgi.py             # WSGI configuration
└── asgi.py             # ASGI configuration
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tiego3/habbify.git
   cd habbify
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   If `requirements.txt` doesn't exist, install Django:
   ```bash
   pip install django
   ```

4. **Run database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Main site: `http://127.0.0.1:8000/`
   - Admin panel: `http://127.0.0.1:8000/admin/`

## Usage

### Creating Habits
1. Register or log in to your account
2. Navigate to the Habits section
3. Click "Create New Habit"
4. Set habit name, description, frequency, and goals
5. Start tracking your progress daily

### Managing Tasks
1. Go to the Todo section
2. Add new tasks with priority and due dates
3. Mark tasks as complete when done
4. Filter tasks by status, priority, or category

### Viewing Progress
1. Access your Dashboard
2. View habit streaks and completion rates
3. Analyze task completion statistics
4. Track your productivity trends over time

## Configuration

### Environment Variables

Create a `.env` file in the root directory with:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Database Configuration

For PostgreSQL (production):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'habbify_db',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Testing

Run the test suite:
```bash
python manage.py test
```

Run tests for specific apps:
```bash
python manage.py test habits
python manage.py test todo_app
python manage.py test users
```

## Database Models

### Habit Model
- `name`: Habit title
- `description`: Detailed description
- `frequency`: Daily/Weekly/Monthly
- `target_count`: Goal frequency
- `created_at`: Creation timestamp
- `user`: Foreign key to User

### Todo Model
- `title`: Task title
- `description`: Task details
- `priority`: Low/Medium/High
- `due_date`: Deadline
- `completed`: Boolean status
- `user`: Foreign key to User

### User Profile Model
- Extends Django's built-in User model
- Additional fields for preferences
- Statistics tracking
- Activity history

## Security Considerations

- User authentication required for all personal data
- CSRF protection enabled
- Password hashing with Django's built-in system
- SQL injection protection through ORM
- XSS protection through template escaping

## Potential Future Updates

### Short-term Enhancements (v2.0)
- **Dark Mode**: Implement theme switching for better user experience
- **Mobile Responsiveness**: Optimize layouts for mobile devices
- **Habit Categories**: Add ability to categorize habits (Health, Productivity, Fitness, etc.)
- **Reminders & Notifications**: Email/push notifications for habit tracking and task deadlines
- **Data Export**: Allow users to export their data (CSV, JSON, PDF reports)

### Medium-term Features (v3.0)
- **Social Features**: 
  - Share habits with friends
  - Community challenges
  - Accountability partners
  - Public/private habit sharing
- **Gamification**:
  - Achievement badges
  - Points and rewards system
  - Leaderboards
  - Streak milestones
- **Advanced Analytics**:
  - Weekly/monthly reports
  - Habit correlation analysis
  - Productivity heatmaps
  - Time-of-day performance insights
- **Calendar Integration**: Sync with Google Calendar, Outlook
- **API Development**: RESTful API for mobile app integration

### Long-term Vision (v4.0+)
- **Mobile Applications**: Native iOS and Android apps
- **AI-Powered Insights**:
  - Personalized habit recommendations
  - Optimal scheduling suggestions
  - Predictive analytics for habit success
  - Smart reminders based on user behavior
- **Advanced Task Management**:
  - Recurring tasks
  - Subtasks and dependencies
  - Project management features
  - Time tracking integration
- **Collaboration Tools**:
  - Team habits
  - Shared todo lists
  - Group challenges
  - Progress sharing
- **Integration Ecosystem**:
  - Fitness tracker integration (Fitbit, Apple Health)
  - Productivity apps (Todoist, Trello)
  - Smart home devices (Alexa, Google Home)
  - Pomodoro timer integration
- **Premium Features**:
  - Unlimited habits
  - Advanced reporting
  - Custom themes
  - Priority support
  - Ad-free experience

### Technical Improvements
- **Performance Optimization**:
  - Database query optimization
  - Caching implementation (Redis)
  - CDN for static files
  - Database indexing
- **Architecture Enhancements**:
  - Migrate to Django REST Framework for API
  - Implement Celery for background tasks
  - WebSocket support for real-time updates
  - Microservices architecture consideration
- **DevOps**:
  - Docker containerization
  - CI/CD pipeline setup
  - Automated testing suite expansion
  - Infrastructure as Code (Terraform/Ansible)
- **Monitoring & Logging**:
  - Application performance monitoring (APM)
  - Error tracking (Sentry)
  - User analytics (Google Analytics, Mixpanel)
  - Log aggregation (ELK Stack)

### UI/UX Improvements
- Progressive Web App (PWA) capabilities
- Drag-and-drop task management
- Keyboard shortcuts
- Customizable dashboard layouts
- Accessibility improvements (WCAG compliance)
- Multi-language support (i18n)

## Roadmap

- [x] Basic habit tracking
- [x] Todo list functionality
- [x] User authentication
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Email notifications
- [ ] Social features
- [ ] Mobile apps
- [ ] API development

---

**Happy Habit Building! 🎯**
