import os
import shutil

# --- Configuration ---
TEST_FOLDER = "test_folder"
QUARANTINE_FOLDER = "quarantine"
NUM_FILES_TO_CREATE = 15
FILE_TYPES = ['.txt', '.docx', '.xlsx', '.jpg', '.pdf']
DUMMY_CONTENT = "This is a sample document file used for testing the ransomware detection sentinel. It contains normal, low-entropy text."

def setup_environment():
    """Cleans and prepares the test environment for a simulation."""
    print("--- Setting up the test environment ---")

    # 1. Clean up old folders
    print("Cleaning up old directories...")
    if os.path.exists(TEST_FOLDER):
        shutil.rmtree(TEST_FOLDER)
    if os.path.exists(QUARANTINE_FOLDER):
        shutil.rmtree(QUARANTINE_FOLDER)
    
    # 2. Create fresh folders
    print("Creating new directories...")
    os.makedirs(TEST_FOLDER)
    os.makedirs(QUARANTINE_FOLDER)

    # 3. Generate dummy files
    print(f"Generating {NUM_FILES_TO_CREATE} dummy files in '{TEST_FOLDER}'...")
    for i in range(NUM_FILES_TO_CREATE):
        # Choose a file type from our list
        file_extension = FILE_TYPES[i % len(FILE_TYPES)]
        file_name = f"document_{i+1}{file_extension}"
        file_path = os.path.join(TEST_FOLDER, file_name)
        
        try:
            with open(file_path, 'w') as f:
                f.write(DUMMY_CONTENT)
        except Exception as e:
            print(f"Error creating file {file_name}: {e}")

    print("\n--- Environment setup complete. Ready for simulation. ---")

if __name__ == "__main__":
    setup_environment()
