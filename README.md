# Thai Language Toolkit

A lightweight toolkit for Thai learners: **sentence breakdown**, **romanization**, **pronunciation (TTS)**, **flashcards**, and a simple **tone game**.

---

## 🚀 Quick Start

```bash
# Using uv (recommended)
uv run streamlit run apps/streamlit_app.py

# Or with pip
pip install -e .
streamlit run apps/streamlit_app.py
```

The app will open in your browser at `http://localhost:8501`

---

## ✨ Features

### 📝 Breakdown Tab
- **Word segmentation**: Split Thai text into individual words
- **POS tagging**: Identify parts of speech (nouns, verbs, etc.) with human-readable labels
- **Romanization**: Convert Thai to Roman script using PyThaiNLP (thai2rom)
- **Translation**: Get English meanings for words and sentences
- **Language detection**: Auto-detect and translate English to Thai
- **Gender-specific pronouns**: Select speaker gender for accurate Thai pronoun usage (ผม/ฉัน, ครับ/ค่ะ)

### 🔊 Speak Tab
- **Text-to-speech**: High-quality Thai neural voices (male/female)
- **Example phrases**: Pre-loaded common phrases with translations
- **Audio download**: Save generated speech as MP3

### 📚 Flashcards
- **Interactive flip-cards**: Thai → show answer → Romanization + English
- **Self-grading system**: Again / Hard / Good / Easy buttons to track progress
- **Manual card creation**: Add Thai words with romanization, English, POS tags, examples
- **CSV import/export**: Import vocabulary lists or export for Anki/other SRS apps
- **Difficulty filtering**: Study by Learning / Known / Difficult categories
- **Progress tracking**: View stats and review history
- **Coming soon**: Auto-save words from Breakdown Tab analysis

### 🎮 Tone Game (Coming Soon)
- Listen and pick the correct tone/word
- Practice Thai tones interactively

---

## 🧩 Project Structure
```bash
thai-language-toolkit/
├─ src/
│  ├─ nlp/                         # NLP processing
│  │  ├─ breakdown.py              # word segmentation, POS tagging
│  │  ├─ romanize.py               # romanization engines
│  │  └─ gender_translation.py     # gender-specific pronoun adjustments
│  ├─ speech/                      # text-to-speech
│  │  ├─ gtts_engine.py            # Google TTS
│  │  └─ edge_engine.py            # Edge TTS (neural voices)
│  └─ study/                       # learning tools (flashcards, games)
├─ data/                           # dictionaries & mappings
│  ├─ thai_dict.py                 # Thai-English dictionary
│  ├─ pos_labels.py                # POS tag labels
│  ├─ gender_pronouns.py           # gender pronoun corpus
│  └─ name_transliteration.py     # name transliteration
├─ apps/
│  ├─ streamlit_app.py             # main Streamlit app
│  └─ tabs/                        # modular tab components
│     ├─ breakdown_tab.py
│     ├─ speak_tab.py
│     ├─ flashcards_tab.py
│     └─ tone_game_tab.py
├─ pyproject.toml
└─ requirements.txt
```

---

## 🙏 Acknowledgments

This toolkit is built on excellent open-source projects:

- **[PyThaiNLP](https://github.com/PyThaiNLP/pythainlp)** - Thai NLP library for word segmentation, POS tagging, and romanization
- **[Edge TTS](https://github.com/rany2/edge-tts)** - High-quality neural text-to-speech voices
- **[Streamlit](https://streamlit.io/)** - Web app framework
- **[googletrans](https://github.com/ssut/py-googletrans)** - Google Translate for bidirectional Thai ↔ English translation
- **[deep-translator](https://github.com/nidhaloff/deep-translator)** - MyMemory translator as fallback

Special thanks to the PyThaiNLP team for their comprehensive Thai language processing tools that power the core functionality of this toolkit.

---

## 📚 Citations

If you use this toolkit in your research or project, please cite PyThaiNLP:

> Phatthiyaphaibun et al. "PyThaiNLP: Thai Natural Language Processing in Python". Zenodo, 2 June 2024.

BibTeX:
```bibtex
@software{pythainlp,
    title = "{P}y{T}hai{NLP}: {T}hai Natural Language Processing in {P}ython",
    author = "Phatthiyaphaibun, Wannaphong and others",
    doi = {10.5281/zenodo.3519354},
    url = {https://github.com/PyThaiNLP/pythainlp/},
    year = {2024}
}
```

---

## 📄 License

MIT License - feel free to use this for your Thai learning journey!


