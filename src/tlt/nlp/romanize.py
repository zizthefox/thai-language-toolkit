"""Thai romanization module using RTGS and other systems."""

from typing import List, Optional
from pythainlp.transliterate import romanize as pythainlp_romanize


class ThaiRomanizer:
    """Handles Thai text romanization using various systems."""

    SUPPORTED_ENGINES = ["royin", "thai2rom", "icu"]

    def romanize(self, text: str, engine: str = "royin") -> str:
        """
        Romanize Thai text using specified engine.

        Args:
            text: Thai text to romanize
            engine: Romanization engine (default: "royin" for RTGS)
                   Options: "royin" (RTGS), "thai2rom", "icu"

        Returns:
            Romanized text
        """
        if engine not in self.SUPPORTED_ENGINES:
            raise ValueError(f"Unsupported engine: {engine}. Choose from {self.SUPPORTED_ENGINES}")

        return pythainlp_romanize(text, engine=engine)

    def romanize_words(self, words: List[str], engine: str = "royin") -> List[str]:
        """
        Romanize a list of Thai words.

        Args:
            words: List of Thai words
            engine: Romanization engine

        Returns:
            List of romanized words
        """
        return [self.romanize(word, engine) for word in words]

    def romanize_with_original(self, text: str, engine: str = "royin") -> dict:
        """
        Romanize text and return both original and romanized versions.

        Args:
            text: Thai text to romanize
            engine: Romanization engine

        Returns:
            Dictionary with original and romanized text
        """
        return {
            "original": text,
            "romanized": self.romanize(text, engine),
            "engine": engine
        }

    def compare_engines(self, text: str) -> dict:
        """
        Compare romanization results from different engines.

        Args:
            text: Thai text to romanize

        Returns:
            Dictionary with results from all engines
        """
        results = {"original": text}
        for engine in self.SUPPORTED_ENGINES:
            try:
                results[engine] = self.romanize(text, engine)
            except Exception as e:
                results[engine] = f"Error: {str(e)}"
        return results


def romanize_thai(text: str, engine: str = "royin") -> str:
    """
    Convenience function for quick Thai romanization.

    Args:
        text: Thai text to romanize
        engine: Romanization engine (default: "royin" for RTGS)

    Returns:
        Romanized text
    """
    romanizer = ThaiRomanizer()
    return romanizer.romanize(text, engine)