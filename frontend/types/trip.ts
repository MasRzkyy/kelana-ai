export interface TripRecommendation {
  id?: number;
  destination: string;
  budget: number;
  days: number;
  travel_style: string;
  category?: string;
  daily_budget?: number;
  travel_month?: string;
  season?: string;
  ai_recommendation?: string;
}
