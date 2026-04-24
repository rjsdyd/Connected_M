from flask import Flask, request, jsonify
from embedding_engine import MeaningVectorEngine

app = Flask(__name__)
engine = MeaningVectorEngine()

@app.route('/vectorize', methods=['POST'])
def vectorize():
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({"error" : "텍스트가 없습니다."}), 400
    
    vector = engine.model.encode(text).tolist()
    return jsonify(vector)

if __name__ == '__main__':
    print("🌐 벡터 서버가 5000번 포트에서 대기 중입니다! ㅋㅋㅋㅋ")
    app.run(host='0.0.0.0', port=5000)