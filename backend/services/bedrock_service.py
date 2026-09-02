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
    daily_cap = budget / days if days > 0 else budget
    prompt = f"""You are an experienced travel planner for KelanaAI.
Create a detailed, structured daily itinerary for a trip to {destination} for {days} days.

STRICT BUDGET CONSTRAINT (HARD CAP):
- Total Trip Budget for ALL {days} days combined: EXACTLY ${budget:,.0f} USD ({category} Tier).
- MAXIMUM Daily Budget Cap: Approx. ${daily_cap:,.0f} USD per day (including accommodation, meals, transport, and entrance fees).
- ABSOLUTE RULE: The sum of ALL expenses across ALL {days} days MUST NOT EXCEED ${budget:,.0f} USD under any circumstances.
- If the total budget is low (${budget:,.0f} USD for {days} days), suggest budget hostels/capsule hotels ($15-$30/night), free attractions, public transit passes, and affordable street food.

Travel Style: {travel_style if travel_style else 'Standard'}

CRITICAL REQUIREMENT FOR ESTIMATED COSTS:
For EVERY single activity, attraction, meal, transport item, or nightlife suggestion, you MUST include an estimated price in USD ($) directly in parentheses right after the title, e.g.:
- **Hostel / Capsule Hotel Stay** ($20/night)
- **Visit Iconic City Landmark** ($0 - Free)
- **Lunch at Local Bistro / Street Food** ($5 - $8)
- **City Transit Pass** ($5)

For EACH day, structure your output into:
### Morning Activities
### Afternoon Activities
### Evening Activities

Format your response as clean Markdown using headers (## Day 1: ..., ### Morning Activities) and bullet lists (-). Ensure EVERY activity bullet point explicitly includes its estimated cost in USD ($). At the end of the itinerary, provide a Total Budget Summary confirming total costs stay within ${budget:,.0f} USD."""

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