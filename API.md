# MindPulse API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "username": "user123",
      "email": "user@example.com",
      "password": "password123"
  }
  ```
- **Response**: User object + Token.

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "email": "user@example.com",
      "password": "password123"
  }
  ```
- **Response**: User object + Token.

## Journal

### Get Entries

- **URL**: `/journal`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of journal entries.

### Create Entry

- **URL**: `/journal`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
      "content": "I felt great today!",
      "mood_score": 5
  }
  ```
- **Response**: Created entry object (with sentiment analysis).

### Delete Entry

- **URL**: `/journal/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Message object.

## Admin (Analytics)

### Get Stats

- **URL**: `/admin/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "moodDistribution": [...],
    "sentimentDistribution": [...],
    "averageMood": 3.5
  }
  ```
