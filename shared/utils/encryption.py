"""Encryption utilities for sensitive data."""

import base64
import os
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class EncryptionHandler:
    """Handle encryption and decryption of sensitive data."""

    def __init__(self, encryption_key: Optional[str] = None):
        """Initialize encryption handler with key."""
        key = encryption_key or os.getenv("ENCRYPTION_KEY")

        if not key:
            raise ValueError("Encryption key is required")

        # Ensure key is 32 bytes for Fernet
        if len(key) < 32:
            # Derive a proper key using PBKDF2HMAC
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b"complianceiq-salt",  # In production, use unique salt per installation
                iterations=100000,
            )
            key_bytes = kdf.derive(key.encode())
            self.key = base64.urlsafe_b64encode(key_bytes)
        else:
            self.key = key.encode()[:32]
            self.key = base64.urlsafe_b64encode(self.key)

        self.fernet = Fernet(self.key)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt plaintext string."""
        if not plaintext:
            return ""

        encrypted = self.fernet.encrypt(plaintext.encode())
        return encrypted.decode()

    def decrypt(self, encrypted_text: str) -> str:
        """Decrypt encrypted string."""
        if not encrypted_text:
            return ""

        decrypted = self.fernet.decrypt(encrypted_text.encode())
        return decrypted.decode()

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt."""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)


# Global encryption handler
encryption_handler = EncryptionHandler()
