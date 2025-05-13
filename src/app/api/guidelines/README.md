# Guidelines API Documentation

This document provides details about the Guidelines API endpoints, their usage, and expected request/response formats.

## Core Endpoints

### GET /api/guidelines

Retrieves a list of guidelines based on filters.

**Query Parameters:**
- `visibility` - Filter by 'public' or 'private'
- `category` - Filter by category name
- `q` - Search query for name or description

**Response:**
```json
{
  "guidelines": [
    {
      "id": "uuid",
      "name": "Annual Physical Exam",
      "description": "...",
      "frequency": "Annual",
      "frequency_months": 12,
      "category": "General Health",
      "genders": ["all"],
      "visibility": "public",
      "created_by": "user_id",
      "tags": ["preventive", "general"],
      "guideline_age_ranges": [
        {
          "id": "uuid",
          "guideline_id": "uuid",
          "min_age": 18,
          "max_age": null,
          "label": "18+",
          "frequency": "Annual",
          "frequency_months": 12
        }
      ]
    }
  ]
}
```

### POST /api/guidelines

Creates a new guideline.

**Request Body:**
```json
{
  "guideline": {
    "name": "Annual Physical Exam",
    "description": "Comprehensive yearly health check",
    "frequency": "Annual",
    "frequency_months": 12,
    "category": "General Health",
    "genders": ["all"],
    "visibility": "public",
    "tags": ["preventive", "general"]
  },
  "ageRanges": [
    {
      "min_age": 18,
      "max_age": null,
      "label": "18+",
      "frequency": "Annual",
      "frequency_months": 12
    }
  ]
}
```

**Response:**
```json
{
  "guideline": {
    "id": "uuid",
    "name": "Annual Physical Exam",
    "description": "Comprehensive yearly health check",
    "frequency": "Annual",
    "frequency_months": 12,
    "category": "General Health",
    "genders": ["all"],
    "visibility": "public",
    "created_by": "user_id",
    "tags": ["preventive", "general"],
    "created_at": "2023-06-15T00:00:00.000Z",
    "updated_at": "2023-06-15T00:00:00.000Z"
  },
  "message": "Guideline created successfully"
}
```

### GET /api/guidelines/[id]

Retrieves a specific guideline by ID.

**Response:**
```json
{
  "guideline": {
    "id": "uuid",
    "name": "Annual Physical Exam",
    "description": "...",
    "frequency": "Annual",
    "frequency_months": 12,
    "category": "General Health",
    "genders": ["all"],
    "visibility": "public",
    "created_by": "user_id",
    "tags": ["preventive", "general"],
    "ageRanges": [
      {
        "id": "uuid",
        "guideline_id": "uuid",
        "min_age": 18,
        "max_age": null,
        "label": "18+",
        "frequency": "Annual",
        "frequency_months": 12
      }
    ],
    "resources": [
      {
        "id": "uuid",
        "guideline_id": "uuid",
        "name": "Health Screening Guide",
        "url": "https://example.com/guide",
        "description": "Detailed information about health screenings",
        "type": "resource"
      }
    ]
  }
}
```

### PATCH /api/guidelines/[id]

Updates an existing guideline.

**Request Body:**
```json
{
  "guideline": {
    "name": "Updated Physical Exam",
    "description": "Updated description",
    "frequency": "Annual",
    "frequency_months": 12,
    "category": "General Health",
    "genders": ["all"],
    "visibility": "public",
    "tags": ["preventive", "general", "updated"]
  },
  "ageRanges": [
    {
      "min_age": 18,
      "max_age": 40,
      "label": "18-40",
      "frequency": "Every 2 years",
      "frequency_months": 24
    },
    {
      "min_age": 41,
      "max_age": null,
      "label": "41+",
      "frequency": "Annual",
      "frequency_months": 12
    }
  ],
  "resources": [
    {
      "name": "Updated Resource",
      "url": "https://example.com/updated",
      "description": "New resource description",
      "type": "resource"
    }
  ]
}
```

**Response:**
```json
{
  "guideline": {
    "id": "uuid",
    "name": "Updated Physical Exam",
    "description": "Updated description",
    "frequency": "Annual",
    "frequency_months": 12,
    "category": "General Health",
    "genders": ["all"],
    "visibility": "public",
    "created_by": "user_id",
    "tags": ["preventive", "general", "updated"],
    "updated_at": "2023-06-16T00:00:00.000Z"
  },
  "message": "Guideline updated successfully"
}
```

### DELETE /api/guidelines/[id]

Deletes a guideline.

**Response:**
```json
{
  "message": "Guideline deleted successfully"
}
```

## Special Operations

### POST /api/guidelines/[id]/complete

Marks a guideline as completed.

**Request Body:**
```json
{
  "completionDate": "2023-06-15T00:00:00.000Z",
  "notes": "Completed annual physical exam with Dr. Smith"
}
```

**Response:**
```json
{
  "guideline": {
    "id": "uuid",
    "name": "Annual Physical Exam",
    "last_completed_date": "2023-06-15T00:00:00.000Z",
    "next_due_date": "2024-06-15T00:00:00.000Z",
    "...": "..."
  },
  "message": "Guideline marked as completed"
}
```

### POST /api/guidelines/[id]/personalize

Creates a personalized copy of a guideline for the current user.

**Request Body:**
```json
{
  "customizations": {
    "name": "My Custom Physical Exam",
    "description": "My personalized description",
    "frequency_months": 6
  }
}
```

**Response:**
```json
{
  "guideline": {
    "id": "new_uuid",
    "name": "My Custom Physical Exam",
    "description": "My personalized description",
    "frequency_months": 6,
    "original_guideline_id": "original_uuid",
    "visibility": "private",
    "created_by": "user_id",
    "...": "..."
  },
  "message": "Guideline personalized successfully"
}
```

## Authorization

- Public guidelines can be viewed by anyone
- Private guidelines can only be viewed by their creator
- Only authenticated users can create guidelines
- Only administrators can create public guidelines
- Users can only edit or delete their own guidelines
- Administrators can edit or delete any guideline 