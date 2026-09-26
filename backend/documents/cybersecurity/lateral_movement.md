# Lateral Movement Investigation & Threat Hunting Framework

## Overview
Lateral movement refers to techniques that cyber adversaries use to extend access across systems on a network after gaining initial foothold.

## Key Telemetry & Artifacts
1. **Windows Security Event Logs**:
   - **Event ID 4624**: Successful logon. Key logon types:
     - Type 2: Interactive logon (console).
     - Type 3: Network logon (file sharing, SMB, WMI, WinRM, RPC).
     - Type 10: RemoteInteractive logon (RDP).
   - **Event ID 4625**: Failed logon attempts (indicator of credential brute force or spraying).
   - **Event ID 4672**: Special privileges assigned to new logon (e.g. SeDebugPrivilege).
   - **Event ID 7045**: New service installation (often PsExec or remote service execution).
   - **Event ID 4688**: Process creation with Command Line Process Auditing enabled.

2. **Network Protocol Telemetry**:
   - SMB (TCP 445) and RPC (TCP 135) connections originating from atypical workstations.
   - WMI (Windows Management Instrumentation) traffic over DCOM or WinRM (TCP 5985/5986).
   - Kerberos ticket requests (TGT and TGS) over port 88.

3. **Detection Strategies**:
   - Single telemetry sources (e.g., perimeter firewall logs alone) are insufficient because lateral movement occurs internal to the perimeter.
   - Correlate host-based EDR process ancestry (e.g. `wmiprvse.exe` spawning `powershell.exe`) with network authentication events.
