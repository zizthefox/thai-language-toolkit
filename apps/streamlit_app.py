"""Streamlit app for Thai Language Toolkit."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import streamlit as st
from tlt.nlp import ThaiBreakdown, ThaiRomanizer
from tlt.speech import ThaiTTS


st.set_page_config(
    page_title="Thai Language Toolkit",
    page_icon="🇹🇭",
    layout="wide"
)

st.title("🛺 Thai Language Toolkit")
st.markdown("A lightweight toolkit for Thai learners")

# Initialize components
@st.cache_resource
def init_components():
    return ThaiBreakdown(), ThaiRomanizer(), ThaiTTS()

breakdown_engine, romanizer, tts_engine = init_components()

# Tabs for different features
tab1, tab2, tab3, tab4 = st.tabs(["📝 Breakdown", "🔊 Speak", "📚 Flashcards", "🎮 Tone Game"])

with tab1:
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

                # Compare romanization systems
                with st.expander("🔄 Compare Romanization Systems"):
                    comparison = romanizer.compare_engines(thai_text)
                    for engine, result in comparison.items():
                        if engine != "original":
                            st.write(f"**{engine.upper()}:** {result}")
        else:
            st.warning("Please enter some text to analyze")

with tab2:
    st.header("🔊 Text-to-Speech")
    st.markdown("Convert Thai text to speech with high-quality neural voices")

    # Input section for TTS
    col1, col2 = st.columns([2, 1])

    with col1:
        tts_text = st.text_area(
            "Enter Thai text to speak:",
            value="สวัสดีครับ ยินดีที่ได้รู้จัก",
            height=100,
            help="Enter Thai text to convert to speech"
        )

    with col2:
        st.markdown("### Voice Options")

        # Get available voices
        available_voices = tts_engine.get_available_voices()
        voice_options = {}
        for voice_id, details in available_voices.items():
            voice_options[f"{details['name']} ({details['gender']})"] = voice_id

        selected_voice_name = st.selectbox(
            "Choose voice:",
            list(voice_options.keys()),
            help="Select Thai voice for speech synthesis"
        )
        selected_voice = voice_options[selected_voice_name]

        # Speech speed (placeholder for future)
        st.markdown("### Settings")
        st.info("🔧 Speech rate and pitch controls coming soon!")

    # Generate speech
    if st.button("🔊 Generate Speech", type="primary"):
        if tts_text.strip():
            with st.spinner("Generating speech..."):
                audio_bytes = tts_engine.speak_text(tts_text, selected_voice)

                if audio_bytes:
                    st.success("✅ Speech generated successfully!")

                    # Play audio
                    st.audio(audio_bytes, format="audio/mp3", start_time=0)

                    # Show text being spoken
                    st.markdown("**Speaking:**")
                    st.markdown(f"*{tts_text}*")

                    # Download option
                    st.download_button(
                        label="📥 Download Audio",
                        data=audio_bytes,
                        file_name=f"thai_speech_{hash(tts_text) % 10000}.mp3",
                        mime="audio/mpeg"
                    )
                else:
                    st.error("❌ Failed to generate speech. Please check your internet connection.")
        else:
            st.warning("Please enter some Thai text to convert to speech.")

    # Example phrases
    st.markdown("---")
    st.markdown("### 🎯 Example Phrases")
    examples = [
        ("สวัสดีครับ", "Hello (male speaker)"),
        ("สวัสดีค่ะ", "Hello (female speaker)"),
        ("ขอบคุณมากครับ", "Thank you very much (male)"),
        ("ยินดีที่ได้รู้จัก", "Nice to meet you"),
        ("คุณเป็นอย่างไรบ้าง", "How are you?"),
        ("ผมชื่อจอห์น", "My name is John (male)"),
        ("ดิฉันชื่อแมรี่", "My name is Mary (female)"),
        ("วันนี้อากาศดีมาก", "The weather is very nice today")
    ]

    cols = st.columns(2)
    for i, (thai, english) in enumerate(examples):
        with cols[i % 2]:
            if st.button(f"🔊 {thai}", key=f"example_{i}"):
                with st.spinner("Generating speech..."):
                    audio_bytes = tts_engine.speak_text(thai, selected_voice)
                    if audio_bytes:
                        st.audio(audio_bytes, format="audio/mp3")
                        st.caption(f"*{english}*")

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