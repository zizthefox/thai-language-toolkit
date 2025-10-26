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

# Common phrases that need gender-specific translation
GENDER_PHRASES = {
    "male": {
        "hello": "สวัสดีครับ",
        "thank you": "ขอบคุณครับ",
        "excuse me": "ขอโทษครับ",
        "good morning": "สวัสดีตอนเช้าครับ",
        "good night": "ราตรีสวัสดิ์ครับ",
        "goodbye": "ลาก่อนครับ",
        "yes": "ครับ",
        "i am": "ผมเป็น",
        "i have": "ผมมี",
        "i want": "ผมต้องการ",
        "i like": "ผมชอบ",
        "i love": "ผมรัก",
        "i need": "ผมต้องการ",
        "i think": "ผมคิดว่า",
        "i know": "ผมรู้",
        "i understand": "ผมเข้าใจ",
    },
    "female": {
        "hello": "สวัสดีค่ะ",
        "thank you": "ขอบคุณค่ะ",
        "excuse me": "ขอโทษค่ะ",
        "good morning": "สวัสดีตอนเช้าค่ะ",
        "good night": "ราตรีสวัสดิ์ค่ะ",
        "goodbye": "ลาก่อนค่ะ",
        "yes": "ค่ะ",
        "i am": "ฉันเป็น",
        "i have": "ฉันมี",
        "i want": "ฉันต้องการ",
        "i like": "ฉันชอบ",
        "i love": "ฉันรัก",
        "i need": "ฉันต้องการ",
        "i think": "ฉันคิดว่า",
        "i know": "ฉันรู้",
        "i understand": "ฉันเข้าใจ",
    },
    "neutral": {
        "hello": "สวัสดี",
        "thank you": "ขอบคุณ",
        "excuse me": "ขอโทษ",
        "good morning": "สวัสดีตอนเช้า",
        "good night": "ราตรีสวัสดิ์",
        "goodbye": "ลาก่อน",
        "yes": "ใช่",
        "i am": "ฉันเป็น",
        "i have": "ฉันมี",
        "i want": "ฉันต้องการ",
        "i like": "ฉันชอบ",
        "i love": "ฉันรัก",
        "i need": "ฉันต้องการ",
        "i think": "ฉันคิดว่า",
        "i know": "ฉันรู้",
        "i understand": "ฉันเข้าใจ",
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


def get_phrase(phrase_key: str, gender: str = "neutral") -> str:
    """
    Get the gender-appropriate translation for common phrases.

    Args:
        phrase_key: English phrase (e.g., "hello", "thank you")
        gender: "male", "female", or "neutral"

    Returns:
        Thai phrase with appropriate gender markers
    """
    gender = gender.lower()
    if gender not in GENDER_PHRASES:
        gender = "neutral"

    return GENDER_PHRASES[gender].get(phrase_key.lower(), "")
