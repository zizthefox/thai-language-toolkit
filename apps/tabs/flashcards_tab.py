"""Flashcards tab for vocabulary review."""

import sys
from pathlib import Path

# Add both src and root to path for imports
root_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_path / "src"))
sys.path.insert(0, str(root_path))

import streamlit as st
from study import Flashcard, FlashcardDeck

# Path for saving flashcards
FLASHCARD_FILE = root_path / "data" / "flashcards.json"


def render_flashcards_tab():
    """Render the flashcards tab."""
    st.header("📚 Flashcards")
    st.markdown(":yellow[Review Thai vocabulary with interactive flashcards - flip, grade, and track your progress!]")

    # Initialize session state for deck
    if "flashcard_deck" not in st.session_state:
        st.session_state.flashcard_deck = FlashcardDeck.load_from_file(FLASHCARD_FILE)

    if "current_card_index" not in st.session_state:
        st.session_state.current_card_index = 0

    if "show_answer" not in st.session_state:
        st.session_state.show_answer = False

    deck = st.session_state.flashcard_deck

    # Create tabs for different modes
    tab1, tab2, tab3 = st.tabs(["📖 Study", "➕ Add Cards", "📊 Manage"])

    # ============ STUDY TAB ============
    with tab1:
        if not deck.cards:
            st.info("No flashcards yet! Add some cards in the 'Add Cards' tab.")
        else:
            # Filter options
            col1, col2 = st.columns([3, 1])
            with col1:
                difficulty_filter = st.selectbox(
                    "Filter by difficulty:",
                    ["All", "Learning", "Known", "Difficult"],
                    key="study_filter"
                )

            # Get filtered cards
            if difficulty_filter == "All":
                study_cards = deck.cards
            else:
                study_cards = deck.get_cards_by_difficulty(difficulty_filter.lower())

            if not study_cards:
                st.warning(f"No cards with difficulty: {difficulty_filter}")
            else:
                # Card navigation
                if st.session_state.current_card_index >= len(study_cards):
                    st.session_state.current_card_index = 0

                current_card = study_cards[st.session_state.current_card_index]

                # Progress indicator
                st.progress((st.session_state.current_card_index + 1) / len(study_cards))
                st.caption(f"Card {st.session_state.current_card_index + 1} of {len(study_cards)}")

                # Flashcard display
                st.markdown("---")

                # Front of card (Thai)
                st.markdown("### 🇹🇭 Thai")
                st.markdown(f"<h1 style='text-align: center; font-size: 3em;'>{current_card.thai}</h1>",
                           unsafe_allow_html=True)

                # Show answer button
                if not st.session_state.show_answer:
                    if st.button("🔄 Show Answer", type="primary", use_container_width=True):
                        st.session_state.show_answer = True
                        st.rerun()
                else:
                    # Back of card (English + Romanization)
                    st.markdown("---")
                    st.markdown("### 🔤 Romanization")
                    st.markdown(f"<h2 style='text-align: center; color: #888;'>{current_card.romanization}</h2>",
                               unsafe_allow_html=True)

                    st.markdown("### 🇬🇧 English")
                    st.markdown(f"<h2 style='text-align: center;'>{current_card.english}</h2>",
                               unsafe_allow_html=True)

                    if current_card.pos_tag:
                        st.caption(f"Part of Speech: {current_card.pos_tag}")

                    if current_card.example:
                        st.info(f"Example: {current_card.example}")

                    # Self-grading buttons
                    st.markdown("---")
                    st.markdown("### How well did you know this?")
                    col1, col2, col3, col4 = st.columns(4)

                    with col1:
                        if st.button("❌ Again", use_container_width=True):
                            deck.update_card_difficulty(
                                deck.cards.index(current_card), "difficult"
                            )
                            st.session_state.show_answer = False
                            st.session_state.current_card_index = (
                                st.session_state.current_card_index + 1
                            ) % len(study_cards)
                            deck.save_to_file(FLASHCARD_FILE)
                            st.rerun()

                    with col2:
                        if st.button("😕 Hard", use_container_width=True):
                            deck.update_card_difficulty(
                                deck.cards.index(current_card), "learning"
                            )
                            st.session_state.show_answer = False
                            st.session_state.current_card_index = (
                                st.session_state.current_card_index + 1
                            ) % len(study_cards)
                            deck.save_to_file(FLASHCARD_FILE)
                            st.rerun()

                    with col3:
                        if st.button("😊 Good", use_container_width=True):
                            deck.update_card_difficulty(
                                deck.cards.index(current_card), "learning"
                            )
                            st.session_state.show_answer = False
                            st.session_state.current_card_index = (
                                st.session_state.current_card_index + 1
                            ) % len(study_cards)
                            deck.save_to_file(FLASHCARD_FILE)
                            st.rerun()

                    with col4:
                        if st.button("✅ Easy", use_container_width=True):
                            deck.update_card_difficulty(
                                deck.cards.index(current_card), "known"
                            )
                            st.session_state.show_answer = False
                            st.session_state.current_card_index = (
                                st.session_state.current_card_index + 1
                            ) % len(study_cards)
                            deck.save_to_file(FLASHCARD_FILE)
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
        learning = len(deck.get_cards_by_difficulty("learning"))
        known = len(deck.get_cards_by_difficulty("known"))
        difficult = len(deck.get_cards_by_difficulty("difficult"))

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Cards", total)
        with col2:
            st.metric("Learning", learning)
        with col3:
            st.metric("Known", known)
        with col4:
            st.metric("Difficult", difficult)

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
                    st.write(f"**Difficulty:** {card.difficulty}")
                    st.write(f"**Times Reviewed:** {card.times_reviewed}")

                    if st.button(f"🗑️ Delete", key=f"delete_{i}"):
                        deck.remove_card(i)
                        deck.save_to_file(FLASHCARD_FILE)
                        st.rerun()
        else:
            st.info("No cards in deck")
