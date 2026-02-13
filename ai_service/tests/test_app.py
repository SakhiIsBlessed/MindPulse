import pytest
import sys
import os

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_analyze_sentiment_positive(client):
    response = client.post('/analyze', json={'text': 'I am feeling great today!'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['label'] == 'positive'
    assert data['polarity'] > 0

def test_analyze_sentiment_negative(client):
    response = client.post('/analyze', json={'text': 'I am feeling terrible and sad.'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['label'] == 'negative'
    assert data['polarity'] < 0

def test_analyze_no_text(client):
    response = client.post('/analyze', json={})
    assert response.status_code == 400
