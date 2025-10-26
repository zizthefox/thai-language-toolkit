"""Breakdown tab for Thai text analysis."""

import streamlit as st


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
        include_pos = st.checkbox("Include POS tags", value=True)
        include_translation = st.checkbox("Include English meanings", value=True)
        filter_stopwords = st.checkbox("Filter stopwords", value=False)
        romanization_engine = st.selectbox(
            "Romanization system:",
            ["thai2rom", "royin", "icu"],
            help="PyThaiNLP (thai2rom) is the official Thai this romanization system"
        )

    if st.button("🔍 Analyze", type="primary"):
        if input_text:
            # Detect language
            detected_lang = breakdown_engine.detect_language(input_text)

            # If English, translate to Thai first
            if detected_lang == 'english':
                st.info("🔄 Detected English text. Translating to Thai...")
                thai_text = breakdown_engine.translate_to_thai(input_text)
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
                st.write(" | ".join(words))

                # Romanization
                st.markdown("### 📖 Romanization")
                romanized_words = romanizer.romanize_words(words, engine=romanization_engine)
                st.write(" | ".join(romanized_words))

                # Full romanization
                full_romanized = romanizer.romanize(thai_text, engine=romanization_engine)
                st.info(f"Full text: {full_romanized}")

                # Full translation
                if include_translation and "full_translation" in breakdown_result:
                    if breakdown_result["full_translation"]:
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
                            row["POS"] = breakdown_result["pos_tags"][i][1]

                        word_data.append(row)

                if word_data:
                    st.dataframe(word_data, width='stretch')
        else:
            st.warning("Please enter some text to analyze")
