# -*- coding: utf-8 -*-
"""
AgriVision AI — User Account Management Service
Supports dual persistence: MongoDB Atlas or Local JSON Development store.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.db.mongodb import db_client

logger = logging.getLogger("agrivision.users")


class UserService:
    def __init__(self):
        self.storage_dir = settings.storage_path
        self.local_users_file = self.storage_dir / "users.json"
        self._init_local_store()

    def _init_local_store(self) -> None:
        if not self.local_users_file.exists():
            try:
                self.local_users_file.write_text("[]", encoding="utf-8")
            except Exception as e:
                logger.error(f"Failed to initialize local users file: {e}")

    # --- Read Local Users ---
    def _read_local_users(self) -> List[Dict[str, Any]]:
        if not self.local_users_file.exists():
            return []
        try:
            return json.loads(self.local_users_file.read_text(encoding="utf-8"))
        except Exception as e:
            logger.error(f"Failed to read local users: {e}")
            return []

    # --- Write Local Users ---
    def _write_local_users(self, users: List[Dict[str, Any]]) -> None:
        try:
            self.local_users_file.write_text(json.dumps(users, indent=2), encoding="utf-8")
        except Exception as e:
            logger.error(f"Failed to write local users: {e}")

    # --- Create User ---
    def register_user(self, name: str, email: str, password: str) -> Dict[str, Any]:
        """
        Register a new user account.
        Hashes password using PBKDF2-HMAC-SHA256.
        """
        clean_email = email.strip().lower()
        clean_name = name.strip()

        # Check existing user
        if self.get_user_by_email(clean_email):
            raise ValueError(f"An account with email '{clean_email}' already exists.")

        user_id = str(uuid.uuid4())
        now_iso = datetime.utcnow().isoformat() + "Z"
        pwd_hash = hash_password(password)

        user_doc: Dict[str, Any] = {
            "id": user_id,
            "name": clean_name,
            "email": clean_email,
            "password_hash": pwd_hash,
            "created_at": now_iso,
        }

        storage_mode = "local_dev"
        # 1. Attempt MongoDB
        if db_client.is_connected and db_client.db is not None:
            try:
                db_client.db["users"].insert_one(user_doc.copy())
                storage_mode = "mongodb"
            except Exception as e:
                logger.warning(f"MongoDB user save error: {e}. Falling back to local users file.")
                self._save_local_user(user_doc)
        else:
            self._save_local_user(user_doc)

        return self._sanitize_user(user_doc, storage_mode=storage_mode)

    def _save_local_user(self, user_doc: Dict[str, Any]) -> None:
        users = self._read_local_users()
        users.append(user_doc)
        self._write_local_users(users)

    # --- Lookup by Email ---
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        clean_email = email.strip().lower()
        if db_client.is_connected and db_client.db is not None:
            try:
                doc = db_client.db["users"].find_one({"email": clean_email})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
            except Exception as e:
                logger.error(f"MongoDB get_user_by_email error: {e}")

        # Local JSON fallback
        users = self._read_local_users()
        for u in users:
            if u.get("email", "").lower() == clean_email:
                return u
        return None

    # --- Lookup by ID ---
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if db_client.is_connected and db_client.db is not None:
            try:
                doc = db_client.db["users"].find_one({"id": user_id})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
            except Exception as e:
                logger.error(f"MongoDB get_user_by_id error: {e}")

        # Local JSON fallback
        users = self._read_local_users()
        for u in users:
            if u.get("id") == user_id:
                return u
        return None

    # --- Authenticate ---
    def authenticate(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        
        stored_hash = user.get("password_hash", "")
        if not verify_password(password, stored_hash):
            return None

        storage_mode = "mongodb" if db_client.is_connected else "local_dev"
        return self._sanitize_user(user, storage_mode=storage_mode)

    # --- Count User Diagnoses ---
    def count_user_diagnoses(self, user_id: str) -> int:
        if db_client.is_connected and db_client.db is not None:
            try:
                return db_client.db["diagnoses"].count_documents({"user_id": user_id})
            except Exception:
                pass

        # Local JSON
        from app.services.storage import storage_service
        try:
            records = storage_service._read_local_records()
            return sum(1 for r in records if r.get("user_id") == user_id)
        except Exception:
            return 0

    def _sanitize_user(self, user_doc: Dict[str, Any], storage_mode: str = "local_dev") -> Dict[str, Any]:
        """Strip password hash and sensitive fields before returning to caller."""
        total = self.count_user_diagnoses(user_doc["id"])
        return {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "email": user_doc["email"],
            "created_at": user_doc.get("created_at", ""),
            "total_diagnoses": total,
            "storage_mode": storage_mode,
        }


user_service = UserService()
