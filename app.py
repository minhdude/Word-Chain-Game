from flask import Flask, request, render_template, jsonify
import random

app = Flask(__name__)

def read_phrases_from_file(filename):
    """Đọc danh sách từ ghép từ file"""
    with open(filename, 'r', encoding='utf-8') as file:
        phrases = [line.strip() for line in file if line.strip()]
    return phrases

def valid_phrase(phrase, last_word, used_phrases):
    """Kiểm tra tính hợp lệ của từ ghép mới"""
    words = phrase.split()
    if phrase in used_phrases:
        return False
    if words[0].lower() != last_word or words[-1].lower() == last_word:
        return False
    return True

def get_next_phrase(last_word, used_phrases, phrase_list):
    """Hàm để máy tính chọn từ ghép tiếp theo"""
    valid_phrases = [phrase for phrase in phrase_list if phrase.split()[0].lower() == last_word and phrase not in used_phrases]
    if valid_phrases:
        return random.choice(valid_phrases)
    return None

phrase_list = read_phrases_from_file('phrases_processed.txt')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play', methods=['POST'])
def play():
    data = request.json
    last_word = data.get('last_word')
    used_phrases = data.get('used_phrases')
    
    phrase = get_next_phrase(last_word, used_phrases, phrase_list)
    if not phrase:
        return jsonify({"status": "win"})
    
    used_phrases.append(phrase)
    return jsonify({"status": "continue", "phrase": phrase, "last_word": phrase.split()[-1], "used_phrases": used_phrases})

if __name__ == "__main__":
    app.run(debug=True)
