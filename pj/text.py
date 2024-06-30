import tensorflow_hub as hub
import tensorflow_text

# Load the model from TensorFlow Hub
embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder-multilingual/3")

# Example sentence embeddings
sentences = [
    "Hello, how are you?",
    "This is a test sentence.",
    "Embeddings are fascinating.",
]

# Obtain embeddings for the sentences
embeddings = embed(sentences)

# Print the embeddings
for sentence, embedding in zip(sentences, embeddings):
    print(f"Sentence: {sentence}")
    print(f"Embedding shape: {embedding.shape}")
    print(f"Embedding: {embedding}")
    print("\n")
