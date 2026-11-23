# MessMate BD — Module 1 Frontend

This is the existing MessMate UI for Module 1, kept with the same visual design and connected to a small Express API.

## Run the frontend

```bash
npm install
npm run dev
```

The frontend uses `http://localhost:3000/api` by default. To change it, create a `.env` file in this folder:

```env
VITE_API_URL=http://localhost:3001/api
```

## Module 1

- Mess creation and member joining with a unique mess code
- Member and role management
- Daily meal tracking
- Meal OFF/ON requests with Manager approval and cancellation deadline
