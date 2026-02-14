"""
Production-grade audit logging utilities for CardioAI
Phase 4.5: Compliance & Audit Trail
"""
import json
import logging
from backend.database import get_db_connection

logger = logging.getLogger(__name__)

def log_audit(doctor_id: int, action: str, entity: str, entity_id: int = None, details: dict = None):
    """
    Log an audit event to the audit_logs table.
    
    Args:
        doctor_id: ID of the doctor performing the action
        action: Action performed (e.g., 'CREATE_PATIENT', 'UPDATE_DIAGNOSIS')
        entity: Entity type (e.g., 'patients', 'records')
        entity_id: ID of the entity affected
        details: Additional context as a dictionary
    """
    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO audit_logs (doctor_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)",
            (doctor_id, action, entity, entity_id, json.dumps(details) if details else None)
        )
        conn.commit()
        conn.close()
        logger.info(f"Audit: {action} on {entity}#{entity_id} by doctor#{doctor_id}")
    except Exception as e:
        logger.error(f"Audit logging failed: {e}")
