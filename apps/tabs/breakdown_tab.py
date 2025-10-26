"""Breakdown tab for Thai text analysis."""

import sys
from pathlib import Path

# Add both src and root to path for imports
root_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_path / "src"))
sys.path.insert(0, str(root_path))

import streamlit as st
from data import get_pos_label
from nlp import apply_gender_translation
from study import Flashcard, FlashcardDeck

# Path for saving flashcards
FLASHCARD_FILE = root_path / "data" / "flashcards.json"


def render_breakdown_tab(breakdown_engine, romanizer):
    """Render the breakdown tab with text analysis functionality."""
    st.header("Thai Text Breakdown")
    st.markdown("Break down Thai text into words, see pronunciations, understand grammar parts, and translate meanings - perfect for learning Thai!")

    # Input section
    col1, col2 = st.columns([2, 1])

    with col1:
        input_text = st.text_area(
            "Enter :orange[**English**] text to translate and analyze, or just :orange[**Thai**] text to analyze: ",
            value="สวัสดีครับ ผมชื่อจอห์น",
            height=100,
        )

    with col2:
        # Gender selection for translations
        gender = st.radio(
            "👤 **Select your gender:**",
            ["Male", "Female", "Neutral"],
            index=0,
            help="Thai language uses different pronouns and polite particles based on speaker gender:\n"
                 "• Male: ผม (phom) = I, ครับ (khrap) = polite particle\n"
                 "• Female: ฉัน (chan) = I, ค่ะ (kha) = polite particle\n"
                 "• Neutral: Generic translations without gender-specific terms"
        )

        # Set defaults (no UI needed for learners)
        include_pos = True
        include_translation = True
        filter_stopwords = False
        romanization_engine = "thai2rom"

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

                        # Add "Save to Flashcards" button
                        st.markdown("---")
                        st.markdown("### 💾 Save to Flashcards")

                        # Allow user to select which words to save
                        st.caption("Select words to add to your flashcard deck:")

                        # Load existing deck
                        flashcard_deck = FlashcardDeck.load_from_file(FLASHCARD_FILE)

                        # Create checkboxes for each word
                        selected_words = []
                        cols = st.columns(3)
                        for idx, row in enumerate(word_data):
                            # Skip punctuation
                            if row["Thai"].strip() and not all(c in '.,!?;:"""()[]{}' for c in row["Thai"]):
                                with cols[idx % 3]:
                                    if st.checkbox(row["Thai"], key=f"save_word_{idx}"):
                                        selected_words.append(row)

                        if selected_words:
                            if st.button("💾 Save Selected Words to Flashcards", type="primary"):
                                added_count = 0
                                for word_row in selected_words:
                                    card = Flashcard(
                                        thai=word_row["Thai"],
                                        romanization=word_row["Romanized"],
                                        english=word_row.get("English", ""),
                                        pos_tag=word_row.get("Part of Speech", ""),
                                        example=thai_text if thai_text else "",
                                    )

                                    if flashcard_deck.add_card(card):
                                        added_count += 1

                                if added_count > 0:
                                    flashcard_deck.save_to_file(FLASHCARD_FILE)
                                    st.success(f"✅ Added {added_count} word(s) to flashcards!")
                                else:
                                    st.info("All selected words already exist in your flashcard deck.")

        else:
            st.warning("Please enter some text to analyze")
