# Security Policy — SentinelAI

## Reporting a Vulnerability

Security is a core priority of **SentinelAI**. If you discover a potential security vulnerability, privilege escalation path, or credential handling issue, please notify the maintainers privately rather than opening a public issue.

### Preferred Reporting Method
* **Email**: Security Contact via GitHub repository maintainers
* **PGP Key / Encrypted Channel**: Available upon request

### Response SLA
* **Initial Response**: Within 24 hours
* **Vulnerability Assessment**: Within 48 hours
* **Remediation Release**: Target within 5 business days for critical vulnerabilities

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x (Current) | ✅ Yes |
| < 1.0 | ❌ End of Life |

## Security Best Practices Implemented
* **Zero Service-Role Key Exposure**: Client browser bundles only utilize public anonymous keys. Sensitive administrative tokens remain server-side.
* **Row-Level Security (RLS)**: Enforced across PostgreSQL tables in Supabase for user boundary isolation.
* **Resilient Graceful Degradation**: Offline fallback modes ensure local state protection without exposing remote connection details.
* **Strict Input Validation**: Sanitize multi-modal payloads and user-provided threat telemetry strings.
