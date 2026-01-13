import { useEffect, useState, useCallback } from "react"; // Added useCallback
import { getCashflow, getCategoryAnalytics, getUpcomingEMIs, getBudgetAlerts } from "../api/analytics";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  LogOut, 
  AlertTriangle, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PlusCircle // Added missing import
} from "lucide-react";
import AddTransactionModal from "../components/AddTransactions"; // Ensure path is correct

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function Dashboard() {
  const [cashflow, setCashflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [emis, setEmis] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Move fetchData outside useEffect so it's accessible everywhere
  const fetchData = useCallback(async () => {
    try {
      const [cash, categories, emiData, alerts] = await Promise.all([
        getCashflow(),
        getCategoryAnalytics(),
        getUpcomingEMIs(),
        getBudgetAlerts()
      ]);
      setCashflow(cash);
      setCategoryData(categories);
      setEmis(emiData);
      setBudgetAlerts(alerts);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Now refreshData can correctly call fetchData
  const refreshData = () => {
    setLoading(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const chartData = categoryData.map((item) => ({
    name: item._id,
    value: item.total
  }));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 font-medium">Updating your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Financial Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        
        {/* Integrated Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <PlusCircle size={20} />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard
          title="Total Income"
          value={cashflow?.income}
          icon={<TrendingUp className="text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <SummaryCard
          title="Total Expenses"
          value={cashflow?.expense}
          icon={<TrendingDown className="text-rose-600" />}
          bgColor="bg-rose-50"
        />
        <SummaryCard
          title="Net Balance"
          value={cashflow?.net}
          icon={<Wallet className="text-blue-600" />}
          bgColor="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Spending by Category</h2>
          <div className="h-[350px] w-full"> {/* Fixed height for chart */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & EMIs Section */}
        <div className="space-y-8">
          {/* Budget Alerts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-amber-500" size={20} />
              <h2 className="text-xl font-bold text-gray-800">Budget Alerts</h2>
            </div>
            {budgetAlerts.length === 0 ? (
              <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-center">
                🎉 All budgets are under control.
              </div>
            ) : (
              <div className="space-y-3">
                {budgetAlerts.map((alert, index) => (
                  <div key={index} className="flex flex-col p-4 bg-rose-50 border border-rose-100 rounded-xl">
                    <span className="font-bold text-rose-700 capitalize text-sm">{alert.category} exceeded!</span>
                    <div className="flex justify-between text-xs mt-1 text-rose-600 font-medium">
                      <span>Limit: ₹{alert.limit}</span>
                      <span>Spent: ₹{alert.spent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming EMIs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-500" size={20} />
              <h2 className="text-xl font-bold text-gray-800">Upcoming EMIs</h2>
            </div>
            {emis.length === 0 ? (
              <div className="text-gray-400 text-sm bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-center">
                No upcoming payments found.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {emis.map((emi) => (
                  <div key={emi._id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center transition-all hover:bg-slate-50 rounded-lg px-2 -mx-2">
                    <div>
                      <p className="font-semibold text-gray-800">{emi.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        Due: {new Date(emi.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">₹{emi.amount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={refreshData}
      />
    </div>
  );
}

// Summary Card Sub-component
function SummaryCard({ title, value, icon, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-1">
          <span className="text-gray-400 text-lg">₹</span>
          {value?.toLocaleString('en-IN') || 0}
        </h3>
      </div>
      <div className={`p-4 rounded-2xl ${bgColor}`}>
        {icon}
      </div>
    </div>
  );
}

export default Dashboard;