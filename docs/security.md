# Monolith Security Setup Guide

This document covers the built-in security features of the **Monolith** platform and guidelines to maintain a secure environment in production.

---

## 1. Authentication Security
- **Password Hashing**: User passwords are encrypted before storage using `bcryptjs` with a cost factor of `10` rounds, preventing raw password recovery in case of database leaks.
- **JWT Authorization**: Authenticated user sessions are verified using JSON Web Tokens (JWT). 
  - Tokens expire in **7 days**.
  - A secure signature secret (`JWT_SECRET`) must be set in your production `.env` file. Never commit this key to version control.
  - Verification tokens are extracted via the `Authorization: Bearer <token>` header, preventing session hijacking.

---

## 2. Database Protection (SQLi)
- The project utilizes **Prisma ORM** for all database queries. Prisma automatically parameterizes and sanitizes all inputs (e.g. searching, checking coupons, or placing orders). 
- Avoid raw query inputs (`prisma.$queryRaw`) unless parameterized placeholders are explicitly used.

---

## 3. Cross-Site Scripting (XSS) Prevention
- **React Auto-escaping**: React automatically escapes all variables rendered inside JSX. 
- Avoid using `dangerouslySetInnerHTML` for rendering review text, messages, or user comments.

---

## 4. Input Sanitization & Mobile Validation
- Addresses and recipient names are validated upon submission.
- Mobile numbers are verified using a strict regex for standard Pakistan formats:
  - Supports `03\d{9}` (e.g. `03001234567`) and `\+923\d{9}` (e.g. `+923001234567`).
  - Standardizes raw inputs before database entry.

---

## 5. Security Checklist for Production
- [ ] Set `NODE_ENV` to `production`.
- [ ] Set `PAYMENT_SANDBOX` to `false`.
- [ ] Generate a high-entropy `JWT_SECRET` (e.g., `openssl rand -base64 32`).
- [ ] Configure SSL certificates (HTTPS is mandatory for PayFast and JWT headers).
- [ ] Set up basic rate limiting on `/api/auth/login` and `/api/auth/register` (can be configured in Vercel Middleware or your VPS reverse proxy like Nginx).
