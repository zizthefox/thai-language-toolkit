#!/usr/bin/env python3
"""Entry point for Hugging Face Spaces deployment."""

import subprocess
import sys

if __name__ == "__main__":
    # Run the Streamlit app
    subprocess.run([sys.executable, "-m", "streamlit", "run", "apps/streamlit_app.py", "--server.port=7860", "--server.address=0.0.0.0"])