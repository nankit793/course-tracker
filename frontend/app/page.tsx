"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import TopicsTable from "@/components/TopicsTable";
import DifficultyReport from "@/components/DifficultyReport";
import { api, Topic } from "@/lib/api";

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch topics when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      setError(null);
      const data = await api.getTopics();
      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch topics");
      console.error("Error fetching topics:", err);
    } finally {
      setTopicsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading/redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Hello, {user?.name}! You are successfully logged in.
          </p>
          <h2 className="text-4xl font-bold text-gray-800 mb-2 mt-5">
            Welcome, Tack your courses from here.
          </h2>
        </div>

        {/* Topics Table Section */}
        <div className="mb-8">
          <TopicsTable
            topics={topics}
            loading={topicsLoading}
            onTopicUpdate={fetchTopics}
          />
        </div>

        {/* Difficulty Completion Report */}
        {!topicsLoading && topics.length > 0 && (
          <div className="mt-8">
            <DifficultyReport topics={topics} />
          </div>
        )}

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Total Topics
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {topics.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              My Completed
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {user
                ? topics.reduce((count, topic) => {
                    return (
                      count +
                      (topic.subTopics?.filter((st) => st.userStatus === "done")
                        .length || 0)
                    );
                  }, 0)
                : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              My Pending
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {user
                ? topics.reduce((count, topic) => {
                    return (
                      count +
                      (topic.subTopics?.filter(
                        (st) => !st.userStatus || st.userStatus === "pending"
                      ).length || 0)
                    );
                  }, 0)
                : 0}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
