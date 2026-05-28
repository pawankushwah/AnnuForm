"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { ArrowLeft, BarChart, FileText, Calendar, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getDaysInMonth, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import LoadingDashboard from "../../loading";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart, Bar } from "recharts";

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: form, isLoading: formLoading } = trpc.forms.get.useQuery({ id });
  const { data: responses, isLoading: responsesLoading } = trpc.forms.getResponses.useQuery({ id });

  // Table specific state
  const [tableFilterAuth, setTableFilterAuth] = useState<"ALL" | "ANONYMOUS" | "REGISTERED">("ALL");
  const [tableDateRange, setTableDateRange] = useState<{ start: string, end: string }>({ start: "", end: "" });
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  // Trend chart specific state
  const [timeView, setTimeView] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [trendDate, setTrendDate] = useState<Date>(new Date());

  // --- Table Logic ---
  const tableResponses = useMemo(() => {
    if (!responses) return [];
    return responses.filter((r: any) => {
      if (tableFilterAuth === "ANONYMOUS" && r.userId) return false;
      if (tableFilterAuth === "REGISTERED" && !r.userId) return false;

      if (tableDateRange.start) {
        if (new Date(r.createdAt) < new Date(tableDateRange.start)) return false;
      }
      if (tableDateRange.end) {
        const end = new Date(tableDateRange.end);
        end.setHours(23, 59, 59, 999);
        if (new Date(r.createdAt) > end) return false;
      }
      return true;
    });
  }, [responses, tableFilterAuth, tableDateRange]);

  // --- Pie Chart Logic ---
  const authStats = useMemo(() => {
    if (!responses) return [];
    let anon = 0;
    let reg = 0;
    responses.forEach((r: any) => {
      if (r.userId) reg++; else anon++;
    });
    return [
      { name: "Anonymous", value: anon, color: "#9ca3af" },
      { name: "Registered", value: reg, color: "#3b82f6" }
    ].filter(s => s.value > 0);
  }, [responses]);

  // --- Trend Chart Logic ---
  const timeData = useMemo(() => {
    if (!responses) return [];
    const counts: Record<string, number> = {};
    
    let start: Date;
    let end: Date;
    
    if (timeView === "DAILY") {
      start = startOfDay(trendDate);
      end = endOfDay(trendDate);
      for (let i = 0; i < 24; i++) {
        counts[format(new Date(start.getTime() + i * 60 * 60 * 1000), "HH:00")] = 0;
      }
    } else if (timeView === "WEEKLY") {
      start = startOfWeek(trendDate, { weekStartsOn: 1 }); // Monday
      end = endOfWeek(trendDate, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        counts[format(new Date(start.getTime() + i * 24 * 60 * 60 * 1000), "EEE")] = 0;
      }
    } else {
      start = startOfMonth(trendDate);
      end = endOfMonth(trendDate);
      const daysInMonth = getDaysInMonth(trendDate);
      for (let i = 1; i <= daysInMonth; i++) {
        counts[i.toString()] = 0;
      }
    }
    
    responses.forEach((r: any) => {
      const d = new Date(r.createdAt);
      if (d >= start && d <= end) {
        if (timeView === "DAILY") {
          const key = format(d, "HH:00");
          counts[key] = (counts[key] ?? 0) + 1;
        } else if (timeView === "WEEKLY") {
          const key = format(d, "EEE");
          counts[key] = (counts[key] ?? 0) + 1;
        } else {
          const key = format(d, "d");
          counts[key] = (counts[key] ?? 0) + 1;
        }
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [responses, timeView, trendDate]);

  const handlePrev = () => {
    if (timeView === "DAILY") setTrendDate(subDays(trendDate, 1));
    else if (timeView === "WEEKLY") setTrendDate(subWeeks(trendDate, 1));
    else setTrendDate(subMonths(trendDate, 1));
  };

  const handleNext = () => {
    if (timeView === "DAILY") setTrendDate(addDays(trendDate, 1));
    else if (timeView === "WEEKLY") setTrendDate(addWeeks(trendDate, 1));
    else setTrendDate(addMonths(trendDate, 1));
  };

  const getTrendDateLabel = () => {
    if (timeView === "DAILY") return format(trendDate, "MMMM d, yyyy");
    if (timeView === "WEEKLY") {
      const start = startOfWeek(trendDate, { weekStartsOn: 1 });
      const end = endOfWeek(trendDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return format(trendDate, "MMMM yyyy");
  };

  if (formLoading || responsesLoading) return <LoadingDashboard />;
  if (!form) return <div className="p-8 text-center text-red-500">Form not found</div>;

  const fields = form.schema?.fields || [];
  const headers = fields.map((f: any) => ({ id: f.id, label: f.label }));

  const totalResponses = responses?.length || 0;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 overflow-auto">
      <div className="h-14 border-b bg-white dark:bg-gray-900 flex items-center px-6 shrink-0 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
            {form.title} <span className="text-gray-400 font-normal">Analytics</span>
          </h1>
          <p className="text-xs text-gray-500">{totalResponses} responses</p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Stats (Global) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Responses</p>
              <h3 className="text-2xl font-bold">{totalResponses}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600">
              <BarChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Completion Rate</p>
              <h3 className="text-2xl font-bold">{totalResponses > 0 ? "100%" : "0%"}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Latest Response</p>
              <h3 className="text-lg font-bold truncate">
                {totalResponses > 0 ? format(new Date(responses![0].createdAt), "MMM d, yyyy") : "None"}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {totalResponses > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trend Chart */}
            <div className="col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-start sm:items-center justify-between mb-6 flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-lg">Response Trends</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <button onClick={handlePrev} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[120px] text-center">{getTrendDateLabel()}</span>
                    <button onClick={handleNext} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
                  <button onClick={() => setTimeView("DAILY")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${timeView === "DAILY" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"}`}>Daily</button>
                  <button onClick={() => setTimeView("WEEKLY")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${timeView === "WEEKLY" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"}`}>Weekly</button>
                  <button onClick={() => setTimeView("MONTHLY")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${timeView === "MONTHLY" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"}`}>Monthly</button>
                </div>
              </div>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  {timeView === "WEEKLY" ? (
                    <RechartsBarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  ) : (
                    <AreaChart data={timeData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow-sm flex flex-col">
              <h3 className="font-semibold text-lg mb-6">User Types</h3>
              <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={authStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {authStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold">{totalResponses}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">Total</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {authStats.map((s, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: s.color }}></div>
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-semibold text-lg">Raw Data</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={tableFilterAuth}
                  onChange={(e) => setTableFilterAuth(e.target.value as any)}
                  className="border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="ALL">All Users</option>
                  <option value="ANONYMOUS">Anonymous</option>
                  <option value="REGISTERED">Registered</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white dark:bg-gray-950 border rounded-md px-2 py-1 shadow-sm">
                <span className="text-gray-500 ml-1">Date:</span>
                <input 
                  type="date" 
                  value={tableDateRange.start}
                  onChange={(e) => setTableDateRange(s => ({ ...s, start: e.target.value }))}
                  className="bg-transparent focus:outline-none" 
                />
                <span className="text-gray-400">to</span>
                <input 
                  type="date" 
                  value={tableDateRange.end}
                  onChange={(e) => setTableDateRange(s => ({ ...s, end: e.target.value }))}
                  className="bg-transparent focus:outline-none" 
                />
                {(tableDateRange.start || tableDateRange.end) && (
                  <button 
                    onClick={() => setTableDateRange({ start: "", end: "" })}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {tableResponses.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <BarChart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No responses match your filters.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 border-b">Date</th>
                    <th className="px-6 py-4 border-b">User</th>
                    {headers.map((h: any) => (
                      <th key={h.id} className="px-6 py-4 border-b max-w-[200px] truncate">{h.label}</th>
                    ))}
                    <th className="px-6 py-4 border-b text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tableResponses.map((res: any) => (
                    <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(res.createdAt), "MMM d, HH:mm")}
                      </td>
                      <td className="px-6 py-4">
                        {res.userId ? (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded dark:bg-blue-900/50 dark:text-blue-300">Registered</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded dark:bg-gray-800 dark:text-gray-300">Anonymous</span>
                        )}
                      </td>
                      {headers.map((h: any) => {
                        const val = res.data[h.id];
                        let displayVal = val;
                        if (Array.isArray(val)) displayVal = val.join(", ");
                        else if (typeof val === 'boolean') displayVal = val ? "Yes" : "No";
                        else if (!val) displayVal = "-";

                        return (
                          <td key={h.id} className="px-6 py-4 max-w-[200px] truncate" title={String(displayVal)}>
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedResponse(res)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Full View Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Response Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="text-sm text-gray-500 mb-6 pb-4 border-b">
              Submitted: {selectedResponse?.createdAt && format(new Date(selectedResponse.createdAt), "MMM d, yyyy h:mm a")}
              <br/>
              User Type: {selectedResponse?.userId ? "Registered User" : "Anonymous"}
            </div>
            
            {headers.map((h: any) => {
              const answer = selectedResponse?.data?.[h.id];
              let displayVal = answer;
              if (Array.isArray(answer)) displayVal = answer.join(", ");
              else if (typeof answer === 'boolean') displayVal = answer ? "Yes" : "No";
              else if (!answer) displayVal = "-";

              return (
                <div key={h.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{h.label}</div>
                  <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-medium">
                    {String(displayVal)}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

