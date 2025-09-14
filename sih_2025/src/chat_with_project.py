from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from llama_index.llms.ollama import Ollama

# Load all files from your project folder
documents = SimpleDirectoryReader("my-jsx-project").load_data()

# Build index so AI can search your files
index = VectorStoreIndex.from_documents(documents)

# Connect to CodeLlama
llm = Ollama(model="codellama:13b")

query_engine = index.as_query_engine(llm=llm)

while True:
    query = input("\nAsk something about your project: ")
    if query.lower() in ["exit", "quit", "q"]:
        break
    response = query_engine.query(query)
    print("\n🤖 AI:", response, "\n")
