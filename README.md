# DoConnect — Q&A Forum Platform
### Capstone Project | Sprint 1 Submission

---

## 📁 Project Structure

```
DoConnect/
├── API/                          # .NET 8 Web API (Backend)
│   ├── Controllers/
│   │   ├── AuthController.cs     # Register, Login, JWT
│   │   ├── QuestionsController.cs # CRUD + voting + resolve
│   │   ├── AnswersController.cs  # CRUD + voting
│   │   ├── UsersController.cs   # Admin user management
│   │   ├── NotificationsController.cs
│   │   └── ReviewsController.cs # Advanced: user reviews
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Question.cs
│   │   ├── Answer.cs
│   │   └── Notification.cs       # + Review model
│   ├── DTOs/Dtos.cs
│   ├── Data/DoConnectDbContext.cs
│   ├── Hubs/NotificationHub.cs   # SignalR real-time
│   ├── Program.cs
│   ├── appsettings.json
│   └── DoConnect.API.csproj
│
└── Angular/                      # Angular 17 Frontend
    └── src/app/
        ├── components/
        │   ├── auth/             # Login, Register
        │   ├── questions/        # List, Detail, Ask
        │   ├── admin/            # Dashboard, User Management
        │   ├── profile/          # User profile + Reviews
        │   └── shared/           # Notifications
        ├── services/             # All API service calls
        ├── guards/               # Auth + Admin guards
        ├── interceptors/         # JWT interceptor
        ├── models/               # TypeScript interfaces
        └── app-routing.module.ts
```

---

## 🚀 Setup & Run

### Backend (.NET API)

1. **Prerequisites**: .NET 8 SDK, SQL Server (or LocalDB)

2. **Restore packages:**
   ```bash
   cd API
   dotnet restore
   ```

3. **Update DB connection** in `appsettings.json` if needed

4. **Run migrations:**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. **Run API:**
   ```bash
   dotnet run
   ```
   API runs at: `https://localhost:7001`
   Swagger UI: `https://localhost:7001/swagger`

### Frontend (Angular)

1. **Prerequisites**: Node.js 18+, Angular CLI 17

2. **Install dependencies:**
   ```bash
   cd Angular
   npm install
   ```

3. **Run dev server:**
   ```bash
   ng serve
   ```
   App runs at: `http://localhost:4200`

---

## 🔐 Default Admin Credentials

| Email | Password |
|-------|----------|
| admin@doconnect.com | Admin@123 |

---

## ✅ Sprint 1 Criteria Coverage

| Criteria | Status | Points |
|----------|--------|--------|
| Database schema, tables & relationships | ✅ | 3 |
| Admin Login (CRUD Operations) | ✅ | 3 |
| User Registration & Login | ✅ | 3 |
| Angular Front-End Template | ✅ | — |
| Code Sanitization (Components, Structure) | ✅ | 8 |
| Functionalities (CRUD Admin/User) | ✅ | 8 |
| Other Functionalities (Advanced: Reviews, Notifications) | ✅ | 8 |
| Responsiveness & Client-Side Validation | ✅ | — |
| Session Handling (JWT localStorage) | ✅ | 5 |
| Angular + Backend Integration & JWT | ✅ | 5 |
| Testing (Component & End-to-End) | Jasmine/Karma setup | 7 |
| GitHub Repository | Push this project | 3 |

---

## 🏗 Tech Stack

**Backend:** .NET 8, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT, SignalR, BCrypt, Swagger

**Frontend:** Angular 17, TypeScript, Reactive Forms, Angular Router, HttpClient, RxJS, SignalR client

---

## 📌 Key Features

- **Full CRUD** for Questions, Answers, Users
- **JWT Authentication** with role-based access (Admin/User)
- **Real-time Notifications** via SignalR
- **Voting system** for questions and answers
- **Accept Answer** to mark questions resolved
- **Advanced Feature: User Reviews** with star ratings
- **Admin Dashboard** with platform statistics
- **Search, filter, pagination** on questions
- **Responsive UI** with client-side validation
