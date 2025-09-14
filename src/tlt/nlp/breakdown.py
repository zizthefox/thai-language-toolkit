"""Thai text breakdown module for word segmentation and POS tagging."""

from typing import List, Dict, Optional, Tuple
import pythainlp
from pythainlp import word_tokenize, pos_tag
from pythainlp.corpus import thai_stopwords
from pythainlp.translate import Translate


class ThaiBreakdown:
    """Handles Thai text segmentation, POS tagging, and basic analysis."""

    def __init__(self):
        self.stopwords = thai_stopwords()
        self.translator = None
        self._init_translator()

    def _init_translator(self):
        """Initialize the translator with fallback."""
        try:
            self.translator = Translate('th', 'en')
        except Exception:
            # Fallback if translation model fails to load
            self.translator = None

    def segment(self, text: str, engine: str = "newmm") -> List[str]:
        """
        Segment Thai text into words.

        Args:
            text: Thai text to segment
            engine: Segmentation engine (default: "newmm")
                   Options: "newmm", "longest", "attacut", "deepcut"

        Returns:
            List of segmented words
        """
        return word_tokenize(text, engine=engine, keep_whitespace=False)

    def pos_tag_words(self, words: List[str], engine: str = "perceptron") -> List[Tuple[str, str]]:
        """
        Tag parts of speech for segmented words.

        Args:
            words: List of Thai words
            engine: POS tagging engine (default: "perceptron")

        Returns:
            List of (word, POS) tuples
        """
        return pos_tag(words, engine=engine)

    def translate_word(self, word: str) -> Optional[str]:
        """
        Translate a single Thai word to English.

        Args:
            word: Thai word to translate

        Returns:
            English translation or None if unavailable
        """
        if self.translator:
            try:
                return self.translator.translate(word)
            except Exception:
                pass
        return None

    def translate_words(self, words: List[str]) -> List[Optional[str]]:
        """
        Translate a list of Thai words to English.

        Args:
            words: List of Thai words

        Returns:
            List of English translations (None for untranslatable words)
        """
        return [self.translate_word(word) for word in words]

    def breakdown(self, text: str, include_pos: bool = True,
                 filter_stopwords: bool = False, include_translation: bool = True) -> Dict:
        """
        Complete breakdown of Thai text.

        Args:
            text: Thai text to analyze
            include_pos: Whether to include POS tags
            filter_stopwords: Whether to filter out stopwords
            include_translation: Whether to include English translations

        Returns:
            Dictionary with breakdown results
        """
        # Segment text
        words = self.segment(text)

        # Filter stopwords if requested
        if filter_stopwords:
            filtered_words = [w for w in words if w not in self.stopwords]
        else:
            filtered_words = words

        result = {
            "original": text,
            "words": words,
            "word_count": len(words),
            "filtered_words": filtered_words if filter_stopwords else None,
        }

        # Add POS tags if requested
        if include_pos:
            pos_tags = self.pos_tag_words(words)
            result["pos_tags"] = pos_tags

        # Add translations if requested
        if include_translation:
            translations = self.translate_words(words)
            result["translations"] = translations
            # Also translate the full sentence
            if self.translator:
                try:
                    result["full_translation"] = self.translator.translate(text)
                except Exception:
                    result["full_translation"] = None

        return result

    def get_word_info(self, word: str) -> Dict:
        """
        Get detailed information about a Thai word.

        Args:
            word: Thai word to analyze

        Returns:
            Dictionary with word information
        """
        # Get POS tag for single word
        pos_tags = pos_tag([word])
        pos = pos_tags[0][1] if pos_tags else "UNKNOWN"

        # Get translation
        translation = self.translate_word(word)

        return {
            "word": word,
            "length": len(word),
            "pos": pos,
            "is_stopword": word in self.stopwords,
            "translation": translation,
        }


def breakdown_text(text: str, **kwargs) -> Dict:
    """
    Convenience function for quick text breakdown.

    Args:
        text: Thai text to breakdown
        **kwargs: Additional arguments for ThaiBreakdown.breakdown()

    Returns:
        Breakdown results dictionary
    """
    breaker = ThaiBreakdown()
    return breaker.breakdown(text, **kwargs)