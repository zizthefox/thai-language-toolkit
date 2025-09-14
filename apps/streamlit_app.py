"""Streamlit app for Thai Language Toolkit."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import streamlit as st
from tlt.nlp import ThaiBreakdown, ThaiRomanizer


st.set_page_config(
    page_title="Thai Language Toolkit",
    page_icon="🇹🇭",
    layout="wide"
)

st.title("🇹🇭 Thai Language Toolkit")
st.markdown("A lightweight toolkit for Thai learners")

# Initialize components
@st.cache_resource
def init_components():
    return ThaiBreakdown(), ThaiRomanizer()

breakdown_engine, romanizer = init_components()

# Tabs for different features
tab1, tab2, tab3, tab4 = st.tabs(["📝 Breakdown", "🔊 Speak", "📚 Flashcards", "🎮 Tone Game"])

with tab1:
    st.header("Thai Text Breakdown")
    st.markdown("Analyze Thai text with word segmentation, POS tagging, and romanization")

    # Input section
    col1, col2 = st.columns([2, 1])

    with col1:
        thai_text = st.text_area(
            "Enter Thai text:",
            value="สวัสดีครับ ผมชื่อจอห์น",
            height=100,
            help="Enter Thai text to analyze"
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

            # Compare romanization systems
            with st.expander("🔄 Compare Romanization Systems"):
                comparison = romanizer.compare_engines(thai_text)
                for engine, result in comparison.items():
                    if engine != "original":
                        st.write(f"**{engine.upper()}:** {result}")
        else:
            st.warning("Please enter some Thai text to analyze")

with tab2:
    st.header("🔊 Text-to-Speech")
    st.info("Coming soon! This feature will allow you to hear Thai pronunciation.")

with tab3:
    st.header("📚 Flashcards")
    st.info("Coming soon! Create and review flashcards for Thai vocabulary.")

with tab4:
    st.header("🎮 Tone Game")
    st.info("Coming soon! Practice Thai tones with an interactive game.")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center'>
        <small>Thai Language Toolkit v0.1.0 | Made for Thai learners 📚</small>
    </div>
    """,
    unsafe_allow_html=True
)