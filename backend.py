from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
from transformers import BertTokenizer, BertForSequenceClassification
import torch
import logging

# Logging ayarlarını yap (isteğe bağlı ama faydalı)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

model = None
tokenizer = None
label_encoder = None

# Modeli ve tokenizer'ı yükle
try:
    logging.info("Model ve tokenizer yükleniyor...")
    model = BertForSequenceClassification.from_pretrained('./news_category_model')
    tokenizer = BertTokenizer.from_pretrained('./news_category_model')
    with open('label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    model.eval() # Tahmin moduna al
    logging.info("Model ve tokenizer başarıyla yüklendi.")
except Exception as e:
    logging.error(f"Model veya tokenizer yüklenirken hata oluştu: {e}", exc_info=True)
    # Uygulamayı başlatmayı engelleyebilir veya bir hata mesajı gösterebilirsiniz.
    # Örneğin: raise Exception("Model yüklenemedi!") from e

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not tokenizer or not label_encoder:
        logging.error("Model veya gerekli dosyalar yüklenemedi.")
        return jsonify({'error': 'Model veya gerekli dosyalar yüklenemedi.'}), 500

    data = request.get_json()
    if not data or 'text' not in data:
        logging.warning("Geçersiz istek: 'text' alanı eksik.")
        return jsonify({'error': 'Metin alanı eksik.'}), 400

    text = data['text']
    try:
        inputs = tokenizer(text, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            outputs = model(**inputs)
        predictions = torch.argmax(outputs.logits, dim=-1)
        predicted_label = label_encoder.inverse_transform(predictions.numpy())[0]
        return jsonify({'prediction': predicted_label})
    except Exception as e:
        logging.error(f"Tahmin sırasında bir hata oluştu: {e}", exc_info=True)
        return jsonify({'error': f'Tahmin sırasında bir hata oluştu: {str(e)}'}), 500

if __name__ == '__main__':
    logging.info("Flask uygulaması başlatılıyor...")
    app.run(debug=True, port=5000)