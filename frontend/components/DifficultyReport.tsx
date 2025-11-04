"use client";

import { Topic } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface DifficultyReportProps {
  topics: Topic[];
}

export default function DifficultyReport({ topics }: DifficultyReportProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Calculate stats for each difficulty level
  const calculateDifficultyStats = (difficulty: "Beginner" | "Intermediate" | "Advanced") => {
    let total = 0;
    let completed = 0;

    topics.forEach((topic) => {
      if (topic.subTopics) {
        topic.subTopics.forEach((subTopic) => {
          if (subTopic.difficulty === difficulty) {
            total++;
            if (subTopic.userStatus === "done") {
              completed++;
            }
          }
        });
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  };

  const easyStats = calculateDifficultyStats("Beginner");
  const mediumStats = calculateDifficultyStats("Intermediate");
  const hardStats = calculateDifficultyStats("Advanced");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return {
          bg: "bg-green-50",
          text: "text-green-800",
          border: "border-green-200",
          progress: "bg-green-500",
        };
      case "Intermediate":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-800",
          border: "border-yellow-200",
          progress: "bg-yellow-500",
        };
      case "Advanced":
        return {
          bg: "bg-red-50",
          text: "text-red-800",
          border: "border-red-200",
          progress: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-800",
          border: "border-gray-200",
          progress: "bg-gray-500",
        };
    }
  };

  const DifficultyCard = ({
    difficulty,
    stats,
  }: {
    difficulty: string;
    stats: { total: number; completed: number; percentage: number };
  }) => {
    const colors = getDifficultyColor(difficulty);

    return (
      <div
        className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 shadow-md`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${colors.text}`}>{difficulty}</h3>
          <span className={`text-2xl font-bold ${colors.text}`}>
            {stats.percentage}%
          </span>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className={colors.text}>
              {stats.completed} / {stats.total} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`${colors.progress} h-full transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>
        {stats.total === 0 && (
          <p className="text-sm text-gray-500 mt-2">No subtopics available</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Completion Report by Difficulty
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <DifficultyCard difficulty="Beginner" stats={easyStats} />
        <DifficultyCard difficulty="Intermediate" stats={mediumStats} />
        <DifficultyCard difficulty="Advanced" stats={hardStats} />
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">{easyStats.completed}</div>
            <div className="text-sm text-gray-600">Easy Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-600">{mediumStats.completed}</div>
            <div className="text-sm text-gray-600">Medium Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600">{hardStats.completed}</div>
            <div className="text-sm text-gray-600">Hard Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

