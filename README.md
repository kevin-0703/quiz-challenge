# QuizHub — Full-Stack Quiz Platform

> **Production-grade documentation** · Intended for engineering review prior to public release

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Repository Structure](#4-repository-structure)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Backend — Django REST API](#6-backend--django-rest-api)
   - 6.1 [Data Models](#61-data-models)
   - 6.2 [API Reference](#62-api-reference)
   - 6.3 [Permission Matrix](#63-permission-matrix)
   - 6.4 [Business Rules & Validations](#64-business-rules--validations)
7. [Frontend — React SPA](#7-frontend--react-spa)
   - 7.1 [Routing](#71-routing)
   - 7.2 [Page Catalogue](#72-page-catalogue)
   - 7.3 [Component Library](#73-component-library)
   - 7.4 [API Service Layer](#74-api-service-layer)
   - 7.5 [Custom Hooks](#75-custom-hooks)
8. [User Flows](#8-user-flows)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
   - 9.1 [Docker Compose](#91-docker-compose)
   - 9.2 [Environment Variables](#92-environment-variables)
   - 9.3 [Local Development Setup](#93-local-development-setup)
10. [Security Considerations](#10-security-considerations)
11. [Known Limitations & Technical Debt](#11-known-limitations--technical-debt)

---

## 1. Overview

**QuizHub** is a full-stack web application for authoring, publishing, and taking multiple-choice quizzes. The platform is split into two distinct user-role categories:
|
Role
|
Description
|
|

---

## |

|
|
**
Quiz Creator
**
|
A registered, authenticated user who can create, build, edit, publish, and delete quizzes.
|
|
**
Quiz Taker
**
|
Any person (authenticated or anonymous) who can browse published quizzes on the Explore page and attempt them by supplying a name and email address.
|
The platform enforces a strict **two-phase quiz lifecycle** (draft → published) and a **10-minute attempt window** with server-side expiry tracking. Quiz owners have full control over their own content, while an optional `is_admin` flag grants super-user visibility across all platform content.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (User)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / HTTP
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Frontend  (React + Vite + TailwindCSS)          │
│   Served by  Nginx  (port 80 in container / 5173 in dev)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch() with credentials: "include"
                           ▼
┌──────────────────────────────────────────────────────────────┐
│         Backend  (Django 5.2 + Django REST Framework)        │
│              Gunicorn / runserver  (port 8000)               │
│                                                              │
│  ┌────────────┐  ┌───────────┐  ┌──────────────────────┐   │
│  │  users app │  │quizzes app│  │    attempts app       │   │
│  │ /api/auth/ │  │/api/quiz/ │  │ /api/attempts/        │   │
│  └────────────┘  └───────────┘  └──────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ psycopg2 (PostgreSQL wire protocol)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL 15  (port 5432)                      │
└──────────────────────────────────────────────────────────────┘
```

## All communication between the browser and backend uses `credentials: "include"` so that HttpOnly cookies are automatically sent on every request.

## 3. Technology Stack

### Backend

|
Concern
|
Library / Tool
|
Version
|
|

---

## |

## |

|
|
Web framework
|
Django
|
5.2
|
|
REST API
|
djangorestframework
|
3.16
|
|
Authentication
|
djangorestframework-simplejwt
|
5.5
|
|
CORS
|
django-cors-headers
|
4.9
|
|
API documentation
|
drf-spectacular
|
0.29
|
|
Database
|
PostgreSQL 15
|
—
|
|
ORM adapter
|
psycopg2-binary
|
2.9
|
|
Static files
|
WhiteNoise
|
6.11
|
|
Production server
|
Gunicorn
|
24.0
|
|
Admin theme
|
django-jazzmin
|
3.0
|

### Frontend

|
Concern
|
Library / Tool
|
Version
|
|

---

## |

## |

|
|
UI framework
|
React
|
18.3
|
|
Build tool
|
Vite
|
5.4
|
|
Styling
|
TailwindCSS
|
3.4
|
|
Icons
|
lucide-react
|
0.468
|
|
HTTP client
|
Native
`fetch`
API
|
—
|
|
Router
|
Custom hook (
`useRoute`
)
|
—
|

### Infrastructure

|
Service
|
Technology
|
|

---

## |

|
|
Containerisation
|
Docker + Docker Compose
|
|
Frontend static serving
|
Nginx 1.27 Alpine
|
|
Database volume
|
Named Docker volume (
`postgres_data`
)
|

---

## 4. Repository Structure

```
quiz-challenge/
├── docker-compose.yml          # Orchestrates all three services
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── .env                    # Environment configuration (not committed to VCS)
│   ├── quiz/                   # Django project root (settings, root URLs)
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── users/                  # Authentication & user management app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── authentication.py   # Custom cookie-based JWT backend
│   │   └── utils.py            # set_auth_cookies helper
│   ├── quizzes/                # Quiz CRUD & lifecycle app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py      # IsQuizOwner custom permission
│   └── attempts/               # Quiz attempt & scoring app
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Root component — routing & layout switch
        ├── hooks.js            # useRoute, useAsync
        ├── index.css           # Global Tailwind base styles
        ├── services/
        │   └── api.js          # Centralised API client (fetch wrapper)
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx  # Public-facing top navigation
        │   │   └── Sidebar.jsx # Authenticated management console sidebar
        │   └── ui/             # Reusable primitive components
        │       ├── Badge.jsx
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       ├── EmptyState.jsx
        │       ├── FormField.jsx
        │       ├── Input.jsx
        │       ├── LoadingSpinner.jsx
        │       ├── Modal.jsx
        │       ├── Pagination.jsx
        │       └── Table.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── AuthPages.jsx       # LoginPage + RegisterPage
            ├── ExplorePage.jsx
            ├── CreateQuizPage.jsx
            ├── QuizBuilderPage.jsx
            ├── DashboardPage.jsx
            └── QuizAttemptPages.jsx  # QuizSetupPage, TakingQuizPage, ResultsPage
```

---

## 5. Authentication & Authorization

### Token Strategy — HttpOnly Cookie JWT

QuizHub uses **JSON Web Tokens (JWT)** delivered exclusively via **HttpOnly cookies** — never via `localStorage` or `Authorization` headers. This design prevents XSS attacks from stealing tokens.
Two cookies are set on every successful login or token refresh:
|
Cookie name
|
Contents
|
Lifetime
|
Flags
|
|

---

## |

## |

## |

|
|
`access_token`
|
Short-lived JWT (15 min)
|
15 minutes
|
`HttpOnly`
,
`Secure`
(prod),
`SameSite=Lax`
|
|
`refresh_token`
|
Long-lived JWT (7 days)
|
7 days
|
`HttpOnly`
,
`Secure`
(prod),
`SameSite=Lax`
|

### Custom Authentication Backend

The file `users/authentication.py` implements `CookieJWTAuthentication`, which extends `JWTAuthentication` from `simplejwt`. Instead of reading the `Authorization: Bearer` header, it reads `request.COOKIES["access_token"]`. If the cookie is absent or invalid, authentication silently returns `None` (falling through to anonymous access for public endpoints).

```
Request arrives
     │
     ▼
CookieJWTAuthentication.authenticate()
     │
     ├── access_token cookie present?
     │        │ NO  → return None (anonymous)
     │        │ YES ↓
     │   validate token
     │        ├── valid  → return (user, token)
     │        └── invalid / expired → return None
```

### Token Refresh — Silent Re-authentication

The API client (`services/api.js`) implements **automatic silent token refresh**:

1. Any request that returns `HTTP 401` (and is not itself an auth endpoint) triggers a single `POST /api/auth/refresh/` call.
2. The refresh endpoint reads the `refresh_token` cookie, validates it, **blacklists the old refresh token** (rotation enabled), issues a new access+refresh pair, and sets fresh cookies.
3. The original failed request is then automatically retried once.
4. If the refresh also fails (e.g. the refresh token is expired), an `isAuthError` error is thrown and the user is prompted to log in.
   A **deduplication guard** (`refreshPromise`) ensures that concurrent 401 responses from parallel API calls trigger only a single refresh request.

### Registration Flow

```
POST /api/auth/register/
  payload: { username, first_name, last_name, email, password }
  Validations (server-side):
  - username must be unique
  - email must be unique
  - password hashed via Django's create_user()
Success: HTTP 201 — user is NOT automatically logged in
  → Frontend redirects to /login
```

### Login Flow

```
POST /api/auth/login/
  payload: { username, password }
Success: HTTP 200
  - Sets access_token cookie (15 min)
  - Sets refresh_token cookie (7 days)
  - Returns { message, user: { id, username, first_name, last_name, email, is_admin } }
  → Frontend stores user object in React state, navigates to /dashboard
```

### Logout Flow

```
POST /api/auth/logout/
  - Deletes access_token cookie (path="/", matching SameSite)
  - Deletes refresh_token cookie (path="/", matching SameSite)
  - Returns HTTP 200
  → Frontend clears user state, navigates to /
```

> **Note:** The current logout implementation clears cookies on the client side but does **not** blacklist the access token on the server. A user with the raw access token in memory could still make authenticated requests for up to 15 minutes. This is acceptable under the short token lifetime but should be addressed before high-security deployments (see [§11](#11-known-limitations--technical-debt)).

### Authorization Levels

|
Level
|
Enforcement
|
Applies To
|
|

---

## |

## |

|
|
**
Public (AllowAny)
**
|
No token required
|
Register, Login, list published quizzes, take a quiz, start/submit an attempt
|
|
**
Authenticated (IsAuthenticated)
**
|
Valid
`access_token`
cookie required
|
View own quizzes, create a quiz, access
`/api/auth/me/`
|
|
**
Owner (IsQuizOwner)
**
|
Authenticated +
`quiz.creator == request.user`
|
Edit and delete a specific quiz
|
|
**
Admin (is_admin flag)
**
|
Authenticated +
`user.is_admin == True`
|
View all quizzes platform-wide in dashboard
|

---

## 6. Backend — Django REST API

### 6.1 Data Models

#### `users.User` (extends `AbstractUser`)

```
User
├── id              BigAutoField (PK)
├── username        CharField (unique)
├── first_name      CharField
├── last_name       CharField
├── email           EmailField (unique — enforced at serializer level)
├── password        CharField (hashed)
└── is_admin        BooleanField (default=False)
```

## The `AUTH_USER_MODEL` setting in `quiz/settings.py` points to `users.User`, making this the authoritative user model across the entire project.

#### `quizzes.Quiz`

```
Quiz
├── id              BigAutoField (PK)
├── creator         ForeignKey → User (CASCADE, related_name="quizzes")
├── title           CharField (max_length=200)
├── description     TextField
├── created_at      DateTimeField (auto_now_add)
├── updated_at      DateTimeField (auto_now)
└── is_published    BooleanField (default=False)
Default ordering: ["-created_at"]
```

#### `quizzes.Question`

```
Question
├── id      BigAutoField (PK)
├── quiz    ForeignKey → Quiz (CASCADE, related_name="questions")
├── text    TextField
├── marks   PositiveIntegerField (default=10)
└── order   PositiveIntegerField
Constraint: UNIQUE (quiz, order)  →  no duplicate positions per quiz
Default ordering: ["order"]
```

#### `quizzes.Choice`

```
Choice
├── id          BigAutoField (PK)
├── question    ForeignKey → Question (CASCADE, related_name="choices")
├── text        CharField (max_length=255)
└── is_correct  BooleanField (default=False)
```

---

#### `attempts.QuizAttempt`

```
QuizAttempt
├── id                 BigAutoField (PK)
├── quiz               ForeignKey → Quiz (CASCADE, related_name="attempts")
├── participant_name   CharField (max_length=100)
├── participant_email  EmailField
├── score              PositiveIntegerField (default=0)
├── started_at         DateTimeField (auto_now_add)
├── submitted_at       DateTimeField (null, blank)
├── completed          BooleanField (default=False)
└── expires_at         DateTimeField
Auto-set on first save: expires_at = started_at + 10 minutes
Helper method: is_expired() → bool
Default ordering: ["-started_at"]
```

#### `attempts.Answer`

```
Answer
├── id               BigAutoField (PK)
├── attempt          ForeignKey → QuizAttempt (CASCADE, related_name="answers")
├── question         ForeignKey → Question (CASCADE)
├── selected_choice  ForeignKey → Choice (SET_NULL, null, blank)
├── is_correct       BooleanField (default=False)
└── marks_awarded    PositiveIntegerField (default=0)
```

## Unanswered questions are recorded as `Answer` rows with `selected_choice=NULL`, `is_correct=False`, and `marks_awarded=0` to maintain a complete answer ledger per attempt.

### 6.2 API Reference

Base URL: `http://<host>:8000/api`

#### Authentication Endpoints — `/api/auth/`

|
Method
|
Path
|
Auth Required
|
Description
|
|

---

## |

## |

## |

|
|
`POST`
|
`/auth/register/`
|
No
|
Create a new user account
|
|
`POST`
|
`/auth/login/`
|
No
|
Authenticate; sets JWT cookies
|
|
`POST`
|
`/auth/logout/`
|
No
|
Clear JWT cookies
|
|
`POST`
|
`/auth/refresh/`
|
No
|
Rotate access + refresh tokens
|
|
`GET`
|
`/auth/me/`
|
Yes
|
Return the currently authenticated user
|
**`POST /auth/register/`**

```json
// Request body
{
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
// 201 Created
{ "message": "Account created successfully" }
// 400 Bad Request (validation error)
{ "email": ["email already exists"] }
```

**`POST /auth/login/`**

```json
// Request body
{ "username": "johndoe", "password": "securepassword" }
// 200 OK — sets cookies
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "is_admin": false
  }
}
```

---

#### Quiz Endpoints — `/api/quizzes/`

|
Method
|
Path
|
Auth Required
|
Description
|
|

---

## |

## |

## |

|
|
`GET`
|
`/quizzes/`
|
No
|
List all published quizzes (admins see all)
|
|
`GET`
|
`/quizzes/mine/`
|
Yes
|
List quizzes owned by the authenticated user
|
|
`POST`
|
`/quizzes/create/`
|
Yes
|
Create a new quiz (draft state)
|
|
`GET`
|
`/quizzes/<id>/`
|
No
|
Retrieve basic quiz metadata
|
|
`GET`
|
`/quizzes/<id>/update/`
|
Yes (Owner)
|
Retrieve full quiz with questions and choices (for editing)
|
|
`PUT`
|
`/quizzes/<id>/update/`
|
Yes (Owner)
|
Full replace of quiz title, description, and all questions
|
|
`DELETE`
|
`/quizzes/<id>/delete/`
|
Yes (Owner)
|
Permanently delete a quiz and all related data
|
|
`POST`
|
`/quizzes/<id>/publish/`
|
Yes
|
Attach questions+choices and publish the quiz
|
|
`GET`
|
`/quizzes/<id>/takequiz/`
|
No
|
Retrieve quiz for public consumption (choices stripped of
`is_correct`
)
|
**`POST /quizzes/create/`**

```json
// Request body
{ "title": "Modern Architecture", "description": "Test your knowledge of..." }
// 201 Created
{
  "id": 42,
  "title": "Modern Architecture",
  "description": "Test your knowledge of...",
  "creator_name": "John Doe",
  "creator_email": "john@example.com",
  "created_at": "2026-07-10T18:00:00Z",
  "is_published": false
}
```

**`POST /quizzes/<id>/publish/`**
Atomically attaches questions and marks the quiz as published. Enforces:

- Exactly **7 questions**
- Each question has exactly **4 choices**
- Each question has exactly **1 correct choice**

```json
// Request body
{
  "questions": [
    {
      "text": "What is the Colosseum?",
      "marks": 10,
      "choices": [
        { "text": "A Roman amphitheatre", "is_correct": true },
        { "text": "A Greek temple", "is_correct": false },
        { "text": "A medieval castle", "is_correct": false },
        { "text": "An Egyptian tomb", "is_correct": false }
      ]
    }
    // ... 6 more questions
  ]
}
// 200 OK
{ "message": "Quiz published successfully" }
```

**`GET /quizzes/<id>/takequiz/`**
Returns the quiz using `PublicQuizDetailSerializer`. The `is_correct` field is intentionally **omitted** from each choice to prevent answer leakage to the client.

```json
{
  "id": 42,
  "title": "Modern Architecture",
  "description": "...",
  "creator_name": "John Doe",
  "questions": [
    {
      "id": 1,
      "text": "What is the Colosseum?",
      "marks": 10,
      "order": 1,
      "choices": [
        { "id": 101, "text": "A Roman amphitheatre" },
        { "id": 102, "text": "A Greek temple" },
        { "id": 103, "text": "A medieval castle" },
        { "id": 104, "text": "An Egyptian tomb" }
      ]
    }
  ]
}
```

---

#### Attempt Endpoints — `/api/attempts/`

|
Method
|
Path
|
Auth Required
|
Description
|
|

---

## |

## |

## |

|
|
`POST`
|
`/attempts/start/`
|
No
|
Begin a timed attempt (10-min window)
|
|
`POST`
|
`/attempts/<id>/submit/`
|
No
|
Submit answers and receive a scored result
|
**`POST /attempts/start/`**

```json
// Request body
{
  "quiz": 42,
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com"
}
// 201 Created
{
  "id": 7,
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com",
  "quiz": 42,
  "started_at": "2026-07-10T18:05:00Z",
  "expires_at": "2026-07-10T18:15:00Z"
}
```

The `expires_at` timestamp is stored in the browser's `sessionStorage` under the key `attemptExpiresAt:<attempt_id>` so the countdown timer can calculate remaining time without additional API calls.
**`POST /attempts/<id>/submit/`**
Accepts a dictionary mapping `question_id → choice_id` for all answered questions. Unanswered questions receive zero marks.

```json
// Request body
{
  "answers": {
    "1": 101,
    "2": 205,
    "3": 312
    // question_id: chosen_choice_id
  }
}
// 200 OK
{
  "message": "Quiz submitted successfully.",
  "result": {
    "id": 7,
    "participant_name": "Jane Smith",
    "participant_email": "jane@example.com",
    "score": 30,
    "total_questions": 7,
    "answered_questions": 3,
    "correct_answers": 3,
    "started_at": "2026-07-10T18:05:00Z",
    "submitted_at": "2026-07-10T18:10:00Z",
    "completed": true
  },
  "answers_submitted": 3,
  "unanswered_questions": 4
}
```

## Submission is **idempotent-protected** — a `completed` attempt returns `HTTP 400` on any subsequent submit call.

### 6.3 Permission Matrix

|
Endpoint
|
Anon
|
Authenticated
|
Owner
|
Admin
|
|

---

## |

## |

## |

## |

|
|
Register / Login / Logout / Refresh
|
Yes
|
Yes
|
Yes
|
Yes
|
|
`GET /auth/me/`
|
No
|
Yes
|
Yes
|
Yes
|
|
`GET /quizzes/`
(published only)
|
Yes
|
Yes
|
Yes
|
—
|
|
`GET /quizzes/`
(all quizzes)
|
No
|
No
|
No
|
Yes
|
|
`GET /quizzes/mine/`
|
No
|
Yes
|
Yes
|
Yes
|
|
`POST /quizzes/create/`
|
No
|
Yes
|
Yes
|
Yes
|
|
`GET /quizzes/<id>/takequiz/`
|
Yes
|
Yes
|
Yes
|
Yes
|
|
`GET /PUT /quizzes/<id>/update/`
|
No
|
No
|
Yes
|
Yes
|
|
`DELETE /quizzes/<id>/delete/`
|
No
|
No
|
Yes
|
Yes
|
|
`POST /quizzes/<id>/publish/`
|
No
|
Yes
|
Yes
|
Yes
|
|
`POST /attempts/start/`
|
Yes
|
Yes
|
Yes
|
Yes
|
|
`POST /attempts/<id>/submit/`
|
Yes
|
Yes
|
Yes
|
Yes
|

---

### 6.4 Business Rules & Validations

|
Rule
|
Enforced In
|
|

---

## |

|
|
A quiz must contain
**
exactly 7 questions
**
before it can be published
|
`PublishQuizView`
,
`QuizDetailSerializer`
|
|
Each question must have
**
exactly 4 choices
**
|
`PublishQuizView`
,
`QuestionSerializer`
|
|
Each question must have
**
exactly 1 correct answer
**
|
`PublishQuizView`
,
`QuestionSerializer`
|
|
Question
`order`
values are unique per quiz
|
DB
`UniqueConstraint`
on
`(quiz, order)`
|
|
An attempt expires
**
10 minutes
**
after creation
|
`QuizAttempt.save()`
— sets
`expires_at = now + 10min`
|
|
A completed attempt cannot be resubmitted
|
`SubmitQuizView`
— returns
`HTTP 400`
if
`attempt.completed`
|
|
Only published quizzes can be attempted
|
`StartAttemptSerializer.validate()`
|
|
Submitted choice IDs must belong to the quiz's questions
|
`SubmitQuizView`
— cross-validates all IDs before scoring
|
|
Quiz publish operation is
**
atomic
**
|
`@transaction.atomic`
on
`PublishQuizView.post()`
|
|
Quiz update (PUT) replaces all questions
|
Entire
`questions`
set is deleted and recreated
|

---

## 7. Frontend — React SPA

The frontend is a **React 18** single-page application built with **Vite** and styled with **TailwindCSS**. It deliberately avoids a third-party router (React Router, TanStack Router) in favour of a lightweight custom `useRoute` hook backed by the History API.

### 7.1 Routing

`App.jsx` contains two layout modes:
|
Mode
|
Trigger
|
Layout
|
|

---

## |

## |

|
|
**
Public
**
|
Routes in
`publicRoutes`
array (
`/`
,
`/login`
,
`/register`
,
`/explore`
,
`/quiz-setup`
,
`/take-quiz`
,
`/results`
)
|
`Navbar`

- full-width content
  |
  |
  **
  Authenticated
  **
  |
  All other routes (
  `/dashboard`
  ,
  `/create`
  ,
  `/builder`
  , etc.)
  |
  `Sidebar`
- main content area
  |
  The `renderRoute()` function maps URL paths to React page components. Query-string parameters (e.g. `?id=42&attempt=7`) are parsed inside individual page components using `new URLSearchParams(window.location.search)`.

### 7.2 Page Catalogue

#### Public Pages

|
Route
|
Component
|
Description
|
|

---

## |

## |

|
|
`/`
|
`LandingPage`
|
Marketing hero, workflow overview, and quick-action CTAs
|
|
`/login`
|
`LoginPage`
|
Username + password form; on success sets user state and navigates to
`/dashboard`
|
|
`/register`
|
`RegisterPage`
|
Full registration form (first name, last name, username, email, password)
|
|
`/explore`
|
`ExplorePage`
|
Grid of published quizzes with real-time search and pagination (6 per page)
|
|
`/quiz-setup?id=<id>`
|
`QuizSetupPage`
|
Pre-attempt form (name + email); creates the
`QuizAttempt`
record on submit
|
|
`/take-quiz?id=<id>&attempt=<id>`
|
`TakingQuizPage`
|
Timed quiz interface with countdown timer and progress bar; auto-submits on expiry
|
|
`/results`
|
`ResultsPage`
|
Displays the latest attempt result from
`sessionStorage`
|

#### Authenticated Pages (sidebar layout)

|
Route
|
Component
|
Description
|
|

---

## |

## |

|
|
`/dashboard`
|
`DashboardPage`
|
Summary metrics (total, published, drafts), quiz table with edit/delete actions, inline edit modal
|
|
`/create`
|
`CreateQuizPage`
|
Step 1 of quiz creation — enter title + description, then proceed to builder
|
|
`/builder?id=<id>`
|
`QuizBuilderPage`
|
Step 2 — add 7 questions with 4 choices each, then publish
|

---

#### `ExplorePage` — Detailed Behaviour

- Fetches all published quizzes from `GET /api/quizzes/`.
- Provides a real-time search bar that filters on the concatenated `title + description` string, case-insensitively.
- Paginator shows 6 quizzes per page; the paginator only appears when results exceed 6.
- Each card shows the quiz title, description (line-clamped to 3 lines), creator name/email, and a **Start** button.
- Clicking **Start** navigates to `/quiz-setup?id=<quiz_id>`.

---

#### `TakingQuizPage` — Timer Mechanics

The countdown timer is driven by a `setInterval` that fires every second. Remaining time is calculated as:

```
remaining = (expires_at from sessionStorage − EXPIRY_BUFFER_MS) − Date.now()
```

An `EXPIRY_BUFFER_MS` of 10,000 ms (10 seconds) ensures the auto-submit fires slightly before the server-side expiry to account for network latency. When `remaining ≤ 0`, the ref `autoSubmittedRef` guards against duplicate submissions before calling `submit(true)`.
The progress bar at the top of the page fills from 0% to 100% as the user answers questions (answered count / total questions).

---

#### `DashboardPage` — Quiz Management

- Authenticated users see their own quizzes via `GET /api/quizzes/mine/`.
- Admin users see all quizzes via `GET /api/quizzes/`.
- The **Edit** button fetches the full quiz including questions and choices via `GET /api/quizzes/<id>/update/`, then opens an inline modal where all fields (title, description, question text, marks, choice text, and correct answer selection) can be modified.
- On save, a `PUT /api/quizzes/<id>/update/` replaces the entire quiz structure atomically.
- The **Delete** button presents a `window.confirm()` guard before calling `DELETE /api/quizzes/<id>/delete/`.

---

### 7.3 Component Library

All UI primitives are located in `src/components/ui/` and accept Tailwind `className` overrides via prop composition.
|
Component
|
Props
|
Notes
|
|

---

## |

## |

|
|
`Button`
|
`variant`
,
`size`
,
`icon`
,
`disabled`
,
`onClick`
|
Variants:
`primary`
(default),
`secondary`
,
`ghost`
,
`soft`
|
|
`Card`

- `CardHeader`
  |
  `className`
  ,
  `title`
  ,
  `description`
  ,
  `action`
  |
  `CardHeader`
  slots an optional right-aligned
  `action`
  element
  |
  |
  `Badge`
  |
  `variant`
  |
  Variants:
  `default`
  ,
  `success`
  ,
  `warning`
  ,
  `error`
  |
  |
  `Input`
  |
  All native input props +
  `className`
  |
  Forwarded to a styled
  `<input>`
  element
  |
  |
  `FormField`
  |
  `label`
  ,
  `children`
  |
  Wraps an input in a
  `<label>`
  with consistent spacing
  |
  |
  `Modal`
  |
  `open`
  ,
  `title`
  ,
  `onClose`
  ,
  `footer`
  ,
  `children`
  |
  Backdrop click and
  `footer`
  slot for action buttons
  |
  |
  `Table`
  |
  `columns`
  ,
  `rows`
  |
  Columns accept a
  `render(row)`
  function for custom cell content
  |
  |
  `Pagination`
  |
  `page`
  ,
  `totalPages`
  ,
  `onPageChange`
  |
  Previous/next + page number buttons
  |
  |
  `EmptyState`
  |
  `title`
  ,
  `description`
  ,
  `actionLabel`
  ,
  `onAction`
  |
  Centred empty-state with optional CTA
  |
  |
  `LoadingSpinner`
  |
  `label`
  |
  Accessible spinner with visually hidden label
  |

### 7.4 API Service Layer

`src/services/api.js` is the single point of contact between the React application and the REST API. All calls use the native `fetch` API with `credentials: "include"` to transmit HttpOnly cookies.
The `request()` wrapper:

1. Appends the configured `VITE_API_URL` base (default `http://localhost:8000/api`).
2. Sets `Content-Type: application/json`.
3. On `HTTP 401`, transparently attempts token refresh via `doRefresh()` (with deduplication).
4. Retries the original request once with `_isRetry=true` flag to prevent infinite loops.
5. Parses the response body as JSON and throws a descriptive `Error` for non-2xx responses.
   Exported API methods:

```js
api.register(payload);
api.login(payload);
api.logout();
api.me();
api.listQuizzes();
api.listMyQuizzes();
api.createQuiz(payload);
api.updateQuiz(id, payload);
api.deleteQuiz(id);
api.publishQuiz(id, payload);
api.getQuiz(id);
api.getQuizForEdit(id);
api.getQuizForTaking(id);
api.startAttempt(payload);
api.submitAttempt(attemptId, answers);
```

### 7.5 Custom Hooks

**`useRoute()`** — Lightweight client-side router

- Reads `window.location.pathname` as initial state.
- Listens to `popstate` events (browser back/forward).
- Returns `{ path, navigate }` — `navigate(nextPath)` calls `history.pushState` and scrolls to top.
  **`useAsync(load, dependencies)`** — Data fetching helper
- Calls `load()` on mount and when `dependencies` change.
- Tracks `{ data, loading, error, setData }` state.
- Handles race conditions via a `mounted` flag — stale results from unmounted components are silently discarded.

---

## 8. User Flows

### Flow A — Quiz Creator Journey

```
1. Visit /register → fill form → POST /auth/register/
2. Visit /login → enter credentials → POST /auth/login/ → cookies set
3. Navigate to /create → enter title + description → POST /quizzes/create/
   → Redirected to /builder?id=<new_quiz_id>
4. In builder:
   - Click "Add Question" → fill modal (text, marks, 4 choices, correct answer)
   - Repeat until 7 questions are added (progress bar fills to 100%)
   - Click "Publish" → POST /quizzes/<id>/publish/ with all questions
   → Redirected to /dashboard
5. On Dashboard:
   - View quiz metrics (total, published, drafts)
   - Edit any quiz → inline modal pre-filled with current data → PUT /quizzes/<id>/update/
   - Delete a quiz → confirmation dialog → DELETE /quizzes/<id>/delete/
```

### Flow B — Quiz Taker Journey

```
1. Visit /explore → browse published quizzes (no account needed)
   - Search by title or description in real-time
   - Paginate through results (6 per page)
2. Click "Start" on any quiz card → navigate to /quiz-setup?id=<id>
3. On setup page:
   - Enter participant name and email
   - Acknowledge 10-minute limit
   - Click "Start Quiz" → POST /attempts/start/
   - Attempt ID + expiry stored in sessionStorage
   → Redirected to /take-quiz?id=<id>&attempt=<attempt_id>
4. On quiz page:
   - See all 7 questions with 4 choices each
   - Countdown timer in top-right badge (turns red in final 60 seconds)
   - Select answers (progress bar shows answered / total)
   - Click "Submit Quiz" → POST /attempts/<id>/submit/
   OR
   - Timer hits zero → auto-submit fires (with 10-second buffer)
   → Redirected to /results
5. On results page:
   - View score, total questions, answered count, correct count
   - Data sourced from sessionStorage["latestResult"]
```

### Flow C — Admin Oversight

```
1. Admin user logs in (is_admin=True in DB)
2. Dashboard shows ALL platform quizzes (not just their own)
3. Admin panel link appears in sidebar (only for is_admin users)
4. Admin can edit or delete any quiz
```

---

## 9. Infrastructure & Deployment

### 9.1 Docker Compose

The `docker-compose.yml` defines three services:
|
Service
|
Container Name
|
Internal Port
|
Exposed Port
|
|

---

## |

## |

## |

|
|
`frontend`
|
`quiz_frontend`
|
80 (Nginx)
|
5173
|
|
`backend`
|
`quiz_backend`
|
8000
|
8000
|
|
`db`
|
`quiz_postgres`
|
5432
|
5432
|
**Data persistence:** A named volume `postgres_data` ensures database data survives container restarts.
**Build-time argument:** The frontend Dockerfile accepts `VITE_API_URL` as a build argument. This bakes the API base URL into the Vite bundle at build time, since `import.meta.env` variables are resolved at compile time, not at runtime.

### 9.2 Environment Variables

#### Backend (`backend/.env`)

|
Variable
|
Description
|
Default (dev)
|
|

---

## |

## |

|
|
`SECRET_KEY`
|
Django secret key —
**
change in production
**
|
`django-insecure-...`
|
|
`DEBUG`
|
Enable debug mode
|
`TRUE`
|
|
`ALLOWED_HOSTS`
|
Comma-separated allowed hosts
|
`localhost,127.0.0.1`
|
|
`DB_NAME`
|
PostgreSQL database name
|
`quiz_db`
|
|
`DB_USER`
|
PostgreSQL username
|
`quiz_user`
|
|
`DB_PASSWORD`
|
PostgreSQL password
|
`quiz_password`
|
|
`DB_HOST`
|
PostgreSQL host
|
`db`
(Docker service name)
|
|
`DB_PORT`
|
PostgreSQL port
|
`5432`
|
|
`ACCESS_TOKEN_LIFETIME`
|
Access token TTL in minutes
|
`15`
|
|
`REFRESH_TOKEN_LIFETIME`
|
Refresh token TTL in days
|
`7`
|
|
`COOKIE_SECURE`
|
Set
`Secure`
flag on cookies
|
`False`
(dev)
|
|
`COOKIE_SAMESITE`
|
Cookie
`SameSite`
policy
|
`Lax`
|
|
`CORS_ALLOWED_ORIGINS`
|
Comma-separated allowed frontend origins
|
`http://localhost:5173`
|

#### Frontend (`frontend/.env`)

|
Variable
|
Description
|
Default
|
|

---

## |

## |

|
|
`VITE_API_URL`
|
Base URL for all API requests
|
`http://localhost:8000/api`
|

### 9.3 Local Development Setup

#### Prerequisites

- Docker + Docker Compose **or** Python 3.12+ and Node.js 22+

#### Option A — Docker Compose (recommended)

```bash
# Clone the repository
git clone <repo-url> quiz-challenge
cd quiz-challenge
# Copy and configure environment (review all values before proceeding)
cp backend/.env.example backend/.env   # if an example file exists
# Build and start all services
docker compose up --build
# In a separate terminal, run database migrations
docker compose exec backend python manage.py migrate
# Create an admin superuser (optional)
docker compose exec backend python manage.py createsuperuser
```

Access the application:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **Django Admin:** http://localhost:8000/admin

#### Option B — Local Development (without Docker)

**Backend:**

```bash
cd backend
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Configure environment — ensure DB_HOST=localhost and a running PostgreSQL instance
cp .env.example .env
# Run migrations
python manage.py migrate
# Start development server
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
# Install dependencies
npm install
# Start Vite dev server
npm run dev
```

## The Vite server starts on `http://localhost:5173` with HMR enabled.

## 10. Security Considerations

### Implemented

|
Control
|
Implementation
|
|

---

## |

|
|
HttpOnly JWT cookies
|
Tokens are never accessible to JavaScript; XSS cannot steal credentials
|
|
`CORS_ALLOW_CREDENTIALS = True`

- explicit origin allowlist
  |
  Only whitelisted origins can send credentialed cross-origin requests
  |
  |
  Token rotation on refresh
  |
  Old refresh tokens are
  **
  blacklisted
  **
  after rotation via
  `simplejwt.token_blacklist`
  |
  |
  Short access token lifetime
  |
  15-minute TTL limits the blast radius of a stolen token
  |
  |
  `IsQuizOwner`
  permission class
  |
  Object-level ownership check prevents horizontal privilege escalation between quiz creators
  |
  |
  Server-side attempt expiry
  |
  `expires_at`
  is set on the server, not the client; the browser timer is purely cosmetic
  |
  |
  Atomic quiz publishing
  |
  `@transaction.atomic`
  ensures a partially-uploaded question set cannot leave the database in an inconsistent state
  |
  |
  Answer ID cross-validation
  |
  Submitted choice IDs are verified to belong to the specific quiz before scoring
  |

### Production Hardening Checklist

Before deploying to a production environment, the following changes **must** be applied:

1. Replace `SECRET_KEY` with a strong random value (e.g. `python -c "import secrets; print(secrets.token_hex(50))"`).
2. Set `DEBUG=False`.
3. Set `COOKIE_SECURE=True` — requires HTTPS termination at the load balancer or reverse proxy.
4. Restrict `ALLOWED_HOSTS` to the actual production domain.
5. Update `CORS_ALLOWED_ORIGINS` to the production frontend URL only.
6. Point `DB_HOST`, `DB_USER`, and `DB_PASSWORD` to managed database credentials — do not reuse the development defaults.
7. Replace the development `CMD` in `backend/Dockerfile` with a Gunicorn invocation: `gunicorn quiz.wsgi:application --bind 0.0.0.0:8000 --workers 4`.
8. Run `python manage.py collectstatic` and serve static files via WhiteNoise or a CDN.
9. Implement access token blacklisting on logout to close the 15-minute post-logout window.

---

## 11. Known Limitations & Technical Debt

The following items have been identified during code review and are flagged for resolution before production release:
|

#

|
Area
|
Issue
|
Recommendation
|
|

---

## |

## |

## |

|
|
1
|
**
Auth — Logout
**
|
`LogoutView`
only deletes cookies; does not blacklist the active access token
|
Add access token blacklisting via a custom token blacklist or reduce TTL further
|
|
2
|
**
Auth — Publish endpoint
**
|
`PublishQuizView`
checks
`quiz.creator == request.user`
inside the view rather than through the
`IsQuizOwner`
permission class
|
Refactor to use the existing
`IsQuizOwner`
DRF permission for consistency
|
|
3
|
**
Quiz edit — Re-publishing
**
|
Updating a quiz via
`PUT /quizzes/<id>/update/`
does not re-run the 7-question / 4-choice / 1-correct validations
|
Enforce business rule validations in
`QuizDetailSerializer.update()`
|
|
4
|
**
Attempt expiry
**
|
The server sets
`expires_at`
but the
`SubmitQuizView`
does
**
not
**
reject submissions that arrive after
`expires_at`
has passed
|
Add a server-side check:
`if attempt.is_expired(): return HTTP 400`
|
|
5
|
**
Duplicate serializer definition
**
|
`QuizDetailSerializer`
is defined
**
twice
**
in
`quizzes/serializers.py`
(lines 60 and 101). The second definition shadows the first
|
Remove the duplicate; consolidate into a single serializer
|
|
6
|
**
Debug print statements
**
|
`PublishQuizView.post()`
contains
`print()`
calls for
`content_type`
,
`body`
, and
`data`
|
Remove all print statements; use Python
`logging`
module
|
|
7
|
**
Admin route
**
|
The sidebar renders an "Admin" link (
`/admin`
) for
`is_admin`
users, but no corresponding frontend page is implemented
|
Implement an admin management page or remove the nav item
|
|
8
|
**
No test coverage
**
|
`tests.py`
files in all apps contain only the Django placeholder comment
|
Write unit and integration tests for serializers, views, and business logic
|
|
9
|
**
Score validation
**
|
There is no upper-bound check on
`marks`
per question; a creator could set arbitrarily large mark values
|
Optionally enforce a
`max_value`
on the
`marks`
field
|
|
10
|
**
Results storage
**
|
Attempt results are stored in
`sessionStorage`
under
`latestResult`
, which is overwritten on each quiz submission
|
Implement a proper results history or a dedicated results page fetching from the API
|

---
