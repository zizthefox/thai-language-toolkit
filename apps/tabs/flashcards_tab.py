"""Flashcards tab for vocabulary review."""

import sys
from pathlib import Path

# Add both src and root to path for imports
root_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_path / "src"))
sys.path.insert(0, str(root_path))

import streamlit as st
import json
import random
from study import Flashcard, FlashcardDeck

# Path for saving flashcards
FLASHCARD_FILE = root_path / "data" / "flashcards.json"
EXAMPLE_FLASHCARDS_FILE = root_path / "data" / "example_flashcards.json"


def render_flashcards_tab():
    """Render the flashcards tab."""
    st.header("📚 Flashcards")
    st.markdown("Review Thai vocabulary with interactive flashcards")

    # Initialize session state for deck
    if "flashcard_deck" not in st.session_state:
        st.session_state.flashcard_deck = FlashcardDeck.load_from_file(FLASHCARD_FILE)

    if "current_card_index" not in st.session_state:
        st.session_state.current_card_index = 0

    if "show_answer" not in st.session_state:
        st.session_state.show_answer = False

    if "shuffled_cards" not in st.session_state:
        st.session_state.shuffled_cards = None

    deck = st.session_state.flashcard_deck

    # Create tabs for different modes
    tab1, tab2, tab3 = st.tabs(["📖 Study", "➕ Add Cards", "📊 Manage"])

    # ============ STUDY TAB ============
    with tab1:
        # Deck selection
        st.markdown("### 🎴 Select Deck to Study")

        # Initialize deck choice in session state
        if "deck_choice" not in st.session_state:
            st.session_state.deck_choice = None

        col1, col2 = st.columns(2)

        with col1:
            if st.button("💯 Thai 100 Common Words", use_container_width=True, type="secondary"):
                st.session_state.deck_choice = "Thai 100 Common Words"
                st.session_state.shuffled_cards = None  # Reset shuffle
                st.session_state.current_card_index = 0
                st.rerun()

        with col2:
            if st.button("💼 My Deck", use_container_width=True, type="secondary"):
                st.session_state.deck_choice = "My Deck"
                st.session_state.shuffled_cards = None  # Reset shuffle
                st.session_state.current_card_index = 0
                st.rerun()

        # Show which deck is selected
        if st.session_state.deck_choice:
            st.info(f"Currently studying: **{st.session_state.deck_choice}**")

        # Load appropriate deck based on selection
        if st.session_state.deck_choice == "Thai 100 Common Words":
            # Load example cards
            with open(EXAMPLE_FLASHCARDS_FILE, 'r', encoding='utf-8') as f:
                example_data = json.load(f)

            study_cards = [Flashcard(**card_data) for card_data in example_data['cards']]
        elif st.session_state.deck_choice == "My Deck":
            # Use user's personal deck
            study_cards = deck.cards.copy()
        else:
            # No deck selected yet
            study_cards = []

        if not study_cards and st.session_state.deck_choice:
            if st.session_state.deck_choice == "My Deck":
                st.info("No cards in your deck yet! Add some cards in the 'Add Cards' tab or study the 'Thai 100 Common Words' deck.")
            else:
                st.warning("Example deck not available")
        elif study_cards:
                # Shuffle cards if not already shuffled or if deck changed
                if (st.session_state.shuffled_cards is None or
                    len(st.session_state.shuffled_cards) != len(study_cards)):
                    st.session_state.shuffled_cards = study_cards.copy()
                    random.shuffle(st.session_state.shuffled_cards)
                    st.session_state.current_card_index = 0

                study_cards = st.session_state.shuffled_cards

                # Card navigation
                if st.session_state.current_card_index >= len(study_cards):
                    st.session_state.current_card_index = 0

                current_card = study_cards[st.session_state.current_card_index]

                # Progress indicator
                st.progress((st.session_state.current_card_index + 1) / len(study_cards))
                st.caption(f"Card {st.session_state.current_card_index + 1} of {len(study_cards)}")

                # Flashcard display
                st.markdown("---")

                # Front of card (Thai + Romanization)
                st.markdown(f"<h1 style='text-align: center; font-size: 3.5em; margin-bottom: 0;'>{current_card.thai}</h1>",
                           unsafe_allow_html=True)
                st.markdown(f"<p style='text-align: center; font-size: 1.2em; color: #888; margin-top: 5px;'>({current_card.romanization})</p>",
                           unsafe_allow_html=True)

                # Show answer button
                if not st.session_state.show_answer:
                    if st.button("🔄 Show Answer", type="primary", use_container_width=True):
                        st.session_state.show_answer = True
                        st.rerun()
                else:
                    # Back of card (English)
                    st.markdown("---")
                    st.markdown(f"<h2 style='text-align: center; font-size: 2em;'>{current_card.english}</h2>",
                               unsafe_allow_html=True)

                    if current_card.pos_tag:
                        st.caption(f"Part of Speech: {current_card.pos_tag}")

                    if current_card.example:
                        st.info(f"Example: {current_card.example}")

                    # Next card button
                    st.markdown("---")
                    if st.button("➡️ Next Card", type="primary", use_container_width=True):
                        st.session_state.show_answer = False
                        st.session_state.current_card_index = (
                            st.session_state.current_card_index + 1
                        ) % len(study_cards)
                        st.rerun()

    # ============ ADD CARDS TAB ============
    with tab2:
        st.markdown("### ➕ Create New Flashcard")

        with st.form("add_card_form"):
            thai = st.text_input("Thai word/phrase *", help="Required")
            romanization = st.text_input("Romanization")
            english = st.text_input("English meaning *", help="Required")
            pos_tag = st.text_input("Part of Speech", placeholder="e.g., Noun, Verb, Adjective")
            example = st.text_area("Example sentence", height=80)

            submitted = st.form_submit_button("💾 Add Card", type="primary")

            if submitted:
                if not thai or not english:
                    st.error("Thai and English fields are required!")
                else:
                    card = Flashcard(
                        thai=thai,
                        english=english,
                        romanization=romanization,
                        pos_tag=pos_tag,
                        example=example,
                    )

                    if deck.add_card(card):
                        deck.save_to_file(FLASHCARD_FILE)
                        st.success(f"✅ Added: {thai} → {english}")
                        st.rerun()
                    else:
                        st.warning(f"Card '{thai}' already exists in the deck!")

        # CSV Import
        st.markdown("---")
        st.markdown("### 📥 Import from CSV")
        st.caption("CSV format: Thai,Romanization,English,Part of Speech,Example,Difficulty,Times Reviewed")

        uploaded_file = st.file_uploader("Upload CSV file", type=["csv"])
        if uploaded_file:
            csv_content = uploaded_file.read().decode("utf-8")
            imported = deck.import_from_csv(csv_content)
            if imported > 0:
                deck.save_to_file(FLASHCARD_FILE)
                st.success(f"✅ Imported {imported} cards!")
                st.rerun()
            else:
                st.error("No cards were imported. Check your CSV format.")

    # ============ MANAGE TAB ============
    with tab3:
        st.markdown("### 📊 Deck Statistics")

        total = len(deck.cards)
        st.metric("Total Cards", total)

        st.markdown("---")
        st.markdown("### 📥 Export Deck")

        if deck.cards:
            csv_data = deck.export_to_csv()
            st.download_button(
                label="📄 Download as CSV",
                data=csv_data,
                file_name="thai_flashcards.csv",
                mime="text/csv",
            )
        else:
            st.info("No cards to export")

        # View all cards
        st.markdown("---")
        st.markdown("### 📋 All Cards")

        if deck.cards:
            for i, card in enumerate(deck.cards):
                with st.expander(f"{card.thai} → {card.english}"):
                    st.write(f"**Romanization:** {card.romanization}")
                    st.write(f"**English:** {card.english}")
                    if card.pos_tag:
                        st.write(f"**Part of Speech:** {card.pos_tag}")
                    if card.example:
                        st.write(f"**Example:** {card.example}")

                    if st.button(f"🗑️ Delete", key=f"delete_{i}"):
                        deck.remove_card(i)
                        deck.save_to_file(FLASHCARD_FILE)
                        st.rerun()
        else:
            st.info("No cards in deck")
