# Input Validation

All user inputs must be validated before processing.

## Validation Rules

| Field | Rules | Error Message |
|-------|-------|---------------|
| Card Title | Required, max 500 chars | "Title is required" / "Title too long" |
| Card Description | Max 5000 chars, sanitize HTML | "Description too long" |
| Board Name | Required, max 100 chars | "Board name is required" |
| Project Name | Required, max 100 chars | "Project name is required" |
| Due Date | Valid ISO date, not in past (optional) | "Invalid date format" |
| Time Estimate | Number >= 0, max 999 | "Must be a positive number" |
| Email (invite) | Valid email format | "Invalid email address" |
| File Upload | Max 10MB, allowed types: image/*, .pdf, .doc, .docx | "File too large" / "File type not allowed" |

## Validation Implementation

```javascript
// Validation utility functions
export const validators = {
    required: (value) => value?.trim().length > 0,
    maxLength: (value, max) => value?.length <= max,
    isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    isPositiveNumber: (value) => !isNaN(value) && Number(value) >= 0,
    isValidDate: (value) => !isNaN(Date.parse(value)),
    maxFileSize: (file, maxMB) => file.size <= maxMB * 1024 * 1024,
    allowedFileType: (file, types) => types.some(t => file.type.match(t))
};

// Usage example
const validateCard = (card) => {
    const errors = [];
    if (!validators.required(card.title)) errors.push('Title is required');
    if (!validators.maxLength(card.title, 500)) errors.push('Title too long');
    if (card.description && !validators.maxLength(card.description, 5000)) {
        errors.push('Description too long');
    }
    return errors;
};
```

---
