from flask import Flask, request, jsonify, send_file
import os
import json
from datetime import datetime

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as file:
            return json.load(file)
    return []

def save_data(data):
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file)

@app.route('/submit', methods=['POST'])
def submit_data():
    data = load_data()

    # Save PDF file
    pdf_file = request.files['pdfFile']
    pdf_filename = pdf_file.filename
    pdf_file.save(os.path.join(UPLOAD_FOLDER, pdf_filename))

    new_entry = {
        'pdfFile': pdf_filename,
        'name': request.form['name'],
        'enrollmentNumber': request.form['enrollmentNumber'],
        'status': request.form['status'],
        'date': datetime.now().strftime('%Y-%m-%d')
    }
    data.append(new_entry)
    save_data(data)
    return jsonify({'message': 'Data submitted successfully'})

@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(load_data())

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)