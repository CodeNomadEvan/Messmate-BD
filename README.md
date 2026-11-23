# MessMate BD - Module 2

Module 1 remains unchanged in its existing pages and flow. Module 2 adds the next proposal scope on top of the same MERN structure.

## Module 2 features

- Guest meal tracking
- Bazar and grocery expense management
- Shared utility expense management
- Automatic monthly meal-rate calculation
- Read-only Module 2 visibility for Members
- Manager-only create, edit, and delete operations for expenses and guest meals

The meal rate is calculated as:

`Bazar / (member meals + guest meals)`

Utility expenses are tracked separately and are not included in the food-cost numerator.

## Backend structure

The backend keeps the same simple course-friendly structure:

`Route -> Controller -> Model -> MongoDB`

New Module 2 endpoints:

- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `GET /api/guest-meals`
- `POST /api/guest-meals`
- `PUT /api/guest-meals/:id`
- `DELETE /api/guest-meals/:id`
- `GET /api/meal-rate/summary`

Existing Module 1 meal endpoints are also included in the server because the Module 2 calculation reads the existing meal records.

## Run backend

1. Open `server/.env` and add your MongoDB Atlas URI and JWT secret.
2. Run `npm install` inside `server`.
3. Run `npm run dev`.

## Run frontend

1. Run `npm install` inside `client`.
2. Run `npm run dev`.

No demo/sample data is created by the application.
