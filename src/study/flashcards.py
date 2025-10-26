"""Flashcard system for vocabulary review."""

import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime


class Flashcard:
    """Represents a single flashcard."""

    def __init__(
        self,
        thai: str,
        english: str,
        romanization: str = "",
        pos_tag: str = "",
        example: str = "",
        difficulty: str = "learning",  # "learning", "known", "difficult"
        times_reviewed: int = 0,
        last_reviewed: Optional[str] = None,
    ):
        self.thai = thai
        self.english = english
        self.romanization = romanization
        self.pos_tag = pos_tag
        self.example = example
        self.difficulty = difficulty
        self.times_reviewed = times_reviewed
        self.last_reviewed = last_reviewed

    def to_dict(self) -> Dict:
        """Convert flashcard to dictionary."""
        return {
            "thai": self.thai,
            "english": self.english,
            "romanization": self.romanization,
            "pos_tag": self.pos_tag,
            "example": self.example,
            "difficulty": self.difficulty,
            "times_reviewed": self.times_reviewed,
            "last_reviewed": self.last_reviewed,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Flashcard":
        """Create flashcard from dictionary."""
        return cls(**data)


class FlashcardDeck:
    """Manages a collection of flashcards."""

    def __init__(self, name: str = "My Deck"):
        self.name = name
        self.cards: List[Flashcard] = []

    def add_card(self, card: Flashcard) -> bool:
        """Add a card to the deck. Returns False if duplicate."""
        # Check for duplicates
        for existing_card in self.cards:
            if existing_card.thai == card.thai:
                return False
        self.cards.append(card)
        return True

    def remove_card(self, index: int):
        """Remove a card by index."""
        if 0 <= index < len(self.cards):
            self.cards.pop(index)

    def update_card_difficulty(self, index: int, difficulty: str):
        """Update card difficulty after review."""
        if 0 <= index < len(self.cards):
            self.cards[index].difficulty = difficulty
            self.cards[index].times_reviewed += 1
            self.cards[index].last_reviewed = datetime.now().isoformat()

    def get_cards_by_difficulty(self, difficulty: str) -> List[Flashcard]:
        """Get all cards with a specific difficulty."""
        return [card for card in self.cards if card.difficulty == difficulty]

    def get_cards_by_pos(self, pos_tag: str) -> List[Flashcard]:
        """Get all cards with a specific POS tag."""
        return [card for card in self.cards if card.pos_tag == pos_tag]

    def to_dict(self) -> Dict:
        """Convert deck to dictionary."""
        return {
            "name": self.name,
            "cards": [card.to_dict() for card in self.cards],
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "FlashcardDeck":
        """Create deck from dictionary."""
        deck = cls(name=data.get("name", "My Deck"))
        deck.cards = [Flashcard.from_dict(card_data) for card_data in data.get("cards", [])]
        return deck

    def save_to_file(self, file_path: Path):
        """Save deck to JSON file."""
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)

    @classmethod
    def load_from_file(cls, file_path: Path) -> "FlashcardDeck":
        """Load deck from JSON file."""
        if not file_path.exists():
            return cls()

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return cls.from_dict(data)

    def export_to_csv(self) -> str:
        """Export deck to CSV format."""
        lines = ["Thai,Romanization,English,Part of Speech,Example,Difficulty,Times Reviewed"]
        for card in self.cards:
            lines.append(
                f'"{card.thai}","{card.romanization}","{card.english}",'
                f'"{card.pos_tag}","{card.example}","{card.difficulty}",{card.times_reviewed}'
            )
        return "\n".join(lines)

    def import_from_csv(self, csv_content: str) -> int:
        """Import cards from CSV. Returns number of cards imported."""
        lines = csv_content.strip().split("\n")
        if not lines:
            return 0

        # Skip header
        imported = 0
        for line in lines[1:]:
            # Simple CSV parsing (handles quoted fields)
            parts = []
            current = ""
            in_quotes = False

            for char in line:
                if char == '"':
                    in_quotes = not in_quotes
                elif char == ',' and not in_quotes:
                    parts.append(current.strip())
                    current = ""
                else:
                    current += char
            parts.append(current.strip())

            if len(parts) >= 3:
                card = Flashcard(
                    thai=parts[0],
                    romanization=parts[1] if len(parts) > 1 else "",
                    english=parts[2] if len(parts) > 2 else "",
                    pos_tag=parts[3] if len(parts) > 3 else "",
                    example=parts[4] if len(parts) > 4 else "",
                    difficulty=parts[5] if len(parts) > 5 else "learning",
                )
                if self.add_card(card):
                    imported += 1

        return imported
