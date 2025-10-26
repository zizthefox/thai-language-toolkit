"""Streamlit app for Thai Language Toolkit."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import streamlit as st
from tlt.nlp import ThaiBreakdown, ThaiRomanizer
from tlt.speech import ThaiTTS

from tabs import (
    render_breakdown_tab,
    render_speak_tab,
    render_flashcards_tab,
    render_tone_game_tab,
)


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
    render_breakdown_tab(breakdown_engine, romanizer)

with tab2:
    render_speak_tab(tts_engine)

with tab3:
    render_flashcards_tab()

with tab4:
    render_tone_game_tab()

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