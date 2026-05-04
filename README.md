# Habbify

A productivity platform that combines **task management**, **habit tracking**, and **personal analytics** in one place. Built with Django and React, Habbify helps you build streaks, stay organized, and understand your productivity patterns.

![Python](https://img.shields.io/badge/Python-3.11-blue) ![Django](https://img.shields.io/badge/Django-5.2-green) ![React](https://img.shields.io/badge/React-19-61DAFB) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

- **Task Management** — Create, prioritize, and track one-off tasks with due dates and reminders. Soft-delete with restore support.
- **Habit Tracking** — Build daily, weekly, monthly, or custom-frequency habits. Visual 14-day, 4-week, and 3-month progress grids.
- **Streaks & Achievements** — Consecutive completion tracking with milestone badges (Week Warrior at 7 days, Month Master at 30).
- **Calendar View** — See all your tasks laid out by date in a monthly calendar.
- **Personalized Onboarding** — Morning / evening / anytime productivity preference setup on first login.
- **Theme System** — Light, dark, and night modes with custom primary, secondary, and accent color pickers.
- **Notifications** — In-app alerts for tasks, habits, and earned achievements.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5.2, Python 3.11 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Templates | Django Templates + HTMX |
| Frontend SPA | React 19, Vite, TailwindCSS |
| State Management | Zustand |
| Charts | Recharts |
| HTTP Client | Axios |
| Testing | Pytest, pytest-django |
| Linting | Ruff |
| CI/CD | GitHub Actions |

---

## Project Structure

```
habbify/
├── apps/
│   └── todo_app/               # Main Django app
│       ├── models.py           # Task, Habit, HabitLog, UserProfile, Notification, Achievement
│       ├── views.py
│       ├── urls.py
│       ├── admin.py
│       ├── tests.py
│       ├── static/             # CSS, JS, images
│       └── templates/          # Django HTML templates
├── backend/                    # Microservices backend (in progress)
│   ├── habits/
│   ├── tasks/
│   ├── users/
│   ├── ai/
│   └── insights/
├── config/
│   └── settings/
│       ├── base.py             # Shared settings
│       ├── dev.py              # Development overrides
│       └── prod.py             # Production overrides
├── frontend/                   # React SPA (Vite)
│   └── src/
│       ├── pages/              # Dashboard, Habits, Calendar, Insights, etc.
│       ├── components/         # Sidebar, BottomNav, Modals, HabitRing
│       ├── api/                # Axios API clients
│       └── hooks/              # useAuth, useTheme
├── .github/
│   └── workflows/ci.yml
├── manage.py
├── requirements.txt
└── pytest.ini
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ *(only needed for the React SPA)*

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/Tiego3/habbify.git
cd habbify

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Apply database migrations
python manage.py migrate

# 5. (Optional) Create an admin superuser
python manage.py createsuperuser

# 6. Start the dev server
python manage.py runserver
```

App available at `http://127.0.0.1:8000/` — admin at `/admin/`.

### Frontend Setup *(optional React SPA)*

The Django templates work standalone. The React SPA proxies API calls to Django on port 8000.

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
npm run build     # Production build
```

---

## Configuration

Settings are split by environment under `config/settings/`.

| File | Purpose |
|------|---------|
| `base.py` | Shared config (installed apps, middleware, templates) |
| `dev.py` | DEBUG=True, SQLite, debug toolbar |
| `prod.py` | Reads secrets from env, enforces HTTPS/HSTS |

`manage.py` defaults to `config.settings.dev`. Override for production:

```bash
DJANGO_SETTINGS_MODULE=config.settings.prod python manage.py runserver
```

### Production Environment Variables

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Required — Django secret key |
| `ALLOWED_HOSTS` | Comma-separated allowed domains |
| `DATABASE_URL` | PostgreSQL URL, e.g. `postgres://user:pass@host/db` |

---

## Data Models

| Model | Description |
|-------|-------------|
| `UserProfile` | Extends User — theme, color preferences, onboarding state |
| `Task` | One-off to-dos with priority, due date, soft-delete |
| `Habit` | Recurring habits (daily / weekly / monthly / quarterly / custom) |
| `HabitLog` | Daily completion records used for streak calculation |
| `Achievement` | Earned badges: "Week Warrior" (7 days), "Month Master" (30 days) |
| `Notification` | In-app alerts for tasks, habits, achievements, and system events |

---

## Running Tests

```bash
# All tests
pytest

# Verbose output
pytest -v

# Specific class
pytest -k "TestHabitModel"

# Short traceback, quiet output
pytest --tb=short -q
```

Tests cover streak calculation, soft-delete/restore, overdue detection, and database query efficiency (single-query assertions for progress grids).

---

## CI/CD

GitHub Actions runs on every push and pull request:

1. Ubuntu latest, Python 3.11
2. Install dependencies from `requirements.txt`
3. Lint with `ruff check .`
4. Run tests with `pytest --tb=short -q`

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Roadmap

- [x] Task management with priority and soft-delete
- [x] Habit tracking with daily / weekly / monthly frequency
- [x] Streak tracking and achievement badges
- [x] Calendar view
- [x] Theme system (light / dark / night + custom colors)
- [x] Personalized onboarding flow
- [x] GitHub Actions CI pipeline
- [ ] AI-powered habit suggestions
- [ ] Insights and productivity analytics
- [ ] React SPA — full feature parity with Django templates
- [ ] Public REST API (DRF + JWT)
- [ ] Mobile app (React Native)
- [ ] Email and push reminders

---


