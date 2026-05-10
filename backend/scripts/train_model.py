from sklearn.linear_model import LinearRegression
import pandas as pd
import joblib
import os
from pathlib import Path
def prepare_and_train(csv_paths):
    frames=[]
    for p in csv_paths:
        if os.path.exists(p):
            frames.append(pd.read_csv(p))
    if not frames:
        return
    df=pd.concat(frames,ignore_index=True)
    if "score" not in df.columns:
        return
    features=[c for c in ["past_score","time_taken","accuracy"] if c in df.columns]
    X=df[features]
    y=df["score"]
    model=LinearRegression()
    model.fit(X,y)
    Path("backend/models").mkdir(parents=True,exist_ok=True)
    joblib.dump(model,"backend/models/score_model.joblib")
if __name__=="__main__":
    import sys
    prepare_and_train(sys.argv[1:])
