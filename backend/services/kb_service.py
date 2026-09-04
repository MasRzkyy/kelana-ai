import os
import boto3
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("kb_service")

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


def is_indonesian(text: str) -> bool:
    """Helper to detect if user prompt/question is written in Indonesian."""
    indo_keywords = {
        "apa", "apakah", "bagaimana", "berapa", "siapa", "dimana", "di", "ke", "dari",
        "yang", "dan", "atau", "saya", "kami", "anda", "kamu", "liburan", "biaya",
        "rekomendasi", "tolong", "buatkan", "tampilkan", "jelaskan", "pada", "untuk",
        "ini", "itu", "bisa", "mau", "ingin", "ada", "tidak", "dengan", "mana", "hari",
        "tujuan", "wisata", "hotel", "makanan", "tempat"
    }
    words = set(text.lower().split())
    return bool(words & indo_keywords)


def ask_knowledge_base(question: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Query the Amazon Bedrock Knowledge Base using full RAG (Retrieve + LLM Converse).
    Supports multi-turn chat_history to maintain conversation memory and enforces destination consistency.
    Returns a dictionary containing 'answer', 'source', and 'citations'.
    Enforces strict language matching: Indonesian input gets Indonesian response, English input gets English response.
    """
    kb_client = get_bedrock_agent_runtime_client()
    bedrock_runtime_client = get_bedrock_runtime_client()

    user_is_indo = is_indonesian(question)
    target_lang = "Indonesian (Bahasa Indonesia)" if user_is_indo else "English"

    # 0. Check for casual greetings / small talk (e.g. "hai", "halo", "hello", "selamat pagi")
    indo_greetings = {
        "hai", "halo", "pagi", "selamat pagi", "siang", "selamat siang",
        "sore", "selamat sore", "malam", "selamat malam", "p", "test", "tes", "ping",
        "permisi", "helo", "hey", "apa kabar"
    }
    greeting_words = indo_greetings.union({"hi", "hello", "how are you", "good morning", "good afternoon"})
    
    cleaned_q = question.strip().lower().rstrip("!.,?")
    words = cleaned_q.split()
    
    is_greeting = (
        cleaned_q in greeting_words or
        (len(words) <= 3 and any(w in greeting_words for w in words) and not any(term in cleaned_q for term in ["ke ", "di ", "wisata", "liburan", "hotel", "tiket", "budget", "rute", "rekomendasi"]))
    )

    if is_greeting:
        is_indo_greeting = user_is_indo or cleaned_q in indo_greetings or any(w in indo_greetings for w in words)
        greeting_reply = (
            "Halo! 👋 Selamat datang di KelanaAI Travel Assistant.\n\n"
            "Ada rencana liburan atau destinasi wisata yang ingin Anda tanyakan hari ini? "
            "Saya siap membantu memberikan rekomendasi tempat wisata, estimasi biaya (dalam Rupiah), hingga merencanakan rute perjalanan Anda!"
            if is_indo_greeting
            else "Hello! 👋 Welcome to KelanaAI Travel Assistant.\n\n"
            "Where are you planning to travel, or how can I assist with your trip today? "
            "I'm ready to help you with destination recommendations, budget estimates (in Rupiah), and custom travel itineraries!"
        )
        return {
            "answer": greeting_reply,
            "source": None,
            "citations": []
        }

    # Smart destination extractor with negation filter (e.g. "tidak ingin ke kyoto" ignores kyoto)
    destination_terms = {
        "jepang": ["jepang", "japan", "tokyo", "kyoto", "osaka", "hokkaido"],
        "bali": ["bali", "denpasar", "kuta", "ubud", "seminyak", "canggu", "sanur"],
        "komodo": ["komodo", "labuan bajo", "flores"],
        "singapore": ["singapore", "singapura"],
        "hongkong": ["hongkong", "hong kong"],
        "korea": ["korea", "seoul", "busan"],
        "yogyakarta": ["yogyakarta", "jogja", "yogya"],
        "lombok": ["lombok", "gili"],
        "bandung": ["bandung"],
        "raja ampat": ["raja ampat"]
    }

    negative_prefixes = ["tidak ingin", "tidak mau", "jangan", "bukan", "gak mau", "nggak mau", "ga mau", "bosen ke", "tidak ke"]

    def find_destinations_in_text(text: str) -> List[str]:
        text_lower = text.lower()
        active = []
        for dest_key, aliases in destination_terms.items():
            for alias in aliases:
                if alias in text_lower:
                    alias_idx = text_lower.find(alias)
                    prefix_snippet = text_lower[max(0, alias_idx - 30):alias_idx]
                    if any(neg in prefix_snippet for neg in negative_prefixes):
                        continue  # Skip negated destination
                    active.append(dest_key)
                    break
        return active

    # 1. Check current question first
    detected_destinations = find_destinations_in_text(question)

    # 2. If no destination in current question, scan chat history in REVERSE (most recent first)
    if not detected_destinations and chat_history:
        for msg in reversed(chat_history):
            content = msg.get("content", "")
            found = find_destinations_in_text(content)
            if found:
                detected_destinations = found
                break

    # Construct retrieval query incorporating detected destination
    retrieval_query_text = question
    if detected_destinations:
        dest_prefix = " ".join(set(detected_destinations))
        retrieval_query_text = f"{dest_prefix} {question}"
    elif chat_history:
        past_user_msgs = [m["content"] for m in chat_history if m.get("role") == "user"]
        if past_user_msgs:
            retrieval_query_text = f"{past_user_msgs[-1]} - {question}"

    # Build prompt history string if history exists
    history_str = ""
    if chat_history:
        history_lines = [
            f"{m.get('role', 'user').upper()}: {m.get('content', '')}"
            for m in chat_history[-10:]
        ]
        history_str = "PREVIOUS CONVERSATION HISTORY:\n" + "\n".join(history_lines) + "\n\n"

    # Strategy 1: Attempt standard retrieve_and_generate API
    try:
        lang_prompt = (
            f"CRITICAL MANDATES:\n"
            f"1. Respond strictly in {target_lang} (Indonesian question -> Indonesian response, English question -> English response).\n"
            f"2. CONSULTATIVE BEHAVIOR RULE: If the user asks for travel recommendations without specifying the number of days, DO NOT force a day-by-day itinerary ('Hari 1', 'Hari 2'). Instead, present top recommended destinations/activities with estimated prices in Rupiah (Rp), then ask the user politely how many days they plan to stay so you can create a customized itinerary.\n"
            f"3. ABSOLUTE CURRENCY RULE: If responding in Indonesian or if user input mentions Rupiah (Rp / IDR), EVERY SINGLE price, flight ticket (e.g., 'Pesawat: Rp 1.500.000 - Rp 3.000.000 per orang'), hotel, food, transport, activity, and total budget summary MUST be displayed strictly in Rupiah (Rp). Absolutely no USD ($) symbols.\n"
            f"4. Stay 100% focused ONLY on the destination requested in the user prompt/conversation history ({', '.join(set(detected_destinations)) if detected_destinations else 'the requested trip'}). DO NOT include unrelated countries or places.\n\n"
            f"{history_str}"
            f"Question: {question}"
        )

        response = kb_client.retrieve_and_generate(
            input={"text": lang_prompt},
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
                retrievalQuery={"text": retrieval_query_text},
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
                if not content_text:
                    continue

                # Filter out snippets from completely unrelated destinations if detected_destinations exists
                if detected_destinations:
                    text_lower = content_text.lower()
                    other_dest_terms = ["north korea", "korea utara", "pyongyang", "rason", "hungnam", "kazakhstan", "kyrgyzstan", "turkmenistan"]
                    for dk, aliases in destination_terms.items():
                        if dk not in detected_destinations:
                            other_dest_terms.extend(aliases)
                    
                    if any(u in text_lower for u in other_dest_terms) and not any(d in text_lower for d in detected_destinations):
                        continue

                contexts.append(content_text)

                uri = r.get("location", {}).get("s3Location", {}).get("uri", "")
                if uri:
                    filename = uri.split("/")[-1]
                    if filename and filename not in source_files:
                        source_files.append(filename)

            # If filtering removed all contexts, fallback to raw results
            if not contexts and results:
                for r in results:
                    ct = r.get("content", {}).get("text", "").strip()
                    if ct:
                        contexts.append(ct)

            if not contexts:
                fallback_msg = (
                    "Maaf, tidak ditemukan informasi yang relevan di dalam dokumen Knowledge Base."
                    if user_is_indo
                    else "No relevant information found in the Knowledge Base documents."
                )
                return {
                    "answer": fallback_msg,
                    "source": None,
                    "citations": [],
                }

            context_str = "\n\n".join(contexts)
            dest_focus_str = f" TARGET DESTINATION: {', '.join(set(detected_destinations)).upper()}." if detected_destinations else ""

            system_instruction = (
                f"You are KelanaAI, an expert travel assistant.\n\n"
                f"CRITICAL DESTINATION FOCUS MANDATE:\n"
                f"1. You MUST stay 100% focused strictly on the user's requested destination ({dest_focus_str}).\n"
                f"2. You MUST ONLY recommend hotels, places, transportation, and activities that strictly belong to {dest_focus_str if dest_focus_str else 'the user requested trip'}.\n"
                f"3. ABSOLUTELY DO NOT introduce or list hotels/attractions from Pyongyang, North Korea, Tokyo, Kyoto, Kazakhstan, or any other unrelated city/country.\n\n"
                f"CRITICAL CONSULTATIVE RESPONSE MANDATE:\n"
                f"1. DO NOT force a day-by-day itinerary (e.g. 'Hari 1:', 'Hari 2:') UNLESS the user explicitly asks for an itinerary/rute or explicitly specifies the duration (e.g., 'selama 3 hari', 'itinerary 4 hari', 'rute 2 hari').\n"
                f"2. IF THE USER ASKS FOR RECOMMENDATIONS WITHOUT DURATION (e.g., 'rekomendasi tempat wisata di Bali', 'saya ingin ke Bali dengan budget 5 juta bersama pasangan'):\n"
                f"   - Present a curated list of top recommended attractions, romantic spots, accommodation, and transport/food options with clear price estimates in Rupiah (Rp).\n"
                f"   - ALWAYS end your response by asking the user a polite consultative question: 'Berapa hari Anda dan pasangan berencana berlibur di [Destinasi]? Beri tahu saya durasinya agar saya bisa buatkan rute itinerary hari demi hari yang paling pas dengan budget Anda!'\n"
                f"3. ONLY structure output as 'Hari 1', 'Hari 2', etc. when the user explicitly requests a multi-day itinerary or specifies the trip duration.\n\n"
                f"CRITICAL LANGUAGE MANDATE:\n"
                f"1. Respond strictly in {target_lang}.\n"
                f"2. If the user question is in Indonesian, write your ENTIRE answer in natural, professional Indonesian (Bahasa Indonesia).\n\n"
                f"ESTIMATED COST & BUDGET MANDATE:\n"
                f"1. STRICT CURRENCY CONVERSION: Display ALL price estimates, flight tickets, transport, accommodation, food, and activities strictly in Rupiah (Rp) (e.g., 'Pesawat: Rp 1.500.000 - Rp 3.000.000 per orang', 'Hostel: Rp 150.000 - Rp 300.000/malam', 'Rp 0 (Gratis)').\n"
                f"2. NO USD ALLOWED: NEVER output '$100 - $200' or any USD ($) figures for flight tickets or hotels when responding in Rupiah. Convert all USD values to Rupiah.\n"
                f"3. Provide a clear total budget summary breakdown at the end."
            )

            current_prompt = (
                f"User Question: {question}\n\n"
                f"Context from trusted travel documents:\n{context_str}\n\n"
                f"Based on the provided context above and previous conversation history, answer the user's question in {target_lang}.\n"
                f"IMPORTANT: If the user did NOT specify duration/number of days, list recommended places with prices in Rupiah (Rp) and ask how many days they plan to stay. DO NOT create 'Hari 1, Hari 2' unless requested. Absolutely no USD ($) symbols."
            )

            # Reconstruct converse API messages with chat_history (Part 8: Context Trimming to last 10 turns)
            MAX_WINDOW_TURNS = 10
            trimmed_history = chat_history[-MAX_WINDOW_TURNS:] if chat_history else []
            if chat_history and len(chat_history) > MAX_WINDOW_TURNS:
                logger.info(f"[Part 8 Context Trimming] Trimmed conversation history from {len(chat_history)} to last {MAX_WINDOW_TURNS} turns for token optimization.")

            converse_messages = []
            if trimmed_history:
                for msg in trimmed_history:
                    role = "user" if msg.get("role") == "user" else "assistant"
                    converse_messages.append({
                        "role": role,
                        "content": [{"text": msg.get("content", "")}]
                    })

            # Ensure strictly alternating roles for Bedrock Converse API
            sanitized_messages = []
            for m in converse_messages:
                if sanitized_messages and sanitized_messages[-1]["role"] == m["role"]:
                    sanitized_messages[-1]["content"][0]["text"] += f"\n\n{m['content'][0]['text']}"
                else:
                    sanitized_messages.append(m)

            if sanitized_messages and sanitized_messages[-1]["role"] == "user":
                sanitized_messages[-1]["content"][0]["text"] += f"\n\n[Follow-up question]: {current_prompt}"
            else:
                sanitized_messages.append({"role": "user", "content": [{"text": current_prompt}]})

            converse_res = bedrock_runtime_client.converse(
                modelId=MODEL_ID,
                system=[{"text": system_instruction}],
                messages=sanitized_messages,
                inferenceConfig={
                    "maxTokens": 2048,
                    "temperature": 0.7,
                    "topP": 0.9
                }
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
