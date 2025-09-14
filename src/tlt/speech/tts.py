"""Thai Text-to-Speech module using Edge TTS."""

import asyncio
import io
from typing import Optional, List, Dict
import tempfile
import os


class ThaiTTS:
    """Thai Text-to-Speech using Microsoft Edge TTS."""

    def __init__(self):
        self.available_voices = {}
        self._init_voices()

    def _init_voices(self):
        """Initialize available Thai voices."""
        # Thai voices from Edge TTS
        self.available_voices = {
            "th-TH-PremwadeeNeural": {
                "name": "Premwadee",
                "gender": "Female",
                "description": "Natural female voice"
            },
            "th-TH-NiwatNeural": {
                "name": "Niwat",
                "gender": "Male",
                "description": "Natural male voice"
            },
            "th-TH-AcharaNeural": {
                "name": "Achara",
                "gender": "Female",
                "description": "Natural female voice (alternative)"
            }
        }

    async def _generate_speech(self, text: str, voice: str = "th-TH-PremwadeeNeural") -> Optional[bytes]:
        """
        Generate speech audio using Edge TTS.

        Args:
            text: Text to convert to speech
            voice: Voice ID to use

        Returns:
            Audio bytes or None if failed
        """
        try:
            import edge_tts

            communicate = edge_tts.Communicate(text, voice)
            audio_data = b""

            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]

            return audio_data
        except Exception:
            return None

    def speak_text(self, text: str, voice: str = "th-TH-PremwadeeNeural") -> Optional[bytes]:
        """
        Convert text to speech and return audio bytes.

        Args:
            text: Text to convert to speech
            voice: Voice ID to use

        Returns:
            Audio bytes or None if failed
        """
        if not text.strip():
            return None

        try:
            # Run the async function
            return asyncio.run(self._generate_speech(text, voice))
        except Exception:
            return None

    def save_audio(self, text: str, output_path: str, voice: str = "th-TH-PremwadeeNeural") -> bool:
        """
        Convert text to speech and save to file.

        Args:
            text: Text to convert to speech
            output_path: Path to save audio file (.mp3)
            voice: Voice ID to use

        Returns:
            True if successful, False otherwise
        """
        audio_bytes = self.speak_text(text, voice)
        if not audio_bytes:
            return False

        try:
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            return True
        except Exception:
            return False

    def get_available_voices(self) -> Dict[str, Dict]:
        """
        Get available Thai voices.

        Returns:
            Dictionary of voice IDs and their details
        """
        return self.available_voices

    def is_available(self) -> bool:
        """
        Check if TTS engine is available.

        Returns:
            True if available, False otherwise
        """
        try:
            import edge_tts
            return True
        except ImportError:
            return False


def create_tts_audio(text: str, voice: str = "th-TH-PremwadeeNeural") -> Optional[bytes]:
    """
    Convenience function to create TTS audio.

    Args:
        text: Text to convert to speech
        voice: Voice ID to use

    Returns:
        Audio bytes or None if failed
    """
    tts = ThaiTTS()
    return tts.speak_text(text, voice)