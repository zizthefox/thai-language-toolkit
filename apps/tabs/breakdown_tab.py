"""Breakdown tab for Thai text analysis."""

import sys
from pathlib import Path
import re

# Add both src and root to path for imports
root_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_path / "src"))
sys.path.insert(0, str(root_path))

import streamlit as st
from data import get_pos_label, GENDER_PHRASES, GENDER_PRONOUNS


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


def render_breakdown_tab(breakdown_engine, romanizer):
    """Render the breakdown tab with text analysis functionality."""
    st.header("Thai Text Breakdown")
    st.markdown("Analyze Thai text with word segmentation, POS tagging, and romanization")

    # Input section
    col1, col2 = st.columns([2, 1])

    with col1:
        input_text = st.text_area(
            "Enter Thai or English text:",
            value="สวัสดีครับ ผมชื่อจอห์น",
            height=100,
            help="Enter Thai text to analyze, or English text to translate and analyze"
        )

    with col2:
        st.markdown("### Options")

        # Gender selection for translations
        st.markdown("### 👤 Speaker Gender")
        gender = st.radio(
            "Select your gender:",
            ["Male", "Female", "Neutral"],
            index=0,
            help="Thai language uses different pronouns and polite particles based on speaker gender:\n"
                 "• Male: ผม (phom) = I, ครับ (khrap) = polite particle\n"
                 "• Female: ฉัน (chan) = I, ค่ะ (kha) = polite particle\n"
                 "• Neutral: Generic translations without gender-specific terms"
        )

        st.markdown("### 🔧 Analysis Options")
        include_pos = st.checkbox("Include POS tags", value=True)
        include_translation = st.checkbox("Include English meanings", value=True)
        filter_stopwords = st.checkbox("Filter stopwords", value=False)
        romanization_engine = st.selectbox(
            "Romanization system:",
            ["thai2rom", "royin", "icu"],
            help="PyThaiNLP (thai2rom) is the official Thai romanization system"
        )

    if st.button("🔍 Analyze", type="primary"):
        if input_text:
            with st.spinner("🔄 Analyzing text..."):
                # Detect language
                detected_lang = breakdown_engine.detect_language(input_text)
                original_english = None  # Track if user entered English

                # If English, translate to Thai first
                if detected_lang == 'english':
                    st.info(f"🔄 Detected English text. Translating to Thai ({gender.lower()} speaker)...")
                    original_english = input_text  # Save original English input

                    # Get base translation from Google Translate
                    thai_text = breakdown_engine.translate_to_thai(input_text)

                    # Apply gender-specific adjustments using corpus
                    if thai_text:
                        thai_text = apply_gender_translation(input_text, thai_text, gender)

                    if thai_text:
                        st.success(f"📝 Thai translation: {thai_text}")
                    else:
                        st.error("❌ Could not translate to Thai. Please check your internet connection.")
                        thai_text = None
                elif detected_lang == 'mixed':
                    st.warning("⚠️ Mixed Thai and English detected. Processing as Thai text...")
                    thai_text = input_text
                else:
                    thai_text = input_text

                if thai_text:
                    # Perform breakdown
                    breakdown_result = breakdown_engine.breakdown(
                        thai_text,
                        include_pos=include_pos,
                        filter_stopwords=filter_stopwords,
                        include_translation=include_translation
                    )

                    # Display results
                    st.markdown("---")
                    st.subheader("📊 Analysis Results")

                    # Basic info
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Word Count", breakdown_result["word_count"])
                    with col2:
                        st.metric("Character Count", len(thai_text))
                    with col3:
                        if filter_stopwords and breakdown_result["filtered_words"]:
                            st.metric("Filtered Words", len(breakdown_result["filtered_words"]))

                    # Word segmentation
                    st.markdown("### 🔤 Word Segmentation")
                    words = breakdown_result["words"]
                    # Filter out punctuation for display to avoid confusion
                    words_no_punct = [w for w in words if w.strip() and not all(c in '.,!?;:"""()[]{}' for c in w)]
                    st.write(" | ".join(words_no_punct))

                    # Romanization
                    st.markdown("### 📖 Romanization")
                    romanized_words = romanizer.romanize_words(words, engine=romanization_engine)
                    # Filter out punctuation romanization
                    romanized_no_punct = [romanizer.romanize_words([w], engine=romanization_engine)[0]
                                          for w in words if w.strip() and not all(c in '.,!?;:"""()[]{}' for c in w)]
                    st.write(" | ".join(romanized_no_punct))

                    # Full romanization
                    full_romanized = romanizer.romanize(thai_text, engine=romanization_engine)
                    st.info(f"Full text: {full_romanized}")

                    # Full translation
                    if include_translation:
                        # If user entered English, show their original input instead of back-translating
                        if original_english:
                            st.success(f"📖 English: {original_english}")
                        elif "full_translation" in breakdown_result and breakdown_result["full_translation"]:
                            st.success(f"📖 English: {breakdown_result['full_translation']}")

                    # Word analysis table
                    st.markdown("### 📚 Word Analysis")
                    word_data = []
                    for i, word in enumerate(words):
                        if word.strip():  # Skip empty words
                            romanized = romanizer.romanize(word, engine=romanization_engine)
                            row = {
                                "Thai": word,
                                "Romanized": romanized,
                            }

                            # Add translation if available
                            if include_translation and "translations" in breakdown_result:
                                translation = breakdown_result["translations"][i]
                                row["English"] = translation if translation else "-"

                            # Add POS if available
                            if include_pos and "pos_tags" in breakdown_result:
                                pos_tag = breakdown_result["pos_tags"][i][1]
                                row["Part of Speech"] = get_pos_label(pos_tag)

                            word_data.append(row)

                    if word_data:
                        st.dataframe(word_data, width='stretch')
        else:
            st.warning("Please enter some text to analyze")
