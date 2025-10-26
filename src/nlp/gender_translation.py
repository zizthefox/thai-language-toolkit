"""Gender-specific translation adjustments for Thai language."""

import re
from data import GENDER_PHRASES, GENDER_PRONOUNS


def apply_gender_translation(english_text: str, thai_text: str, gender: str) -> str:
    """
    Apply gender-specific translation using corpus mapping.

    Args:
        english_text: Original English text
        thai_text: Google-translated Thai text
        gender: "Male", "Female", or "Neutral"

    Returns:
        Thai text with gender-appropriate pronouns from corpus
    """
    if gender == "Neutral":
        return thai_text

    gender_key = gender.lower()

    # First, check if entire phrase has a direct mapping in corpus
    english_lower = english_text.lower().strip()
    if english_lower in GENDER_PHRASES[gender_key]:
        return GENDER_PHRASES[gender_key][english_lower]

    # Apply pronoun replacements using corpus
    pronouns = GENDER_PRONOUNS[gender_key]

    # Step 1: Replace possessives first (most specific)
    thai_text = thai_text.replace("ของฉัน", pronouns["my"])
    thai_text = thai_text.replace("ของดิฉัน", pronouns["my"])
    thai_text = thai_text.replace("ของผม", pronouns["my"])

    # Step 2: Replace ALL instances of ฉัน and ดิฉัน with gender-appropriate pronoun
    # This works for both subject (I) and object (me) positions
    thai_text = thai_text.replace("ฉัน", pronouns["i"])
    thai_text = thai_text.replace("ดิฉัน", pronouns["i"])

    # Step 3: For female speakers, carefully replace ผม (pronoun) but not ผม (hair)
    # We only replace ผม when it's NOT preceded by "รัก" (love) - simple heuristic
    if gender_key == "female":
        # Replace ผม at sentence start (pronoun)
        if thai_text.startswith("ผม"):
            thai_text = pronouns["i"] + thai_text[2:]
        # Replace ผม after spaces when NOT after รัก/ชอบ (which would make it "hair")
        thai_text = re.sub(r'(?<!รัก)(?<!ชอบ)\s+ผม\b', ' ' + pronouns["i"], thai_text)

    # Replace polite particles
    if gender_key == "male":
        thai_text = thai_text.replace("ค่ะ", pronouns["polite_particle"])
        thai_text = thai_text.replace("คะ", pronouns["polite_particle"])
    else:  # female
        thai_text = thai_text.replace("ครับ", pronouns["polite_particle"])

    return thai_text
