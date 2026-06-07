import React from "react";
import Layout from "../../components/layout/Layout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsCards from "../../components/dashboard/StatsCards";
import RecentTasks from "../../components/dashboard/RecentTasks";
import TaskStatusChart from "../../components/dashboard/TaskStatusChart";
import PriorityChart from "../../components/dashboard/PriorityChart";
import TeamsOverview from "../../components/dashboard/TeamsOverview";
import DashboardSummary from "../../components/dashboard/DashboardSummary";
import "../../styles/Dashboard/dashboard.css";

export default function DashboardPage() {
  return (
    <Layout activeNav="dashboard" pageTitle="Dashboard">
      <div className="dashPage">
        {/* ── Header ── */}
        <DashboardHeader />

        {/* ── Stats Cards Row ── */}
        <StatsCards />

        {/* ── Row 1 : Charts ── */}
        <div className="dashRow dashRow2Col">
          <TaskStatusChart />
          <PriorityChart />
        </div>

        {/* ── Row 2 : Recent Tasks (full width) ── */}
        <div className="dashRow" style={{ gridTemplateColumns: "1fr" }}>
          <RecentTasks />
        </div>


        {/* ── Row 4 : Sprint + Teams + Contributors ── */}
        <div className="dashRow" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <TeamsOverview />
          <DashboardSummary />
        </div>

        {/* ── Row 5 : Global Summary ── */}
        
      </div>
    </Layout>
  );
}
