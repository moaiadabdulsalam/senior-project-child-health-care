# Child Health Care API Documentation

## Overview

- Base URL: `http://localhost:3001`
- Swagger UI available at: `http://localhost:3001/api`
- Global validation enabled: request payloads are validated according to DTO rules.
- Authentication: JWT access token in `Authorization: Bearer <token>` header.
- Refresh token: stored in an HTTP-only cookie by the backend when calling `/auth/login` or `/auth/refresh-token`.
- File uploads use `multipart/form-data`.

---

## Authentication

### POST /auth/register-doctor
- Purpose: Register a new doctor account.
- Auth: Public
- Content type: `multipart/form-data`
- Body fields:
  - `email` (string, required)
  - `password` (string, required, min 8)
  - `role` (string, required) - should be `DOCTOR`
  - `fullName` (string, required)
  - `fullNameArabic` (string, optional)
  - `phone` (string, required)
  - `speciality` (string, required)
  - `specialityArabic` (string, optional)
  - `description` (string, optional)
  - `clinicAddress` (string, optional)
  - `clinicAddressArabic` (string, optional)
  - `clinicPhone` (string, optional)
  - `clinicName` (string, optional)
  - `clinicNameArabic` (string, optional)
- File fields:
  - `image` (file, optional)
  - `certificate` (file, optional)

### POST /auth/register-parent
- Purpose: Register a new parent account.
- Auth: Public
- Content type: `multipart/form-data`
- Body fields:
  - `email` (string, required)
  - `password` (string, required, min 6)
  - `role` (string, required) - should be `PARENT`
  - `fullName` (string, required)
  - `fullNameArabic` (string, optional)
  - `phone` (string, required)
  - `address` (string, optional)
  - `addressArabic` (string, optional)
- File fields:
  - `image` (file, optional)

### POST /auth/login
- Purpose: Authenticate a doctor or parent.
- Auth: Public
- Body fields:
  - `email` (string, required)
  - `password` (string, required)
- Response:
  - `user` object
  - `accessToken` string
  - Refresh token is set in cookie by backend.

### POST /auth/forgot-password
- Purpose: Request password reset OTP.
- Auth: Public
- Body:
  - `email` (string, required)

### POST /auth/verify-code
- Purpose: Verify the OTP code.
- Auth: Public
- Body: use the verify OTP DTO shape.

### POST /auth/reset-password/:id
- Purpose: Reset password for user with given ID.
- Auth: Public
- Params:
  - `id` (string, required)
- Body:
  - `password` or request fields defined by reset password DTO.

### POST /auth/refresh-token
- Purpose: Refresh access token using refresh cookie.
- Auth: Requires refresh cookie set by login.
- Response:
  - `accessToken` string

### POST /auth/logout
- Purpose: Log out current user and clear refresh cookie.
- Auth: JWT required.

### GET /auth/me
- Purpose: Get current authenticated user.
- Auth: JWT required.

### POST /auth/resend-otp
- Purpose: Resend one-time password email.
- Auth: Public
- Body:
  - `email` (string, required)

---

## Public Routes

### GET /public/landing
- Purpose: Fetch public landing page content.
- Auth: Public

### POST /upload/image
- Purpose: Upload an image file.
- Auth: Public
- Content type: `multipart/form-data`
- File field:
  - `file` (image, required)

---

## Parent APIs

### GET /child
- Purpose: List children for current parent.
- Auth: JWT required, role `PARENT`
- Query params:
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 10)
  - `search` (string, optional)

### GET /child/:id
- Purpose: Get a single child by ID.
- Auth: JWT required, role `PARENT`

### POST /child
- Purpose: Create a child record.
- Auth: JWT required, role `PARENT`
- Content type: `multipart/form-data`
- Body fields:
  - `fullName` (string, required)
  - `fullNameArabic` (string, optional)
  - `gender` (enum, required)
  - `birthDate` (ISO date string, required)
  - `bloodType` (string, optional)
  - `loginHandle` (string, required)
  - `isActive` (boolean, optional)
  - `role` (enum, required) - should be `CHILD`
- File:
  - `image` (file, optional)

### PATCH /child/:id
- Purpose: Update child details.
- Auth: JWT required, role `PARENT`
- Content type: `multipart/form-data`
- Body fields: partial fields from CreateChildDto.
- File:
  - `image` (file, optional)

### DELETE /child/:id
- Purpose: Delete a child.
- Auth: JWT required, role `PARENT`

### GET /parent/appointment
- Purpose: List appointments for current parent.
- Auth: JWT required, role `PARENT`
- Query params:
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 10)
  - `status` (enum, optional)
  - `search` (string, optional)
  - `dateFrom` (string, optional)
  - `dateTo` (string, optional)

### POST /parent/appointment
- Purpose: Create an appointment.
- Auth: JWT required, role `PARENT`
- Body fields:
  - `doctorId` (string, required)
  - `childId` (string, required)
  - `date` (ISO date string, required)
  - `notes` (object, optional)
  - `reason` (string, required)

### PATCH /parent/appointment/:id
- Purpose: Update an existing appointment.
- Auth: JWT required, role `PARENT`
- Body fields: partial from CreateAppointmentDto.

### DELETE /parent/appointment/:id
- Purpose: Delete an appointment.
- Auth: JWT required, role `PARENT`

### POST /payments/checkout/:appointmentId
- Purpose: Create a checkout session for an appointment.
- Auth: JWT required, role `PARENT`

### GET /payments/status/:appointmentId
- Purpose: Get payment status for an appointment.
- Auth: JWT required, role `PARENT`

### POST /login-child/sameDevice
- Purpose: Start a child login session on the same device.
- Auth: JWT required, role `PARENT`
- Body fields:
  - `loginHandle` (string, required)
  - `childId` (string, required)
  - `durationMinutes` (number, required, 5-180)

### POST /login-child/QrDevice
- Purpose: Start a child login session via QR device.
- Auth: JWT required, role `PARENT`
- Body fields: same as `/sameDevice`

### PATCH /login-child/:id/end
- Purpose: End a child session.
- Auth: JWT required, role `PARENT`

### PATCH /login-child/:id/extend
- Purpose: Extend an active child session.
- Auth: JWT required, role `PARENT`
- Body fields:
  - `extraMinutes` (number, required, 5-60)

### GET /login-child/activeSession
- Purpose: List active child sessions for current parent.
- Auth: JWT required, role `PARENT`
- Query params:
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 10)
  - `status` (enum, optional)
  - `childId` (string, optional)

### PATCH /profile/change-password
- Purpose: Change current account password.
- Auth: JWT required, role `PARENT`, `DOCTOR`, or `ADMIN`
- Body fields:
  - `oldPassword` (string, required)
  - `newPassword` (string, required, min 8)
  - `ConfirmPassword` (string, required, min 8)

### GET /notifications/me
- Purpose: List current user notifications.
- Auth: JWT required
- Query params:
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 10)
  - `isRead` (boolean string, optional)

### GET /notifications/unread-count
- Purpose: Retrieve current unread notification count.
- Auth: JWT required

### PATCH /notifications/:id/read
- Purpose: Mark one notification as read.
- Auth: JWT required

### PATCH /notifications/read-all
- Purpose: Mark all notifications as read.
- Auth: JWT required

---

## Doctor APIs

### GET /doctor/appointment
- Purpose: List appointments for current doctor.
- Auth: JWT required, role `DOCTOR`
- Query params:
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 10)
  - `search` (string, optional)
  - `dateFrom` (string, optional)
  - `dateTo` (string, optional)

### GET /appointment/:id
- Purpose: Get appointment details by ID.
- Auth: JWT required, role `PARENT` or `DOCTOR`

### POST /doctor/appointment/:id
- Purpose: Cancel an appointment.
- Auth: JWT required, role `DOCTOR`
- Body fields:
  - `reason` (string, required)

### GET /calender/slot
- Purpose: Get doctor availability slots for one day.
- Auth: JWT required, role `DOCTOR`
- Query params:
  - `date` (ISO date string, optional, default today)
  - `type` (enum, optional)

### GET /calender/slots
- Purpose: Get doctor availability slots for one month.
- Auth: JWT required, role `DOCTOR`
- Query params:
  - `date` (ISO date string, optional, default today)
  - `type` (enum, optional)

### GET /availability-policy
- Purpose: Get current doctor availability policy.
- Auth: JWT required, role `DOCTOR`

### POST /availability-policy
- Purpose: Create doctor availability policy.
- Auth: JWT required, role `DOCTOR`
- Body fields:
  - `startWork` (ISO date string, required)
  - `endWork` (ISO date string, required)
  - `weeklyOffDays` (array of enum values, required)
  - `slot` (number, required, min 10)
  - `breakStart` (ISO date string, optional)
  - `breakEnd` (ISO date string, optional)
  - `sessionPrice` (string, required)

### PATCH /availability-policy
- Purpose: Update doctor availability policy.
- Auth: JWT required, role `DOCTOR`
- Body fields: partial from CreatePolicyDto.

### PATCH /profile/doctor
- Purpose: Update doctor profile.
- Auth: JWT required, role `DOCTOR`
- Content type: `multipart/form-data`
- Body fields (all optional):
  - `fullName`, `fullNameArabic`, `speciality`, `specialityArabic`, `description`, `phone`,
    `clinicPhone`, `clinicAddress`, `clinicAddressArabic`, `clinicName`, `clinicNameArabic`, `status`
- File fields:
  - `image` (file, optional)
  - `certificate` (file, optional)

### GET /exception
- Purpose: List exception records for doctor.
- Auth: JWT required, role `DOCTOR`
- Query params:
  - `page`, `limit`, `type`, `from`, `to`, `search`

### GET /exception/:id
- Purpose: Get one exception by ID.
- Auth: JWT required, role `DOCTOR`

### POST /exception
- Purpose: Create an exception record.
- Auth: JWT required, role `DOCTOR`
- Body fields:
  - `reason` (string, optional)
  - `type` (enum, required)
  - `startTime` (ISO date string, required)
  - `endTime` (ISO date string, required)

### PATCH /exception/:id
- Purpose: Update an exception.
- Auth: JWT required, role `DOCTOR`
- Body fields: partial from CreateExceptionDto.

### DELETE /exception/:id
- Purpose: Delete an exception.
- Auth: JWT required, role `DOCTOR`

---

## Doctor / Admin User Management

### GET /doctors
- Purpose: List all doctors.
- Auth: JWT required, role `ADMIN`

### GET /doctors/:id
- Purpose: Get doctor by ID.
- Auth: JWT required, role `ADMIN`

### GET /doctors/request/requestDoctor
- Purpose: Get pending doctor requests.
- Auth: JWT required, role `ADMIN`

### PATCH /doctors/requestDoctor/:id
- Purpose: Approve or reject doctor request.
- Auth: JWT required, role `ADMIN`
- Body fields: defined by `AnswerRequestDto`

### POST /doctors
- Purpose: Create a doctor account (admin operation).
- Auth: JWT required, role `ADMIN`

### PATCH /doctors/:id
- Purpose: Update doctor activity.
- Auth: JWT required, role `ADMIN`

### GET /parents
- Purpose: List all parent users.
- Auth: JWT required, role `ADMIN`

### GET /parents/:id
- Purpose: Get children for a specific parent.
- Auth: JWT required, role `ADMIN`

### PATCH /parents/:id
- Purpose: Update parent activity.
- Auth: JWT required, role `ADMIN`

---

## Notification APIs

### GET /notifications/me
- Purpose: List current user notifications.

### GET /notifications/unread-count
- Purpose: Get unread notification count.

### PATCH /notifications/:id/read
- Purpose: Mark a notification as read.

### PATCH /notifications/read-all
- Purpose: Mark all notifications as read.

---

## Game APIs

### GET /game
- Purpose: List available games.
- Auth: Child access guard + role `CHILD`

### GET /game/:id
- Purpose: Get game details by ID.
- Auth: Child access guard + role `CHILD`

### POST /game-session/start
- Purpose: Start a game session.
- Auth: Child access guard + role `CHILD`
- Body: empty or defined by `StartGameSessionDto`

### POST /game-session/finish
- Purpose: Finish a game session.
- Auth: Child access guard + role `CHILD`
- Body: empty or defined by `FinishGameSessionDto`

---

## Statistical APIs

### GET /statistical/revenue
- Purpose: Get doctor revenue.
- Auth: JWT required, role `DOCTOR`
- Query params: `from`, `to`

### GET /statistical/todayAppointments
- Purpose: Doctor today's appointments count.
- Auth: JWT required, role `DOCTOR`

### GET /statistical/averagePatientAge
- Purpose: Doctor average patient age.
- Auth: JWT required, role `DOCTOR`

### GET /statistical/bookingLastMonth
- Purpose: Doctor booking statistics for last month.
- Auth: JWT required, role `DOCTOR`

### GET /statistical/totalPatient
- Purpose: Total patients for doctor.
- Auth: JWT required, role `DOCTOR`

### GET /statistical/totalParent
- Purpose: Total parents for doctor.
- Auth: JWT required, role `DOCTOR`

### GET /statistical/genderDistribution
- Purpose: Gender distribution statistics.
- Auth: JWT required, role `DOCTOR`

---

## Admin Statistical APIs

### GET /admin/overview/total
- Purpose: Admin totals overview.
- Auth: JWT required, role `ADMIN`

### GET /admin/doctorsProfile
- Purpose: Admin doctors profile report.
- Auth: JWT required, role `ADMIN`

### GET /admin/doctor-speciality
- Purpose: Doctor speciality statistics.
- Auth: JWT required, role `ADMIN`

### GET /admin/child-distribution
- Purpose: Child distribution statistics.
- Auth: JWT required, role `ADMIN`

---

## Notes for Frontend

- Use `Authorization: Bearer <accessToken>` for protected endpoints.
- When calling `/auth/refresh-token`, include cookies in requests:
  - `fetch(url, { credentials: 'include' })`
- Use `Content-Type: multipart/form-data` for routes with file upload.
- The backend uses role-based guards, so route access depends on user role.
- For query-based endpoints, page/limit defaults are usually `1` and `10`.

---

## Recommended Frontend Flow

1. Register user with `/auth/register-doctor` or `/auth/register-parent`.
2. Log in with `/auth/login`.
3. Store the `accessToken` and send on protected requests.
4. Use `/auth/me` to fetch current user details.
5. Refresh the token automatically with `/auth/refresh-token` when access expires.
6. Use role-specific endpoints based on `user.role`.
