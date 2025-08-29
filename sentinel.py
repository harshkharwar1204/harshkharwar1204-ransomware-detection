import time
import logging
import math
import os
import shutil
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from flask import Flask, jsonify, request
from flask_cors import CORS

class Sentinel:
    def __init__(self):
        # Configuration
        self.HIGH_ENTROPY_THRESHOLD = 7.5
        self.QUARANTINE_THRESHOLD = 15
        self.SCORE_DECAY_RATE = 1
        self.SCORE_DECAY_INTERVAL = 10
        self.POINTS_HIGH_ENTROPY = 4
        self.POINTS_RANSOM_NOTE = 10
        self.POINTS_FLURRY_ACTIVITY = 6
        self.RANSOM_NOTE_FILENAMES = {
            "_readme.txt", "readme.txt", "decrypt_me.txt", 
            "recover_your_files.txt", "how_to_decrypt.html"
        }
        self.FLURRY_TIME_WINDOW = 5
        self.FLURRY_FILE_COUNT = 10
        self.QUARANTINE_FOLDER = "quarantine"
        
        # State Management
        self.threat_score = 0
        self.last_event_time = time.time()
        self.flurry_events = []
        self.is_monitoring = False
        self.observer = None
        
        # Data for the API
        self.logs = []
        self.alerts = []
        self.quarantined_files = []
        self.whitelist_paths = [] # <-- NEW: Whitelist logic

    def _log(self, level, message):
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        log_entry = {'timestamp': timestamp, 'level': level.upper(), 'message': message}
        self.logs.insert(0, log_entry)
        self.logs = self.logs[:100]
        
        if level == 'critical':
            self.alerts.insert(0, log_entry)
            self.alerts = self.alerts[:50]

        print(f"{timestamp} - {level.upper()} - {message}")

    def calculate_entropy(self, file_path):
        if not os.path.exists(file_path) or os.path.isdir(file_path): return 0
        try:
            with open(file_path, 'rb') as f:
                byte_counts = [0] * 256; file_size = 0
                for chunk in iter(lambda: f.read(4096), b''):
                    for byte in chunk: byte_counts[byte] += 1
                    file_size += len(chunk)
                if file_size == 0: return 0
                entropy = 0
                for count in byte_counts:
                    if count > 0:
                        prob = count / file_size
                        entropy -= prob * math.log2(prob)
                return entropy
        except Exception as e:
            self._log('warning', f"Could not read {file_path}: {e}")
            return 0

    def quarantine_file(self, file_path):
        if not os.path.exists(file_path): return
        if not os.path.exists(self.QUARANTINE_FOLDER):
            os.makedirs(self.QUARANTINE_FOLDER)
        try:
            filename = os.path.basename(file_path)
            shutil.move(file_path, os.path.join(self.QUARANTINE_FOLDER, filename))
            self._log('critical', f"ACTION: File '{filename}' has been QUARANTINED.")
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            self.quarantined_files.insert(0, {'name': filename, 'timestamp': timestamp})
        except Exception as e:
            self._log('error', f"Failed to quarantine {file_path}: {e}")

    def update_threat_score(self, points, file_path, reason):
        self.threat_score += points
        self.last_event_time = time.time()
        self._log('warning', f"Threat score increased by {points} for '{os.path.basename(file_path)}'. Reason: {reason}. New Score: {self.threat_score}")
        if self.threat_score >= self.QUARANTINE_THRESHOLD:
            self._log('critical', f"!! THREAT THRESHOLD REACHED ({self.threat_score}) !!")
            self.quarantine_file(file_path)
            self.threat_score = 0

    def check_flurry_activity(self, file_path):
        current_time = time.time()
        self.flurry_events = [t for t in self.flurry_events if current_time - t < self.FLURRY_TIME_WINDOW]
        self.flurry_events.append(current_time)
        if len(self.flurry_events) >= self.FLURRY_FILE_COUNT:
            self.update_threat_score(self.POINTS_FLURRY_ACTIVITY, file_path, "Rapid file modification flurry")
            self.flurry_events = []

    def decay_score(self):
        while self.is_monitoring:
            time.sleep(self.SCORE_DECAY_INTERVAL)
            if self.threat_score > 0 and time.time() - self.last_event_time > self.SCORE_DECAY_INTERVAL:
                self.threat_score = max(0, self.threat_score - self.SCORE_DECAY_RATE)
                self._log('info', f"Threat score decayed to {self.threat_score} due to inactivity.")
                self.last_event_time = time.time()

    def start_monitoring(self, path_to_watch, whitelist): # <-- NEW: Accept whitelist
        if not os.path.isdir(path_to_watch):
            self._log('error', f"Directory not found: {path_to_watch}")
            return False
        
        self.is_monitoring = True
        self.whitelist_paths = [os.path.abspath(p) for p in whitelist] # <-- NEW: Store normalized paths
        self.observer = Observer()
        event_handler = self.ThreatHandler(self)
        self.observer.schedule(event_handler, path_to_watch, recursive=True)
        self.observer.start()
        
        decay_thread = threading.Thread(target=self.decay_score, daemon=True)
        decay_thread.start()
        
        self._log('info', f"Sentinel activated. Monitoring folder: {path_to_watch}")
        if self.whitelist_paths:
             self._log('info', f"Whitelist active for: {', '.join(self.whitelist_paths)}")
        return True

    def stop_monitoring(self):
        if self.is_monitoring and self.observer:
            self.observer.stop()
            self.observer.join()
        self.is_monitoring = False
        self.threat_score = 0
        self.logs = []
        self.alerts = []
        self.quarantined_files = []
        self.whitelist_paths = [] # <-- NEW: Reset whitelist
        self._log('info', "Sentinel deactivated.")
        return True

    class ThreatHandler(FileSystemEventHandler):
        def __init__(self, sentinel_instance):
            self.sentinel = sentinel_instance

        def on_any_event(self, event):
            # <-- NEW: Core Whitelist Check ---
            abs_path = os.path.abspath(event.src_path)
            for whitelisted_path in self.sentinel.whitelist_paths:
                if abs_path.startswith(whitelisted_path):
                    # self.sentinel._log('info', f"Ignoring whitelisted event at: {event.src_path}")
                    return 
            # --- End Whitelist Check ---

            if not self.sentinel.is_monitoring: return
            if event.event_type in ('created', 'modified') and not event.is_directory:
                file_path = event.src_path
                filename = os.path.basename(file_path)
                
                if event.event_type == 'created' and filename.lower() in self.sentinel.RANSOM_NOTE_FILENAMES:
                    self.sentinel.update_threat_score(self.sentinel.POINTS_RANSOM_NOTE, file_path, "Ransom note created")
                
                if event.event_type == 'modified':
                    entropy = self.sentinel.calculate_entropy(file_path)
                    self.sentinel._log('info', f"File modified: {filename} - Entropy: {entropy:.4f}")
                    if entropy > self.sentinel.HIGH_ENTROPY_THRESHOLD:
                        self.sentinel.update_threat_score(self.sentinel.POINTS_HIGH_ENTROPY, file_path, "High entropy detected")
                
                self.sentinel.check_flurry_activity(file_path)

app = Flask(__name__)
CORS(app)
sentinel = Sentinel()

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({
        'isMonitoring': sentinel.is_monitoring,
        'threatScore': sentinel.threat_score,
        'logs': sentinel.logs,
        'alerts': sentinel.alerts,
        'quarantinedFiles': sentinel.quarantined_files,
        'whitelist': sentinel.whitelist_paths # <-- NEW: Return current whitelist
    })

@app.route('/start', methods=['POST'])
def start():
    data = request.json
    path = data.get('path')
    whitelist = data.get('whitelist', []) # <-- NEW: Get whitelist from request
    if not path:
        return jsonify({'status': 'error', 'message': 'Path is required'}), 400
    
    abs_path = os.path.abspath(path)
    
    if sentinel.start_monitoring(abs_path, whitelist): # <-- NEW: Pass whitelist
        return jsonify({'status': 'success', 'message': f'Monitoring started on {abs_path}'})
    else:
        return jsonify({'status': 'error', 'message': f'Failed to start monitoring on {abs_path}'}), 500

@app.route('/stop', methods=['POST'])
def stop():
    if sentinel.stop_monitoring():
        return jsonify({'status': 'success', 'message': 'Monitoring stopped'})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to stop monitoring'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

