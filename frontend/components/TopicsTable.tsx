"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Topic, api } from "@/lib/api";

interface TopicsTableProps {
  topics: Topic[];
  loading?: boolean;
  onTopicUpdate?: (updatedTopics: Topic[]) => void;
}

export default function TopicsTable({
  topics,
  loading,
  onTopicUpdate,
}: TopicsTableProps) {
  const [localTopics, setLocalTopics] = useState<Topic[]>(topics);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Update local topics when props change
  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  // Get user's status for a subtopic
  const getUserStatus = (subTopic: any): "pending" | "done" => {
    if (!user) return "pending";
    return subTopic.userStatus || "pending";
  };

  // Get topic overall status (done if all subtopics are done, otherwise in progress)
  const getTopicStatus = (topic: Topic): "done" | "in progress" => {
    if (!user || !topic.subTopics || topic.subTopics.length === 0) {
      return "in progress";
    }

    const allDone = topic.subTopics.every(
      (subTopic) => getUserStatus(subTopic) === "done"
    );

    return allDone ? "done" : "in progress";
  };

  // Toggle subtopic status
  const toggleSubTopicStatus = async (
    topicId: string,
    subTopicId: string,
    currentStatus: "pending" | "done"
  ) => {
    if (!user) return;

    const newStatus = currentStatus === "pending" ? "done" : "pending";
    const statusKey = `${topicId}-${subTopicId}`;

    // Store original state for potential revert
    const originalTopics = localTopics;

    // Optimistically update the UI
    const updatedTopics = localTopics.map((topic) => {
      if (topic._id === topicId) {
        const updatedSubTopics = topic.subTopics.map((subTopic) => {
          if (subTopic._id === subTopicId) {
            return {
              ...subTopic,
              userStatus: newStatus,
            };
          }
          return subTopic;
        });
        return {
          ...topic,
          subTopics: updatedSubTopics,
        };
      }
      return topic;
    });

    setLocalTopics(updatedTopics as any);
    if (onTopicUpdate) {
      onTopicUpdate(updatedTopics as any);
    }

    try {
      setUpdatingStatus((prev) => new Set(prev).add(statusKey));
      await api.updateSubTopicStatus(topicId, subTopicId, newStatus);
    } catch (error) {
      console.error("Error updating subtopic status:", error);
      // Revert optimistic update on error
      setLocalTopics(originalTopics);
      if (onTopicUpdate) {
        onTopicUpdate(originalTopics);
      }
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(statusKey);
        return newSet;
      });
    }
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Loading topics...</p>
      </div>
    );
  }

  if (localTopics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No topics found. Create your first topic!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {/* Expand/Collapse column */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub Topics Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {localTopics.map((topic) => {
              const isExpanded = expandedTopics.has(topic._id);
              const subTopicsCount = topic.subTopics?.length || 0;
              const topicStatus = getTopicStatus(topic);

              // Count subtopics by difficulty
              const easyCount =
                topic.subTopics?.filter((st) => st.difficulty === "Beginner")
                  .length || 0;
              const mediumCount =
                topic.subTopics?.filter(
                  (st) => st.difficulty === "Intermediate"
                ).length || 0;
              const hardCount =
                topic.subTopics?.filter((st) => st.difficulty === "Advanced")
                  .length || 0;
              console.log(easyCount, mediumCount, hardCount);
              console.log(topic.subTopics);
              return (
                <>
                  {/* Main Topic Row */}
                  <tr
                    key={topic._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleTopic(topic._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTopic(topic._id);
                        }}
                      >
                        {isExpanded ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm capitalize font-medium text-gray-900">
                          {topic.topicName}
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            topicStatus === "done"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {topicStatus === "done" ? "Done" : "In Progress"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {subTopicsCount}{" "}
                        {subTopicsCount === 1 ? "subtopic" : "subtopics"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3 text-sm">
                        {easyCount > 0 && (
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            <span className="text-gray-600">
                              Easy: {easyCount}
                            </span>
                          </span>
                        )}
                        {mediumCount > 0 && (
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                            <span className="text-gray-600">
                              Medium: {mediumCount}
                            </span>
                          </span>
                        )}
                        {hardCount > 0 && (
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            <span className="text-gray-600">
                              Hard: {hardCount}
                            </span>
                          </span>
                        )}
                        {easyCount === 0 &&
                          mediumCount === 0 &&
                          hardCount === 0 && (
                            <span className="text-gray-400">-</span>
                          )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded SubTopics Rows */}
                  {isExpanded &&
                    topic.subTopics &&
                    topic.subTopics.length > 0 && (
                      <tr>
                        <td colSpan={4} className="px-0 py-0">
                          <div className="bg-gray-100 px-6 py-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">
                              Sub Topics
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-blue-300">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      Sub Topic
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      Difficulty
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      LeetCode
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      YouTube
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                      Article
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {topic.subTopics.map((subTopic, index) => {
                                    const userStatus = getUserStatus(subTopic);
                                    const statusKey = `${topic._id}-${
                                      subTopic._id || index
                                    }`;
                                    const isUpdating =
                                      updatingStatus.has(statusKey);

                                    return (
                                      <tr
                                        key={subTopic._id || index}
                                        className="hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <div className="text-sm text-gray-900">
                                            {subTopic.subTopic}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              subTopic.difficulty === "Beginner"
                                                ? "bg-green-100 text-green-800"
                                                : subTopic.difficulty ===
                                                  "Intermediate"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {subTopic.difficulty || "easy"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleSubTopicStatus(
                                                topic._id,
                                                subTopic._id || "",
                                                userStatus
                                              );
                                            }}
                                            disabled={isUpdating || !user}
                                            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer border-2 shadow-sm ${
                                              userStatus === "done"
                                                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400 hover:shadow-md active:scale-95"
                                                : "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 hover:border-yellow-400 hover:shadow-md active:scale-95"
                                            } ${
                                              isUpdating || !user
                                                ? "opacity-50 cursor-not-allowed hover:shadow-sm hover:scale-100"
                                                : ""
                                            }`}
                                            title={
                                              user
                                                ? `Click to mark as ${
                                                    userStatus === "pending"
                                                      ? "done"
                                                      : "pending"
                                                  }`
                                                : "Login required"
                                            }
                                          >
                                            {isUpdating ? (
                                              <svg
                                                className="animate-spin h-3 w-3 mr-1"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                              >
                                                <circle
                                                  className="opacity-25"
                                                  cx="12"
                                                  cy="12"
                                                  r="10"
                                                  stroke="currentColor"
                                                  strokeWidth="4"
                                                ></circle>
                                                <path
                                                  className="opacity-75"
                                                  fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                              </svg>
                                            ) : null}
                                            {userStatus}
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          <a
                                            href={
                                              "https://leetcode.com/problems/two-sum/description/"
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            Practice
                                          </a>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          {subTopic.youtubeLink ? (
                                            <a
                                              href={subTopic.youtubeLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              Watch
                                            </a>
                                          ) : (
                                            <span className="text-gray-400 text-sm">
                                              -
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                          {subTopic.articleLink ? (
                                            <a
                                              href={subTopic.articleLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              Read
                                            </a>
                                          ) : (
                                            <span className="text-gray-400 text-sm">
                                              -
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
