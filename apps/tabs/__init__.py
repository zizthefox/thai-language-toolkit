"""Tab modules for Thai Language Toolkit Streamlit app."""

from .breakdown_tab import render_breakdown_tab
from .speak_tab import render_speak_tab
from .flashcards_tab import render_flashcards_tab
from .tone_game_tab import render_tone_game_tab

__all__ = [
    "render_breakdown_tab",
    "render_speak_tab",
    "render_flashcards_tab",
    "render_tone_game_tab",
]
