import api from "./axios";

export const getCashflow = async () => {
  const res = await api.get("/analytics/cashflow");
  return res.data;
};

export const getCategoryAnalytics = async () => {
  const res = await api.get("/analytics/category");
  return res.data;
};

export const getUpcomingEMIs = async () => {
  const res = await api.get("/emis/upcoming");
  return res.data;
};

export const getBudgetAlerts = async () => {
  const res = await api.get("/budgets/alerts");
  return res.data;
};
