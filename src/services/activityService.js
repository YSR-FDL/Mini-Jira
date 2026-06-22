import axios from "axios";

const API_BASE_URL = "http://localhost:8080/Backend_PFA";

export const activityService = {
  getProjectActivities: async (projectId, limit = 20) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GetProjectActivities?projectId=${projectId}&limit=${limit}`,
      );
      if (response.data && response.data.activities) {
        return response.data.activities;
      }
      return [];
    } catch (error) {
      console.error("Error fetching project activities:", error);
      throw error;
    }
  },

  getTaskActivities: async (taskId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/GetTaskActivities?taskId=${taskId}`,
      );
      if (response.data && response.data.activities) {
        return response.data.activities;
      }
      return [];
    } catch (error) {
      console.error("Error fetching task activities:", error);
      throw error;
    }
  },
};
