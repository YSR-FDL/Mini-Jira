import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentTasks from "../../components/dashboard/RecentTasks";
import TaskStatusChart from "../../components/dashboard/TaskStatusChart";
import PriorityChart from "../../components/dashboard/PriorityChart";
import TeamsOverview from "../../components/dashboard/TeamsOverview";
import DashboardSummary from "../../components/dashboard/DashboardSummary";
import { dashboardService } from "../../services/dashboardService";
import "../../styles/Dashboard/dashboard.css";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalMetrics = async () => {
      try {
        const result = await dashboardService.getGlobalMetrics();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch global metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalMetrics();
  }, []);

  return (
    <Layout activeNav="dashboard" pageTitle="Dashboard">
      <div className="dashPage">
        {/* ── Header ── */}
        <DashboardHeader />

        {loading ? (
          <div style={{ padding: "20px", color: "var(--text-color)" }}>Chargement des données...</div>
        ) : data ? (
          <>
            {/* ── Stats Cards Row ── */}
            <StatsCards stats={data.globalStats} />

            {/* ── Row 1 : Charts ── */}
            <div className="dashRow dashRow2Col">
              <TaskStatusChart taskStatusData={data.taskStatusData} />
              <PriorityChart taskPriorityData={data.taskPriorityData} />
            </div>

            {/* ── Row 2 : Recent Tasks (full width) ── */}
            <div className="dashRow" style={{ gridTemplateColumns: "1fr" }}>
              <RecentTasks recentTasks={data.recentTasks} />
            </div>

            {/* ── Row 4 : Sprint + Teams + Contributors ── */}
            <div className="dashRow" style={{ gridTemplateColumns: "1fr 2fr" }}>
              <TeamsOverview myTeams={data.myTeams} />
              <DashboardSummary globalSummary={data.globalSummary} recentProjects={data.recentProjects} />
            </div>
          </>
        ) : (
          <div style={{ padding: "20px", color: "red" }}>Erreur lors du chargement des données.</div>
        )}
      </div>
    </Layout>
  );
}
