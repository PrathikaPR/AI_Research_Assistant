from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from waitress import serve

app = Flask(__name__)

# ==========================================
# LOAD MODEL
# ==========================================

print("Loading AI model...")

model = SentenceTransformer('all-MiniLM-L6-v2')

print("Model loaded successfully ✅")


# ==========================================
# TEST ROUTE
# ==========================================

@app.route('/', methods=['GET'])
def home():

    return jsonify({
        "success": True,
        "message": "Flask AI Service Running 🚀"
    })


# ==========================================
# GENERATE EMBEDDING API
# ==========================================

@app.route('/generate-embedding', methods=['POST'])
def generate_embedding():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Request body is missing"
            }), 400

        text = data.get('text', '').strip()

        if not text:

            return jsonify({
                "success": False,
                "message": "Text is required"
            }), 400

        embedding = model.encode(text).tolist()

        return jsonify({
            "success": True,
            "embedding": embedding
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# SEMANTIC SEARCH API
# ==========================================

@app.route('/semantic-search', methods=['POST'])
def semantic_search():

    try:

        data = request.get_json()

        query_embedding = np.array(
            data['query_embedding']
        ).reshape(1, -1)

        paper_embeddings = np.array(
            data['paper_embeddings']
        )

        similarities = cosine_similarity(
            query_embedding,
            paper_embeddings
        )[0]

        best_match_index = int(np.argmax(similarities))

        best_score = float(similarities[best_match_index])

        return jsonify({
            "success": True,
            "best_match_index": best_match_index,
            "similarity_score": best_score
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# RUN SERVER
# ==========================================


if __name__ == '__main__':
    print("====================================")
    print("Flask AI Service Running 🚀")
    print("URL => http://127.0.0.1:8000")
    print("====================================")
    serve(app, host='0.0.0.0', port=8000)

    app.run(
        host='0.0.0.0',
        port=8000,
        debug=False
    )