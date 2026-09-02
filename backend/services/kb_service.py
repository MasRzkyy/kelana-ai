import os
import boto3
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID", "EW7EM5BPON")
KNOWLEDGE_BASE_MODEL_ARN = os.getenv(
    "KNOWLEDGE_BASE_MODEL_ARN",
    f"arn:aws:bedrock:{AWS_REGION}::foundation-model/amazon.nova-lite-v1:0",
)
MODEL_ID = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

client_kwargs = {"region_name": AWS_REGION}
if aws_access_key and aws_secret_key:
    client_kwargs["aws_access_key_id"] = aws_access_key
    client_kwargs["aws_secret_access_key"] = aws_secret_key


def get_bedrock_agent_runtime_client():
    """
    Build and return a boto3 Bedrock Agent Runtime client.
    """
    return boto3.client(
        service_name="bedrock-agent-runtime",
        **client_kwargs,
    )


def get_bedrock_runtime_client():
    """
    Build and return a boto3 Bedrock Runtime client for converse / text generation.
    """
    return boto3.client(
        service_name="bedrock-runtime",
        **client_kwargs,
    )


def retrieve_snippets(query: str, num_results: int = 5) -> str:
    """
    Retrieve relevant content snippets from the Bedrock Knowledge Base.

    Args:
        query: The user's question.
        num_results: Maximum number of retrieved passages (default: 5).

    Returns:
        The retrieved text snippets joined as a single string.
    """
    if not KNOWLEDGE_BASE_ID:
        raise ValueError("KNOWLEDGE_BASE_ID is not set. Check your .env file.")

    client = get_bedrock_agent_runtime_client()

    response = client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": num_results,
            },
        },
    )

    snippets = [
        result.get("content", {}).get("text", "").strip()
        for result in response.get("retrievalResults", [])
        if result.get("content", {}).get("text", "").strip()
    ]
    return "\n\n".join(snippets)


def ask_knowledge_base(question: str) -> Dict[str, Any]:
    """
    Query the Amazon Bedrock Knowledge Base using full RAG (Retrieve + LLM Converse).
    Returns a dictionary containing 'answer', 'source', and 'citations'.
    """
    kb_client = get_bedrock_agent_runtime_client()
    bedrock_runtime_client = get_bedrock_runtime_client()

    # Strategy 1: Attempt standard retrieve_and_generate API
    try:
        response = kb_client.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": KNOWLEDGE_BASE_MODEL_ARN,
                },
            },
        )

        answer_text = response.get("output", {}).get("text", "")
        citations = response.get("citations", [])
        source_files = []

        for citation in citations:
            for ref in citation.get("retrievedReferences", []):
                location = ref.get("location", {})
                if location.get("type") == "S3":
                    s3_uri = location.get("s3Location", {}).get("uri", "")
                    if s3_uri:
                        filename = s3_uri.split("/")[-1]
                        if filename and filename not in source_files:
                            source_files.append(filename)

        source_str = ", ".join(source_files) if source_files else None

        return {
            "answer": answer_text,
            "source": source_str,
            "citations": source_files,
        }

    except Exception as primary_err:
        print(f"[Knowledge Base Notice] retrieve_and_generate notice: {primary_err}. Executing Retrieve (numberOfResults=5) + Converse RAG pipeline...")

        # Strategy 2: Managed Knowledge Base Retrieve (numberOfResults=5) + Bedrock Converse
        try:
            ret_res = kb_client.retrieve(
                knowledgeBaseId=KNOWLEDGE_BASE_ID,
                retrievalQuery={"text": question},
                retrievalConfiguration={
                    "managedSearchConfiguration": {
                        "numberOfResults": 5,
                    },
                },
            )

            results = ret_res.get("retrievalResults", [])
            contexts = []
            source_files = []

            for r in results:
                content_text = r.get("content", {}).get("text", "").strip()
                if content_text:
                    contexts.append(content_text)

                uri = r.get("location", {}).get("s3Location", {}).get("uri", "")
                if uri:
                    filename = uri.split("/")[-1]
                    if filename and filename not in source_files:
                        source_files.append(filename)

            if not contexts:
                return {
                    "answer": "No relevant information found in the Knowledge Base documents.",
                    "source": None,
                    "citations": [],
                }

            context_str = "\n\n".join(contexts)
            prompt = (
                f"You are a helpful travel assistant for KelanaAI. Answer the following question based ONLY on the provided context below.\n\n"
                f"Question: {question}\n\n"
                f"Context from trusted documents:\n{context_str}\n\n"
                f"Provide a clear, accurate, and well-structured answer using clean text and bullet points. Keep it professional and readable."
            )

            converse_res = bedrock_runtime_client.converse(
                modelId=MODEL_ID,
                messages=[{"role": "user", "content": [{"text": prompt}]}],
            )

            answer_text = converse_res["output"]["message"]["content"][0]["text"]
            source_str = ", ".join(source_files) if source_files else None

            return {
                "answer": answer_text,
                "source": source_str,
                "citations": source_files,
            }
        except Exception as fallback_err:
            print(f"[Knowledge Base Error] Managed retrieval failed: {fallback_err}")
            raise fallback_err
