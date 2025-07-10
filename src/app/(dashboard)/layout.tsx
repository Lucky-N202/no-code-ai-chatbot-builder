import DashboardShell from "@/components/shared/DashboardShell"; 


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children} {/* Pass the server component (page) as a child to the client shell */}
    </DashboardShell>
  );
}