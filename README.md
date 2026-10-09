# MessMate BD - Module 1

Module 1 is implemented as a small MERN application:

- Mess creation and unique mess-code based joining
- Manager and Member roles
- Daily breakfast, lunch and dinner tracking
- Member meal OFF/ON requests with manager approval
- Manager-controlled same-day cancellation deadline

## Structure

The backend follows the simple project structure used in the course demo:

`Route -> Controller -> Model -> MongoDB`

The `models/` folder contains both the Mongoose schemas and small database-operation files, so the code stays easy to explain in class.

## Run backend

1. Open `server/.env` and add your MongoDB Atlas URI and JWT secret.
2. Run `npm install` inside `server`.
3. Run `npm run dev`.

## Run frontend

1. Run `npm install` inside `client`.
2. Run `npm run dev`.

No demo/sample data is created by the application.
