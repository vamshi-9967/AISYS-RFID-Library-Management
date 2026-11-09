from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class BaseRFIDReader(ABC):
    """Abstract interface for all physical and emulated RFID readers."""

    @abstractmethod
    def connect(self) -> bool:
        pass

    @abstractmethod
    def disconnect(self) -> bool:
        pass

    @abstractmethod
    def read_tag(self) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def write_tag(self, tag_uid: str, security_bit: int) -> bool:
        pass


class MockStaffReader(BaseRFIDReader):
    """
    Simulates a high-performance desktop HF/UHF reader pad on the librarian's desk.
    Supports single-tag interrogation and security bit modification.
    """

    def __init__(self, reader_id: str = "STAFF-PAD-01"):
        self.reader_id = reader_id
        self.is_connected = True
        self.frequency = "865-868 MHz (ETSI) / 902-928 MHz (FCC)"
        self.protocol = "EPC Class 1 Gen 2 / ISO 18000-6C"

    def connect(self) -> bool:
        self.is_connected = True
        return True

    def disconnect(self) -> bool:
        self.is_connected = False
        return True

    def read_tag(self) -> Optional[Dict[str, Any]]:
        return {
            "reader_id": self.reader_id,
            "connected": self.is_connected,
            "timestamp": datetime.utcnow().isoformat(),
            "protocol": self.protocol,
        }

    def write_tag(self, tag_uid: str, security_bit: int) -> bool:
        # Emulates writing EAS/AFI or User Memory security bit to transponder silicon
        return True


class MockHandheldReader(BaseRFIDReader):
    """
    Simulates a mobile handheld RFID wand with integrated antenna array.
    Supports high-speed inventory batch sweeps (up to 700 tags/second in real hardware).
    """

    def __init__(self, reader_id: str = "WAND-PORTABLE-01"):
        self.reader_id = reader_id
        self.is_connected = True
        self.battery_level = 94
        self.read_rate_tags_per_sec = 650

    def connect(self) -> bool:
        self.is_connected = True
        return True

    def disconnect(self) -> bool:
        self.is_connected = False
        return True

    def read_tag(self) -> Optional[Dict[str, Any]]:
        return {"reader_id": self.reader_id, "battery": self.battery_level}

    def write_tag(self, tag_uid: str, security_bit: int) -> bool:
        return True

    def sweep_shelf(self, expected_tags: List[str]) -> List[Dict[str, Any]]:
        results = []
        for tag in expected_tags:
            results.append({
                "tag_uid": tag,
                "rssi_dbm": -42.5,
                "timestamp": datetime.utcnow().isoformat(),
                "phase_angle": 124.8,
            })
        return results
