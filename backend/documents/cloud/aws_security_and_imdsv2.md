# AWS Security, IAM and IMDSv2 Architecture

## Instance Metadata Service (IMDSv2)
The Amazon EC2 Instance Metadata Service provides identity credentials and runtime configuration to EC2 instances.

### IMDSv1 vs IMDSv2
- **IMDSv1**: Vulnerable to Server-Side Request Forgery (SSRF). Attackers who trick web applications into making GET requests to `http://169.254.169.254/latest/meta-data/` could steal temporary IAM instance profile role credentials.
- **IMDSv2**: Session-oriented. Requires a `PUT` request with the header `X-aws-ec2-metadata-token-ttl-seconds` to acquire an encrypted session token. Subsequent requests must include `X-aws-ec2-metadata-token`. This prevents SSRF exploitation via standard HTTP proxying and WAF bypasses.

## IAM Least Privilege & Session Policies
- Grant temporary security tokens using AWS STS `AssumeRole` rather than static long-term access keys.
- Enforce MFA and IP restriction conditions in IAM trust policies.
