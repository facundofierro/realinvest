import DashboardPage from "@/components/pages/dashboard-page";
import { getDashboardProjects } from "@/lib/api";

export default async function Page() {
  const projects = await getDashboardProjects();
  
  return <DashboardPage projects={projects} />;
}