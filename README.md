# Thai Language Toolkit

A lightweight toolkit for Thai learners: **sentence breakdown**, **romanization**, **pronunciation (TTS)**, **flashcards**, and a simple **tone game**.

---

## ✨ Modules
- **Breakdown**: word segmentation, POS, romanization (RTGS), optional English gloss.
- **Speak**: text-to-speech for sentences/words (gTTS or Edge TTS).
- **Flashcards**: CSV ↔ review mode, spaced-repetition friendly exports.
- **Tone Game**: listen → pick the correct tone/word; or see a word → hear 5 tones.
- **CLI & UI**: use from terminal or Streamlit web app.

---

## 🧩 Project Structure
```bash
thai-language-toolkit/
├─ src/
│  └─ tlt/
│     ├─ __init__.py               # stable public API re-exports
│     ├─ nlp/                      # text understanding
│     │  ├─ __init__.py
│     │  ├─ breakdown.py           # segmentation, POS, gloss
│     │  └─ romanize.py            # RTGS / (later IPA)
│     ├─ speech/                   # audio generation + playback utils
│     │  ├─ __init__.py
│     │  ├─ gtts_engine.py
│     │  ├─ edge_engine.py
│     │  └─ speak.py               # unified speak(text, engine=..)
│     ├─ study/                    # learning tools & UX
│     │  ├─ __init__.py
│     │  ├─ flashcards.py
│     │  └─ tone_game.py
│     └─ config.py                 # central config & feature flags
├─ apps/
│  └─ streamlit_app.py               # add “Speak” + “Study” tabs
├─ pyproject.toml
├─ requirements.txt
└─ README.md
```

---


