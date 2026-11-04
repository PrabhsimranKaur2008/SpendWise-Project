import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { PageHeader } from "@/components/AppShell";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { byCategory, CATEGORY_COLORS, monthKey, monthTotal, toISO } from "@/lib/finance";
import { useMoney, useStore } from "@/lib/store";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/analytics")({
  head: () => pageMeta("Analytics", "Spending by category plus weekly and monthly patterns."),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { state } = useStore();
  const money = useMoney();
  const [range, setRange] = useState("month");
  const now = new Date();

  const scoped = state.expenses.filter((e) => range === "all" || e.date.startsWith(monthKey(now)));
  const cats = byCategory(scoped);

  const weekly = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(now); end.setDate(end.getDate() - (7 - i) * 7);
    const start = new Date(end); start.setDate(start.getDate() - 6);
    const s = toISO(start), en = toISO(end);
    return {
      week: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      total: state.expenses.filter((e) => e.date >= s && e.date <= en).reduce((a, e) => a + e.amount, 0),
    };
  });
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.toLocaleString("en-IN", { month: "short" }), total: monthTotal(state.expenses, monthKey(d)) };
  });
  const tip = (v: number) => money(v);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Understand where your money goes."
        action={
          <Tabs value={range} onValueChange={setRange}>
            <TabsList><TabsTrigger value="month">This month</TabsTrigger><TabsTrigger value="all">All time</TabsTrigger></TabsList>
          </Tabs>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-soft p-5">
          <h2 className="font-semibold text-lg mb-2">Spending by category</h2>
          {cats.length === 0 ? <p className="py-20 text-center text-muted-foreground">No data yet.</p> : (
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={cats} dataKey="total" nameKey="category" innerRadius={60} outerRadius={110} paddingAngle={3}>
                    {cats.map((c) => <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />)}
                  </Pie>
                  <Tooltip formatter={tip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="card-soft p-5">
          <h2 className="font-semibold text-lg mb-2">Category comparison</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={cats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" fontSize={12} width={95} tickLine={false} axisLine={false} />
                <Tooltip formatter={tip} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                  {cats.map((c) => <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-soft p-5">
          <h2 className="font-semibold text-lg mb-2">Weekly pattern</h2>
          <p className="text-sm text-muted-foreground mb-3">Last 8 weeks</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="week" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} width={50} tickLine={false} axisLine={false} />
                <Tooltip formatter={tip} />
                <Line type="monotone" dataKey="total" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-soft p-5">
          <h2 className="font-semibold text-lg mb-2">Monthly pattern</h2>
          <p className="text-sm text-muted-foreground mb-3">Last 6 months</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} width={50} tickLine={false} axisLine={false} />
                <Tooltip formatter={tip} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="total" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
