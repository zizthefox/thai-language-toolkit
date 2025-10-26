"""Gender-specific pronoun mappings for Thai translations."""

# Pronoun mapping for English to Thai based on speaker gender
GENDER_PRONOUNS = {
    "male": {
        # First person pronouns
        "i": "ผม",
        "me": "ผม",
        "my": "ของผม",
        "mine": "ของผม",
        "myself": "ตัวผมเอง",

        # Polite particles
        "polite_particle": "ครับ",
        "polite_question": "ครับ",
    },
    "female": {
        # First person pronouns (using informal ฉัน - more natural for daily conversation)
        # Note: ดิฉัน is very formal and mainly used in professional/official settings
        "i": "ฉัน",
        "me": "ฉัน",
        "my": "ของฉัน",
        "mine": "ของฉัน",
        "myself": "ตัวฉันเอง",

        # Polite particles (ค่ะ/คะ are used regardless of formality)
        "polite_particle": "ค่ะ",
        "polite_question": "คะ",
    },
    "neutral": {
        # First person pronouns (generic)
        "i": "ฉัน",
        "me": "ฉัน",
        "my": "ของฉัน",
        "mine": "ของฉัน",
        "myself": "ตัวฉันเอง",

        # No specific polite particles for neutral
        "polite_particle": "",
        "polite_question": "",
    }
}

def get_pronoun(pronoun_key: str, gender: str = "neutral") -> str:
    """
    Get the appropriate Thai pronoun for the given gender.

    Args:
        pronoun_key: English pronoun key (e.g., "i", "my", "me")
        gender: "male", "female", or "neutral"

    Returns:
        Thai pronoun
    """
    gender = gender.lower()
    if gender not in GENDER_PRONOUNS:
        gender = "neutral"

    return GENDER_PRONOUNS[gender].get(pronoun_key.lower(), "")
