'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon, Eye, Handshake, TrendingUp } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useParams } from "next/navigation";

const generateRandomData = (numDays: number) => {
  return Array.from({ length: numDays }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (numDays - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      "Daily Views": Math.floor(Math.random() * 100) + 10,
      "Profile Visits": Math.floor(Math.random() * 40) + 5,
    };
  });
};

const StatCard = ({ title, value, icon, color, delay }: { title: string, value: string, icon: React.ReactNode, color: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`text-${color}-500`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const dailyData = useMemo(() => generateRandomData(7), []);
  const monthlyData = useMemo(() => generateRandomData(30), []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold">Idea Analytics</h1>
        <p className="text-muted-foreground">Detailed insights for your idea (ID: {params.id})</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Views" value="842" icon={<Eye />} color="blue" delay={0.2} />
        <StatCard title="Investor Inquiries" value="15" icon={<Handshake />} color="green" delay={0.3} />
        <StatCard title="Engagement Rate" value="68%" icon={<TrendingUp />} color="purple" delay={0.4} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Views</CardTitle>
            <CardDescription>Number of views your idea has received in the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Legend />
                <Bar dataKey="Daily Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profile Visits" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>A broader look at your idea's performance over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
               <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={3} />
                <YAxis />
                <Tooltip 
                   contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Legend />
                <Bar dataKey="Daily Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <Link href="/entrepreneur/dashboard" className="text-primary hover:underline">
          &larr; Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
