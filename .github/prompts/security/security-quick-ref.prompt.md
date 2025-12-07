---
mode: agent
description: Security quick reference - OWASP Top 10 checklist and basic hardening
---

# Security Quick Reference

Fast security checks before deploying code.

---

## OWASP Top 10 (2021) Checklist

| # | Vulnerability | Quick Check |
|---|---------------|-------------|
| **A01** | Broken Access Control | Are routes protected? Role checks in place? |
| **A02** | Cryptographic Failures | Using HTTPS? Passwords hashed (bcrypt)? Secrets in env? |
| **A03** | Injection | Parameterized queries? Input sanitization? |
| **A04** | Insecure Design | Threat model exists? Security requirements defined? |
| **A05** | Security Misconfiguration | Defaults changed? Debug mode off? Error messages generic? |
| **A06** | Vulnerable Components | `npm audit` clean? Dependencies up to date? |
| **A07** | Auth/AuthN Failures | Rate limiting on login? MFA available? Session expiry? |
| **A08** | Data Integrity Failures | Signed JWTs? CI/CD integrity checks? Input validation? |
| **A09** | Logging Failures | Security events logged? No secrets in logs? Monitoring active? |
| **A10** | SSRF | External URLs validated? Allowlist in place? |

---

## Node.js Hardening Checklist

### Environment
```bash
# ✅ Use environment variables for secrets
DATABASE_URL=postgresql://...
JWT_SECRET=random-256-bit-string

# ❌ Never commit .env files
echo ".env" >> .gitignore
```

### Helmet.js (Express/NestJS)
```typescript
import helmet from 'helmet';
app.use(helmet()); // Sets secure HTTP headers
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use('/api/', limiter);
```

### Input Validation
```typescript
// ✅ Use class-validator
import { IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

// ❌ Never trust user input
const query = `SELECT * FROM users WHERE id = ${req.params.id}`; // SQL injection
```

### Password Hashing
```typescript
import * as bcrypt from 'bcrypt';

// ✅ Hash passwords with bcrypt (10+ rounds)
const hash = await bcrypt.hash(password, 12);

// ❌ Never store plaintext passwords
const user = { password: req.body.password }; // NO!
```

### Dependency Security
```bash
# Run before every commit
npm audit
npm audit fix

# Check for outdated packages
npm outdated
```

---

## JWT Security

```typescript
// ✅ Sign tokens with strong secret
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '15m', // Short expiry
  algorithm: 'HS256',
});

// ✅ Verify tokens
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// ❌ Never expose secrets in code
const secret = 'mySecret123'; // NO!
```

---

## When to Load Full Prompts

**Use this quick-ref for**: Basic checks, code reviews, pre-deployment validation

**Load full prompts when**:
- `owasp-top10-analysis.prompt.md` — Deep OWASP analysis requested
- `nodejs-security-hardening.prompt.md` — Comprehensive hardening guide needed
- `npm-package-security.prompt.md` — Supply chain security audit
- `secure-code-review.prompt.md` — Line-by-line vulnerability review
- `threat-modeling.prompt.md` — STRIDE/PASTA threat modeling

---

## Red Flags (Immediate Attention)

🚨 **Hardcoded secrets** in code  
🚨 **SQL queries with string concatenation**  
🚨 **`eval()` or `new Function()` with user input**  
🚨 **Unvalidated redirects** (`res.redirect(req.query.url)`)  
🚨 **CORS enabled for `*`** in production  
🚨 **Debug mode enabled** in production  
🚨 **npm packages with critical vulnerabilities**  

---

## Fast Security Wins

1. Run `npm audit` and fix critical/high
2. Add `helmet()` middleware
3. Enable rate limiting on authentication routes
4. Use `class-validator` for all DTOs
5. Move secrets to `.env` + add to `.gitignore`
6. Set JWT expiry to 15 minutes (use refresh tokens)
7. Enable HTTPS (Let's Encrypt for free certs)
