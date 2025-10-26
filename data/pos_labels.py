"""POS tag labels mapping for human-readable display."""

# POS tag mapping to human-readable labels
# Based on PyThaiNLP's ORCHID POS tagging output (47 tags)
POS_LABELS = {
    # Universal POS tags
    "NOUN": "Noun",
    "VERB": "Verb",
    "ADJ": "Adjective",
    "ADV": "Adverb",
    "PRON": "Pronoun",
    "DET": "Determiner",
    "ADP": "Preposition",
    "CONJ": "Conjunction",
    "CCONJ": "Coordinating Conjunction",
    "SCONJ": "Subordinating Conjunction",
    "NUM": "Number",
    "PART": "Particle",
    "INTJ": "Interjection",
    "AUX": "Auxiliary Verb",
    "PROPN": "Proper Noun",
    "PUNCT": "Punctuation",
    "SYM": "Symbol",
    "X": "Other",

    # ORCHID POS tags (Thai-specific)
    "NCMN": "Common Noun",
    "NPRP": "Proper Noun",
    "DONM": "Determiner",
    "VACT": "Active Verb",
    "VSTA": "Stative Verb",
    "ADVN": "Adverb",
    "ADVP": "Adverbial Phrase",
    "ADVI": "Adverb of Inquiry",
    "ADVS": "Adverb of Space",
    "JCRG": "Coordinating Conjunction",
    "JCMP": "Comparative Conjunction",
    "NEG": "Negation",
    "PREL": "Relative Pronoun",
    "PPRS": "Personal Pronoun",
    "RPRE": "Preposition",
    "EAFF": "Affirmative Particle",
    "CFQC": "Classifier",
    "CMTR": "Comparative Marker",
    "FIXN": "Prefix/Suffix",
    "FIXV": "Verb Prefix",
    "EITT": "Iterative Particle",
}


def get_pos_label(pos_tag: str) -> str:
    """
    Convert POS tag to human-readable label.

    Args:
        pos_tag: The POS tag acronym

    Returns:
        Human-readable label, or the original tag if not found
    """
    return POS_LABELS.get(pos_tag, pos_tag)
