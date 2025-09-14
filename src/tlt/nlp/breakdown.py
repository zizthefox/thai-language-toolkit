"""Thai text breakdown module for word segmentation and POS tagging."""

from typing import List, Dict, Optional, Tuple
import pythainlp
from pythainlp import word_tokenize, pos_tag
from pythainlp.corpus import thai_stopwords


class ThaiBreakdown:
    """Handles Thai text segmentation, POS tagging, and basic analysis."""

    def __init__(self):
        self.stopwords = thai_stopwords()

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

    def breakdown(self, text: str, include_pos: bool = True,
                 filter_stopwords: bool = False) -> Dict:
        """
        Complete breakdown of Thai text.

        Args:
            text: Thai text to analyze
            include_pos: Whether to include POS tags
            filter_stopwords: Whether to filter out stopwords

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

        return {
            "word": word,
            "length": len(word),
            "pos": pos,
            "is_stopword": word in self.stopwords,
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