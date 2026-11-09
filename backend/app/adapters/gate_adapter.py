from typing import Dict, Any, Optional
from datetime import datetime

class MockGateAdapter:
    """
    Simulates dual-pedestal RFID Anti-Theft Security Gates.
    Monitors EAS (Electronic Article Surveillance) bits or AFI (Application Family Identifier).
    """

    def __init__(self, gate_id: str = "GATE-MAIN-01", location: str = "Central Foyer"):
        self.gate_id = gate_id
        self.location = location
        self.status = "ONLINE"
        self.alarm_active = False

    def process_egress_tag(self, tag_uid: str, security_bit: int) -> Dict[str, Any]:
        """
        Process transponder detection at gate threshold.
        security_bit == 1: Armed (not issued or loan expired) -> Trigger siren and CCTV snapshot
        security_bit == 0: Disarmed (checked out) -> Authorized passage
        """
        now = datetime.utcnow()
        if security_bit == 1:
            self.alarm_active = True
            return {
                "gate_id": self.gate_id,
                "location": self.location,
                "tag_uid": tag_uid,
                "auth_result": "UNAUTHORIZED",
                "alarm_status": "TRIGGERED",
                "siren_frequency_hz": 2800,
                "strobe_light": "FLASHING_RED",
                "cctv_snapshot": f"CCTV_{self.gate_id}_{now.strftime('%Y%m%d_%H%M%S')}.jpg",
                "timestamp": now.isoformat(),
            }
        else:
            self.alarm_active = False
            return {
                "gate_id": self.gate_id,
                "location": self.location,
                "tag_uid": tag_uid,
                "auth_result": "AUTHORIZED",
                "alarm_status": "QUIET",
                "timestamp": now.isoformat(),
            }

    def reset_alarm(self) -> bool:
        self.alarm_active = False
        return True
