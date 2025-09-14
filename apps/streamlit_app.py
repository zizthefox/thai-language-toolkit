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
        filter_stopwords = st.checkbox("Filter stopwords", value=False)
        romanization_engine = st.selectbox(
            "Romanization system:",
            ["royin", "thai2rom", "icu"],
            help="RTGS (royin) is the official Thai romanization system"
        )

    if st.button("🔍 Analyze", type="primary", use_container_width=True):
        if thai_text:
            # Perform breakdown
            breakdown_result = breakdown_engine.breakdown(
                thai_text,
                include_pos=include_pos,
                filter_stopwords=filter_stopwords
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

            # POS Tags
            if include_pos and "pos_tags" in breakdown_result:
                st.markdown("### 🏷️ Part-of-Speech Tags")
                pos_data = []
                for word, pos in breakdown_result["pos_tags"]:
                    romanized = romanizer.romanize(word, engine=romanization_engine)
                    pos_data.append({
                        "Thai": word,
                        "Romanized": romanized,
                        "POS": pos
                    })
                st.dataframe(pos_data, use_container_width=True)

            # Detailed word breakdown
            with st.expander("📋 Detailed Word Breakdown"):
                for i, word in enumerate(words):
                    if word.strip():  # Skip empty words
                        col1, col2, col3, col4 = st.columns(4)
                        with col1:
                            st.write(f"**{word}**")
                        with col2:
                            st.write(romanized_words[i])
                        with col3:
                            if include_pos and "pos_tags" in breakdown_result:
                                st.write(breakdown_result["pos_tags"][i][1])
                        with col4:
                            word_info = breakdown_engine.get_word_info(word)
                            if word_info["is_stopword"]:
                                st.write("⚪ Stopword")

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