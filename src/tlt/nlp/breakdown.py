"""Thai text breakdown module for word segmentation and POS tagging."""

from typing import List, Dict, Optional, Tuple
import re
import pythainlp
from pythainlp import word_tokenize, pos_tag
from pythainlp.corpus import thai_stopwords
from deep_translator import MyMemoryTranslator
from googletrans import Translator
from ..data import THAI_ENGLISH_DICT, ENGLISH_THAI_NAMES


class ThaiBreakdown:
    """Handles Thai text segmentation, POS tagging, and basic analysis."""

    def __init__(self):
        self.stopwords = thai_stopwords()
        self.translator = None
        self.google_translator = None
        self._init_translator()

    def _init_translator(self):
        """Initialize the translator with fallback."""
        try:
            # MyMemory for Thai to English (works well)
            self.translator = MyMemoryTranslator(source='th-TH', target='en-GB')
        except Exception:
            self.translator = None

        # Try to import Google Translate, fallback if not available
        try:
            from googletrans import Translator
            self.google_translator = Translator()
        except Exception:
            # Fallback to MyMemory for English to Thai if Google fails
            self.google_translator = None
            try:
                self.en_to_th_translator = MyMemoryTranslator(source='en-GB', target='th-TH')
            except Exception:
                self.en_to_th_translator = None

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
        if not word.strip():
            return None

        # First check our dictionary for accurate common words
        if word in THAI_ENGLISH_DICT:
            return THAI_ENGLISH_DICT[word]

        # Fall back to online translator for unknown words
        if self.translator:
            try:
                translation = self.translator.translate(word)
                return translation if translation else None
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
        translations = []
        for word in words:
            if word.strip():  # Only translate non-empty words
                translations.append(self.translate_word(word))
            else:
                translations.append(None)
        return translations

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
            if self.translator and text.strip():
                try:
                    result["full_translation"] = self.translator.translate(text)
                except Exception:
                    result["full_translation"] = None
            else:
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

    def detect_language(self, text: str) -> str:
        """
        Detect if text is English or Thai.

        Args:
            text: Text to analyze

        Returns:
            'thai', 'english', or 'mixed'
        """
        if not text.strip():
            return 'unknown'

        # Count Thai characters
        thai_chars = sum(1 for c in text if '\u0E00' <= c <= '\u0E7F')
        # Count English letters
        english_chars = sum(1 for c in text if c.isalpha() and c.isascii())

        total_alpha = thai_chars + english_chars

        if total_alpha == 0:
            return 'unknown'

        thai_ratio = thai_chars / total_alpha

        if thai_ratio > 0.8:
            return 'thai'
        elif thai_ratio < 0.2:
            return 'english'
        else:
            return 'mixed'

    def translate_to_thai(self, text: str) -> Optional[str]:
        """
        Translate English text to Thai using Google Translate or fallback.

        Args:
            text: English text to translate

        Returns:
            Thai translation or None if unavailable
        """
        if not text.strip():
            return None

        # Try Google Translate first
        if self.google_translator:
            try:
                result = self.google_translator.translate(text, src='en', dest='th')
                return result.text
            except Exception:
                pass

        # Fallback to MyMemory if Google isn't available
        if hasattr(self, 'en_to_th_translator') and self.en_to_th_translator:
            try:
                translation = self.en_to_th_translator.translate(text)
                # Clean up HTML tags from MyMemory
                translation = re.sub(r'<g[^>]*>([^<]*)</g>', lambda m: ENGLISH_THAI_NAMES.get(m.group(1).strip(), m.group(1).strip()), translation)
                translation = re.sub(r'<g[^>]*>\s*</g>', '', translation)
                return translation
            except Exception:
                pass

        return None


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