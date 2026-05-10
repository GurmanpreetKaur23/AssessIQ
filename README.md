# AssessIQ backend

Run the application:

python -m uvicorn app.main:app --reload

To train a model:

python backend/scripts/train_model.py path/to/csv1 path/to/csv2

To generate fake data:

python backend/scripts/generate_fake_data.py
