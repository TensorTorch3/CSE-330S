import os
import subprocess

# Change to the backend directory
os.chdir('backend')

# Run python main.py
try:
    result = subprocess.run(['python', 'main.py'], capture_output=True, text=True, timeout=2)
    print("Exit code:", result.returncode)
    if result.stdout:
        print("Output:", result.stdout)
    if result.stderr:
        print("Error:", result.stderr)
except subprocess.TimeoutExpired:
    print("The command timed out, but this might be expected if the server started successfully.")