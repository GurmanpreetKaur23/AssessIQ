from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)
def test_root():
    res=client.get("/analytics/fake-dashboard")
    assert res.status_code==200
    j=res.json()
    assert "students" in j
