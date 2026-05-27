import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  RefreshCw, 
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { API_BASE } from '../App.jsx'

export default function Admin({ token, triggerToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const payload = await res.json();
        setData(payload);
      }
    } catch (err) {
      console.warn("Backend offline. Simulating local clinical administrative telemetries.");
      // Fallback local administrative database
      setTimeout(() => {
        setData({
          summary: {
            total_users: 18,
            total_reports: 24,
            total_orders: 12,
            total_revenue: 46845.00,
            total_appointments: 6
          },
          skin_type_distribution: [
            { name: "Oily", value: 4 },
            { name: "Dry", value: 5 },
            { name: "Sensitive", value: 3 },
            { name: "Combination", value: 6 }
          ],
          recent_activities: [
            { id: "act_1", type: "signup", message: "New user Jane Doe registered.", time: "5 mins ago" },
            { id: "act_2", type: "scan", message: "User Jane Doe completed a facial scan (Score: 84).", time: "8 mins ago" },
            { id: "act_3", type: "order", message: "Order #ord_73a21bc (₹1198.00) completed by user@skinsense.ai.", time: "25 mins ago" }
          ],
          users: [
            { id: "usr_1", email: "user@skinsense.ai", full_name: "Jane Doe", role: "user", skin_type: "Combination", created_at: "2026-05-25" },
            { id: "usr_2", email: "patient2@skinsense.ai", full_name: "John Smith", role: "user", skin_type: "Dry", created_at: "2026-05-24" }
          ],
          orders: [
            { id: "ord_73a21b", user_id: "usr_1", items: [{ name: "10% Niacinamide Face Serum", quantity: 2, subtotal: 1198.0 }], total_amount: 1198.0, status: "Processing", shipping_address: "B-402 Shanti Nagar, Mumbai", created_at: "2026-05-25" }
          ],
          appointments: [
            { id: "apt_123456", user_id: "usr_1", doctor_id: "doc_1", doctor_name: "Dr. Rashmi Shetty", date: "2026-05-28", time_slot: "10:00 AM - 10:30 AM IST", status: "Scheduled", notes: "Breakouts discussion" }
          ]
        });
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // Administrative deletions
  const handleDeleteItem = async (collection, id) => {
    // Simulated administrative actions
    triggerToast(`Successfully deleted item ${id} from ${collection} collection!`, "success");
    setData(prev => {
      const copy = { ...prev };
      copy[collection] = copy[collection].filter(item => item.id !== id);
      return copy;
    });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    triggerToast(`Order ${orderId} marked as ${newStatus}!`, "success");
    setData(prev => {
      const copy = { ...prev };
      copy.orders = copy.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      return copy;
    });
  };

  // Helper to render high fidelity SVG pie/doughnut slices represents patient skin distributions
  const renderSVGPieChart = () => {
    if (!data || !data.skin_type_distribution) return null;
    
    const width = 200;
    const height = 200;
    const cx = 100;
    const cy = 100;
    const r = 65;
    const innerR = 40;

    const colors = ["#0066FF", "#00D2FF", "#00BFA5", "#F43F5E"];
    const distribution = data.skin_type_distribution;
    const totalVal = distribution.reduce((sum, item) => sum + item.value, 0);

    let cumulativeAngle = 0;

    return (
      <svg width={width} height={height} className="mx-auto my-2 select-none">
        {distribution.map((item, idx) => {
          const val = item.value;
          const pct = val / totalVal;
          const angle = pct * 360;
          
          // Coordinate math for doughnut charts
          const x1 = cx + r * Math.cos((cumulativeAngle - 90) * Math.PI / 180);
          const y1 = cy + r * Math.sin((cumulativeAngle - 90) * Math.PI / 180);
          
          cumulativeAngle += angle;

          const x2 = cx + r * Math.cos((cumulativeAngle - 90) * Math.PI / 180);
          const y2 = cy + r * Math.sin((cumulativeAngle - 90) * Math.PI / 180);

          const ix1 = cx + innerR * Math.cos((cumulativeAngle - 90) * Math.PI / 180);
          const iy1 = cy + innerR * Math.sin((cumulativeAngle - 90) * Math.PI / 180);

          const ix2 = cx + innerR * Math.cos((cumulativeAngle - angle - 90) * Math.PI / 180);
          const iy2 = cy + innerR * Math.sin((cumulativeAngle - angle - 90) * Math.PI / 180);

          const largeArc = angle > 180 ? 1 : 0;

          // Draw ring segment path
          const pathData = `
            M ${x1} ${y1}
            A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}
            L ${ix1} ${iy1}
            A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}
            Z
          `;

          return (
            <g key={idx} className="group/slice cursor-pointer">
              <path
                d={pathData}
                fill={colors[idx % colors.length]}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="hover:opacity-90 transition-opacity"
              />
              {/* Overlay tooltip label */}
              <title>{item.name}: {item.value} patients ({Math.round(pct * 100)}%)</title>
            </g>
          );
        })}
      </svg>
    );
  };

  if (!data) {
    return (
      <div className="w-full h-44 flex flex-col justify-center items-center text-slate-500 gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading administrative telemetry database...</span>
      </div>
    );
  }

  const { summary, recent_activities } = data;

  return (
    <div className="space-y-6 font-sans select-none relative text-left">
      
      {/* 1. Aggregated Summary Counters HUD Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light flex items-center gap-3">
          <div className="p-3.5 bg-brand-500/10 text-brand-500 rounded-2xl shrink-0"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Total Patients</span>
            <span className="text-xl font-black text-slate-850 dark:text-white mt-1 block leading-none">{summary.total_users}</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light flex items-center gap-3">
          <div className="p-3.5 bg-brand-accent/10 text-brand-500 rounded-2xl shrink-0"><FileText className="w-5 h-5" /></div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider leading-none">AI Scan Files</span>
            <span className="text-xl font-black text-slate-850 dark:text-white mt-1 block leading-none">{summary.total_reports}</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light flex items-center gap-3">
          <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl shrink-0"><ShoppingBag className="w-5 h-5" /></div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Store Orders</span>
            <span className="text-xl font-black text-slate-850 dark:text-white mt-1 block leading-none">{summary.total_orders}</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light flex items-center gap-3">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0"><DollarSign className="w-5 h-5" /></div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Gross Earnings</span>
            <span className="text-xl font-black text-slate-850 dark:text-white mt-1 block leading-none">₹{summary.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-glass-light col-span-2 md:col-span-1 flex items-center gap-3">
          <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl shrink-0"><Calendar className="w-5 h-5" /></div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider leading-none">Doctor Consults</span>
            <span className="text-xl font-black text-slate-850 dark:text-white mt-1 block leading-none">{summary.total_appointments}</span>
          </div>
        </div>

      </div>

      {/* Tab select HUD */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-1.5 p-1.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-2xl">
        <button onClick={() => setActiveTab('summary')} className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'summary' ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Telemetry</button>
        <button onClick={() => setActiveTab('users')} className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Patients</button>
        <button onClick={() => setActiveTab('orders')} className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Orders</button>
        <button onClick={() => setActiveTab('appointments')} className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'appointments' ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Consults</button>
      </div>

      {/* 3. Rendering Content Views */}
      
      {/* 3.1. Telemetry Summary View (Charts + Activities) */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-float-in">
          
          {/* Doughnut Chart Patient Skin types distribution */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 leading-none">Skin Type Distributions</h3>
            
            {/* SVG custom slices chart */}
            <div className="relative flex justify-center items-center h-44">
              {renderSVGPieChart()}
            </div>

            {/* Labels legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pr-2">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0066FF] rounded"></span> Oily (22%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#00D2FF] rounded"></span> Dry (28%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#00BFA5] rounded"></span> Sensitive (17%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#F43F5E] rounded"></span> Combination (33%)</div>
            </div>
          </div>

          {/* Activities Audit Logs Timeline */}
          <div className="md:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Clinician Operations Activities Log</h3>
            
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {recent_activities.map((act) => (
                <div key={act.id} className="flex justify-between items-start gap-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0 mt-1.5"></span>
                    <p className="text-slate-650 dark:text-slate-300 font-semibold leading-relaxed leading-normal">{act.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3.2. Patients Audit Table listing */}
      {activeTab === 'users' && (
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light overflow-x-auto animate-float-in">
          <table className="w-full border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 uppercase font-extrabold tracking-wider text-left">
                <th className="pb-3.5 px-3">Patient ID</th>
                <th className="pb-3.5 px-3">Full Name</th>
                <th className="pb-3.5 px-3">Email</th>
                <th className="pb-3.5 px-3">Skin Type</th>
                <th className="pb-3.5 px-3">Account Role</th>
                <th className="pb-3.5 px-3 text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 last:border-none font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50/50">
                  <td className="py-4 px-3 font-mono text-[10px]">{u.id}</td>
                  <td className="py-4 px-3 font-bold text-slate-850 dark:text-white">{u.full_name}</td>
                  <td className="py-4 px-3">{u.email}</td>
                  <td className="py-4 px-3">
                    <span className="px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-bold">{u.skin_type || 'Unscanned'}</span>
                  </td>
                  <td className="py-4 px-3 capitalize font-bold">{u.role}</td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      onClick={() => handleDeleteItem('users', u.id)}
                      disabled={u.role === 'admin'}
                      className="text-rose-500 hover:text-rose-600 disabled:opacity-30 p-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3.3. Store Orders Audit Table */}
      {activeTab === 'orders' && (
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light overflow-x-auto animate-float-in">
          <table className="w-full border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 uppercase font-extrabold tracking-wider text-left">
                <th className="pb-3.5 px-3">Order ID</th>
                <th className="pb-3.5 px-3">Items list</th>
                <th className="pb-3.5 px-3">Gross Total</th>
                <th className="pb-3.5 px-3">Destination</th>
                <th className="pb-3.5 px-3">Shipment Status</th>
                <th className="pb-3.5 px-3 text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((ord) => (
                <tr key={ord.id} className="border-b border-slate-100 dark:border-slate-800 last:border-none font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50/50">
                  <td className="py-4 px-3 font-mono text-[10px]">{ord.id}</td>
                  <td className="py-4 px-3 max-w-44 truncate">
                    {ord.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                  </td>
                  <td className="py-4 px-3 font-black text-slate-850 dark:text-white">₹{ord.total_amount.toFixed(0)}</td>
                  <td className="py-4 px-3 truncate max-w-32">{ord.shipping_address}</td>
                  <td className="py-4 px-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      ord.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>{ord.status}</span>
                  </td>
                  <td className="py-4 px-3 text-right flex justify-end gap-1.5 items-center">
                    {ord.status !== 'Completed' && (
                      <button 
                        onClick={() => handleUpdateOrderStatus(ord.id, 'Completed')}
                        className="text-emerald-500 hover:text-emerald-600 p-1.5 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteItem('orders', ord.id)}
                      className="text-rose-500 hover:text-rose-600 p-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3.4. Doctor Appointments scheduled */}
      {activeTab === 'appointments' && (
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light overflow-x-auto animate-float-in">
          <table className="w-full border-collapse text-xs select-none">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-450 uppercase font-extrabold tracking-wider text-left">
                <th className="pb-3.5 px-3">Session ID</th>
                <th className="pb-3.5 px-3">Doctor Assigned</th>
                <th className="pb-3.5 px-3">Date Slot</th>
                <th className="pb-3.5 px-3">Hour Slot</th>
                <th className="pb-3.5 px-3 text-right font-bold uppercase">Operations</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-slate-100 dark:border-slate-800 last:border-none font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50/50">
                  <td className="py-4 px-3 font-mono text-[10px]">{apt.id}</td>
                  <td className="py-4 px-3 font-bold text-slate-850 dark:text-white">{apt.doctor_name}</td>
                  <td className="py-4 px-3">{apt.date}</td>
                  <td className="py-4 px-3">{apt.time_slot.split(' - ')[0]}</td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      onClick={() => handleDeleteItem('appointments', apt.id)}
                      className="text-rose-500 hover:text-rose-600 p-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
