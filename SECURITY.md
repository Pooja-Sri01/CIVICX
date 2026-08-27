# Security Policy

## Supported Versions

The following versions of **CIVICX** are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security of CIVICX seriously. If you believe you have found a security vulnerability in this repository, please follow these steps:

1. **Do Not Open a Public Issue**: Please do not file public GitHub issues for security vulnerabilities.
2. **Contact the Maintainers**: Report vulnerabilities privately by opening a [GitHub Security Advisory](https://github.com/Pooja-Sri01/CIVICX/security/advisories/new) or contacting the maintainer via GitHub.
3. **Include Details**:
   - Description of the vulnerability.
   - Steps to reproduce or proof-of-concept (PoC).
   - Potential impact of the issue.
   - Any suggested mitigations.

### Response Timeline
- **Initial Response**: Within 48 hours acknowledging receipt of your report.
- **Status Update**: Within 7 business days with an assessment and remediation plan.
- **Fix & Disclosure**: Coordinated release and disclosure once a patch is verified.

---

## Security Best Practices in CIVICX

- **Authentication & RBAC**: Strict separation of Citizen vs. Municipal Authority roles.
- **Audit Logging**: Immutable audit trail for all municipal status transitions and point credit events.
- **Input Validation**: All payloads validated using Pydantic schemas and sanitization filters.
- **Zero Hardcoded Secrets**: Configuration is managed via environment variables.
