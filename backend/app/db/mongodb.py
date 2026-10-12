from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError

from app.core.config import settings

logger = logging.getLogger("agrivision.mongodb")


class MongoDBClient:
    _instance: Optional["MongoDBClient"] = None

    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected: bool = False
        self.error_message: Optional[str] = None
        self._init_connection()

    @classmethod
    def get_instance(cls) -> "MongoDBClient":
        if cls._instance is None:
            cls._instance = MongoDBClient()
        return cls._instance

    def _init_connection(self) -> None:
        uri = (settings.MONGODB_URI or "").strip()
        if not uri:
            self.is_connected = False
            self.error_message = "MongoDB URI not configured. Running in local file development storage mode."
            logger.info("MongoDB URI not provided. Using offline development storage.")
            return

        try:
            # Set short timeout so service doesn't hang if Atlas cluster is unreachable
            self.client = MongoClient(uri, serverSelectionTimeoutMS=2500)
            # Ping to verify active connection
            self.client.admin.command("ping")
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            self.error_message = None
            logger.info(f"Connected to MongoDB Atlas database: {settings.MONGODB_DB_NAME}")
        except ConnectionFailure as cf:
            self.is_connected = False
            self.error_message = f"Failed to connect to MongoDB Atlas: {cf}"
            logger.warning(f"MongoDB connection failed: {cf}. Falling back to local development storage.")
        except Exception as exc:
            self.is_connected = False
            self.error_message = f"MongoDB initialization error: {exc}"
            logger.warning(f"MongoDB error: {exc}. Falling back to local development storage.")

    def check_health(self) -> Dict[str, Any]:
        return {
            "is_connected": self.is_connected,
            "database_name": settings.MONGODB_DB_NAME if self.is_connected else None,
            "error": self.error_message,
        }

    def save_diagnosis(self, record: Dict[str, Any]) -> bool:
        if not self.is_connected or self.db is None:
            return False
        try:
            collection = self.db["diagnoses"]
            collection.insert_one(record)
            return True
        except PyMongoError as err:
            logger.error(f"Error saving diagnosis to MongoDB: {err}")
            return False

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.is_connected or self.db is None:
            return []
        try:
            collection = self.db["diagnoses"]
            cursor = collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
            return list(cursor)
        except PyMongoError as err:
            logger.error(f"Error fetching history from MongoDB: {err}")
            return []


db_client = MongoDBClient.get_instance()
