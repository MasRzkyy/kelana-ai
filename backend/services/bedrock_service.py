import os
import boto3
from dotenv import load_dotenv

load_dotenv()

client = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION", "us-east-1")
)


def generate_trip_recommendation(
    destination: str,
    days: int,
    budget: float,
    category: str,
    travel_style: str = ""
) -> str:
    """
    Generate a structured daily travel itinerary using Amazon Bedrock Converse API.
    """
    prompt = f"""You are an experienced travel planner for KelanaAI.
Create a structured daily itinerary for a trip to {destination} for {days} days.
Budget Category: {category} (Total Budget: IDR {budget:,.0f})
Travel Style: {travel_style if travel_style else 'Standard'}

For EACH day, you MUST provide:
- Morning activities: Specifically give 2-3 morning activities.
- Afternoon activities: Include cultural sites and local experiences.
- Evening activities: Suggest dinner spots and nightlife.

Format your response as clean Markdown using headers (##) and bullet lists (-)."""

    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    response = client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    )

    ai_response = response["output"]["message"]["content"][0]["text"]
    return ai_response