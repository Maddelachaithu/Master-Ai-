# Active Directory Kerberos Authentication and Attack Vectors

## Kerberos Authentication Protocol
Kerberos is the default authentication protocol for Active Directory domains.

### Key Components:
1. **AS-REQ / AS-REP**: Client requests a Ticket Granting Ticket (TGT) from the Key Distribution Center (KDC) Authentication Service.
2. **TGS-REQ / TGS-REP**: Client presents the TGT to request a Service Ticket (TGS) for a specific Service Principal Name (SPN).
3. **AP-REQ**: Client authenticates to the target service presenting the TGS ticket.

## Attack Vectors:
- **Pass-the-Ticket (PtT)**: Adversaries harvest valid Kerberos TGT or TGS tickets from LSASS process memory (e.g. via Mimikatz) and inject them into their current logon session without knowing the plaintext password or password hash.
- **Kerberoasting**: Requesting TGS tickets for accounts with SPNs and cracking the encrypted ticket offline with tools like Hashcat to recover service account plaintext passwords.
- **Golden Ticket**: Forging a TGT using the decrypted `krbtgt` account hash, granting domain-wide administrative access.
