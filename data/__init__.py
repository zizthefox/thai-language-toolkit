"""Data module for Thai Language Toolkit."""

from .thai_dict import THAI_ENGLISH_DICT
from .name_transliteration import ENGLISH_THAI_NAMES
from .pos_labels import POS_LABELS, get_pos_label
from .gender_pronouns import GENDER_PRONOUNS, GENDER_PHRASES, get_pronoun, get_phrase

__all__ = [
    "THAI_ENGLISH_DICT",
    "ENGLISH_THAI_NAMES",
    "POS_LABELS",
    "get_pos_label",
    "GENDER_PRONOUNS",
    "GENDER_PHRASES",
    "get_pronoun",
    "get_phrase",
]