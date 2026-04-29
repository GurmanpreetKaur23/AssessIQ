# AssessIQ

AssessIQ is a React + FastAPI intelligent online olympiad assessment system with adaptive testing, behavioral learning analytics, performance prediction, recommendations, and admin tools.

## Run Backend

```powershell
cd assessiq\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If `py` is unavailable, install Python 3.11+ first.

## Run Frontend

Use Node 20.19+ or Node 22.12+.

```powershell
cd assessiq\frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Demo Login

Run the backend once. It seeds:

- Student: `student@assessiq.dev` / `student123`
- Teacher: `teacher@assessiq.dev` / `teacher123`

## Main Features

- JWT authentication
- Student dashboard
- Timer-based adaptive test interface
- Auto-save answer events
- Resume active attempt
- Behavioral tracking: time, revisits, answer changes, tab switches, inactivity
- Topic analytics and behavioral insights
- ML-style prediction and recommendations
- Student clustering
- Anomaly detection
- Admin analytics
- Question management
- Test creation

