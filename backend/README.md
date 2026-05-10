# AssessIQ backend

Run the application:

python -m uvicorn app.main:app --reload

To train a model with files uploaded via API or S3 paths:

Use POST /analytics/train with form files or JSON body {"s3_paths": ["s3://bucket/key.csv"]}

To generate fake data:

python backend/scripts/generate_fake_data.py
