import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { AllProgress } from "@/lib/progress";

export const maxDuration = 30;

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are a Thai language learning coach analyzing a student's progress data.

Based on their learning data, provide personalized recommendations to help them improve.

Consider:
1. Weak areas (low accuracy tones, difficult words)
2. Features they haven't tried yet
3. Streak maintenance and encouragement
4. Balanced practice across all skills

Return JSON with this exact structure:
{
  "recommendations": [
    {
      "priority": 1,
      "type": "tones" | "flashcards" | "chat" | "general",
      "message": "Your rising tones need work - you're at 40% accuracy",
      "actionLabel": "Practice Rising Tones",
      "actionParams": { "filter": "rising" }
    }
  ],
  "encouragement": "Great 3-day streak! Keep it up!",
  "focusArea": "tones" | "flashcards" | "chat" | null
}

Rules:
- Maximum 4 recommendations, minimum 1
- Priority 1 is most important
- Be specific about percentages and numbers
- Encouragement should be warm but concise
- focusArea is the single most important thing to work on
- Return ONLY valid JSON, no markdown`;

interface Recommendation {
  priority: number;
  type: "tones" | "flashcards" | "chat" | "general";
  message: string;
  actionLabel: string;
  actionParams?: Record<string, string>;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  encouragement: string;
  focusArea: "tones" | "flashcards" | "chat" | null;
}

function generateFallbackRecommendations(progress: AllProgress): RecommendationsResponse {
  const recommendations: Recommendation[] = [];

  // Check flashcard accuracy
  const flashcardTotal = progress.flashcards.totalCards;
  const flashcardAccuracy = flashcardTotal > 0
    ? Math.round((progress.flashcards.correctAnswers / flashcardTotal) * 100)
    : 0;

  // Check tone accuracy
  const toneTotal = progress.tones.totalRounds;
  const toneAccuracy = toneTotal > 0
    ? Math.round((progress.tones.correctAnswers / toneTotal) * 100)
    : 0;

  // Check for weak tones
  const weakTones = progress.tones.weakToneSets || [];
  const weakWords = progress.flashcards.weakWords || [];

  // Find lowest accuracy tone
  let lowestTone: { name: string; accuracy: number } | null = null;
  for (const [tone, data] of Object.entries(progress.tones.accuracyByTone || {})) {
    if (data.total >= 3) {
      const accuracy = Math.round((data.correct / data.total) * 100);
      if (!lowestTone || accuracy < lowestTone.accuracy) {
        lowestTone = { name: tone, accuracy };
      }
    }
  }

  // Generate recommendations based on data
  let priority = 1;

  // New user - encourage exploration
  if (progress.overall.totalSessions === 0) {
    recommendations.push({
      priority: priority++,
      type: "general",
      message: "Welcome! Start with conversation practice to learn practical Thai phrases",
      actionLabel: "Start Conversation",
    });
    recommendations.push({
      priority: priority++,
      type: "flashcards",
      message: "Build your vocabulary with flashcard quizzes",
      actionLabel: "Try Flashcards",
    });
    return {
      recommendations,
      encouragement: "Welcome to Thai Language Toolkit! Let's begin your learning journey.",
      focusArea: "chat",
    };
  }

  // Weak tones recommendation
  if (lowestTone && lowestTone.accuracy < 60) {
    recommendations.push({
      priority: priority++,
      type: "tones",
      message: `Your ${lowestTone.name} tones need work - you're at ${lowestTone.accuracy}% accuracy`,
      actionLabel: `Practice ${lowestTone.name.charAt(0).toUpperCase() + lowestTone.name.slice(1)} Tones`,
    });
  }

  // Weak words recommendation
  if (weakWords.length >= 3) {
    recommendations.push({
      priority: priority++,
      type: "flashcards",
      message: `You have ${weakWords.length} words that need review`,
      actionLabel: "Review Weak Words",
    });
  }

  // Low flashcard accuracy
  if (flashcardTotal >= 10 && flashcardAccuracy < 70) {
    recommendations.push({
      priority: priority++,
      type: "flashcards",
      message: `Your vocabulary accuracy is ${flashcardAccuracy}% - try shorter sessions to focus`,
      actionLabel: "Quick Vocabulary Quiz",
    });
  }

  // Encourage unused features
  if (progress.tones.totalSessions === 0 && progress.flashcards.totalSessions > 0) {
    recommendations.push({
      priority: priority++,
      type: "tones",
      message: "You haven't tried tone practice yet - it's essential for Thai!",
      actionLabel: "Try Tone Practice",
    });
  }

  if (progress.chat.totalSessions === 0 && progress.overall.totalSessions > 2) {
    recommendations.push({
      priority: priority++,
      type: "chat",
      message: "Ready for real conversations? Try a roleplay scenario!",
      actionLabel: "Start Chat Practice",
    });
  }

  // Check for unexplored scenarios
  const scenarios = ["restaurant", "market", "taxi", "hotel", "shopping"];
  const usedScenarios = Object.keys(progress.chat.scenariosUsed || {});
  const unusedScenarios = scenarios.filter(s => !usedScenarios.includes(s));
  if (unusedScenarios.length > 0 && progress.chat.totalSessions > 0) {
    recommendations.push({
      priority: priority++,
      type: "chat",
      message: `Try the ${unusedScenarios[0]} scenario for new vocabulary`,
      actionLabel: `Practice ${unusedScenarios[0].charAt(0).toUpperCase() + unusedScenarios[0].slice(1)} Chat`,
    });
  }

  // Default recommendation if none generated
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 1,
      type: "general",
      message: "Keep practicing! Consistency is key to language learning",
      actionLabel: "Continue Learning",
    });
  }

  // Generate encouragement based on streak
  let encouragement = "";
  const streak = progress.overall.currentStreak;
  if (streak >= 7) {
    encouragement = `Amazing ${streak}-day streak! You're building a strong habit.`;
  } else if (streak >= 3) {
    encouragement = `Great ${streak}-day streak! Keep the momentum going.`;
  } else if (streak === 1) {
    encouragement = "Good start today! Come back tomorrow to build your streak.";
  } else {
    encouragement = "Welcome back! Every practice session counts.";
  }

  // Determine focus area
  let focusArea: "tones" | "flashcards" | "chat" | null = null;
  if (lowestTone && lowestTone.accuracy < 50) {
    focusArea = "tones";
  } else if (weakWords.length >= 5) {
    focusArea = "flashcards";
  } else if (progress.chat.totalSessions === 0) {
    focusArea = "chat";
  }

  return {
    recommendations: recommendations.slice(0, 4),
    encouragement,
    focusArea,
  };
}

export async function POST(req: Request) {
  try {
    const { progress } = await req.json() as { progress: AllProgress };

    if (!progress) {
      return NextResponse.json(
        { error: "Progress data required" },
        { status: 400 }
      );
    }

    // Try AI-powered recommendations
    try {
      const progressSummary = {
        flashcards: {
          sessions: progress.flashcards.totalSessions,
          totalCards: progress.flashcards.totalCards,
          accuracy: progress.flashcards.totalCards > 0
            ? Math.round((progress.flashcards.correctAnswers / progress.flashcards.totalCards) * 100)
            : 0,
          weakWordsCount: progress.flashcards.weakWords?.length || 0,
          categoriesUsed: Object.keys(progress.flashcards.categoriesUsed || {}),
        },
        tones: {
          sessions: progress.tones.totalSessions,
          totalRounds: progress.tones.totalRounds,
          accuracy: progress.tones.totalRounds > 0
            ? Math.round((progress.tones.correctAnswers / progress.tones.totalRounds) * 100)
            : 0,
          accuracyByTone: Object.entries(progress.tones.accuracyByTone || {}).map(([tone, data]) => ({
            tone,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            attempts: data.total,
          })),
          weakTonesCount: progress.tones.weakToneSets?.length || 0,
          modeUsage: progress.tones.modeUsage,
        },
        chat: {
          sessions: progress.chat.totalSessions,
          messagesExchanged: progress.chat.messagesExchanged,
          correctionsReceived: progress.chat.correctionsReceived,
          scenariosUsed: Object.keys(progress.chat.scenariosUsed || {}),
        },
        overall: {
          totalSessions: progress.overall.totalSessions,
          currentStreak: progress.overall.currentStreak,
          daysSinceStart: progress.overall.firstSessionDate
            ? Math.floor((Date.now() - new Date(progress.overall.firstSessionDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        },
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this learning progress and provide recommendations:\n${JSON.stringify(progressSummary, null, 2)}` },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const result = JSON.parse(jsonMatch[0]) as RecommendationsResponse;

      // Validate response structure
      if (result.recommendations && Array.isArray(result.recommendations)) {
        return NextResponse.json(result);
      }

      throw new Error("Invalid response structure");
    } catch (aiError) {
      console.error("OpenAI error, using fallback recommendations:", aiError);
      // Use fallback recommendations
      const fallback = generateFallbackRecommendations(progress);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
