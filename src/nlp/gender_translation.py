"""Gender-specific translation adjustments for Thai language."""

import re
from data import GENDER_PRONOUNS


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

    # Step 4: Add polite particle at end of sentence
    polite_particle = pronouns["polite_particle"]
    if polite_particle:  # Only add if not empty (neutral has empty particle)
        # Check if sentence already ends with a polite particle
        if not (thai_text.endswith("ครับ") or thai_text.endswith("ค่ะ") or thai_text.endswith("คะ")):
            # Check if it's a question (ends with ไหม, หรือ, or has ?)
            if thai_text.endswith("ไหม") or thai_text.endswith("หรือ") or "?" in thai_text:
                # For questions, add question particle
                thai_text = thai_text.rstrip("?").strip() + pronouns["polite_question"]
            else:
                # For statements, add polite particle
                thai_text = thai_text.strip() + polite_particle

    return thai_text
