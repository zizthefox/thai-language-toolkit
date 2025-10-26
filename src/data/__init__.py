"""Data module for Thai Language Toolkit."""

from .thai_dict import THAI_ENGLISH_DICT
from .name_transliteration import ENGLISH_THAI_NAMES
from .pos_labels import POS_LABELS, get_pos_label

__all__ = ["THAI_ENGLISH_DICT", "ENGLISH_THAI_NAMES", "POS_LABELS", "get_pos_label"]