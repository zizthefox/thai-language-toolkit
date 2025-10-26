"""Speak tab for Thai text-to-speech."""

import streamlit as st


def render_speak_tab(tts_engine):
    """Render the speak tab with TTS functionality."""
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

    # Gender-neutral examples (shown for all voices)
    neutral_examples = [
        ("ยินดีที่ได้รู้จัก", "Nice to meet you"),
        ("คุณเป็นอย่างไรบ้าง", "How are you?"),
        ("วันนี้อากาศดีมาก", "The weather is very nice today"),
        ("อาหารอร่อยมาก", "The food is very delicious"),
        ("ขอโทษ", "Excuse me / Sorry"),
        ("ไม่เป็นไร", "No problem / It's okay")
    ]

    # Gender-specific examples
    male_examples = [
        ("สวัสดีครับ", "Hello (male speaker)"),
        ("ขอบคุณมากครับ", "Thank you very much (male)"),
        ("ผมชื่อจอห์น", "My name is John (male)"),
        ("ผมมาจากอเมริกาครับ", "I'm from America (male)"),
        ("กรุณาช่วยผมหน่อยครับ", "Please help me (male)")
    ]

    female_examples = [
        ("สวัสดีค่ะ", "Hello (female speaker)"),
        ("ขอบคุณมากค่ะ", "Thank you very much (female)"),
        ("ดิฉันชื่อแมรี่", "My name is Mary (female)"),
        ("ดิฉันมาจากอเมริกาค่ะ", "I'm from America (female)"),
        ("กรุณาช่วยดิฉันหน่อยค่ะ", "Please help me (female)")
    ]

    # Determine which examples to show based on selected voice
    selected_voice_info = available_voices[selected_voice]
    is_male_voice = selected_voice_info["gender"] == "Male"

    if is_male_voice:
        examples = neutral_examples + male_examples
    else:
        examples = neutral_examples + female_examples

    cols = st.columns(2)
    for i, (thai, english) in enumerate(examples):
        with cols[i % 2]:
            if st.button(f"🔊 {thai}", key=f"example_{i}_{selected_voice}"):
                with st.spinner("Generating speech..."):
                    audio_bytes = tts_engine.speak_text(thai, selected_voice)
                    if audio_bytes:
                        st.audio(audio_bytes, format="audio/mp3")
                        st.caption(f"*{english}*")
