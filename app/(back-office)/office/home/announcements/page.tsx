import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ANNOUNCEMENTS = [
  {
    title: "Welcome to Genero Inventory",
    date: "2026-11-17",
    body: "Your inventory management workspace is ready. Track stock, create orders and invoice your customers — all in one place.",
  },
  {
    title: "Tip: use low stock alerts",
    date: "2026-11-17",
    body: "Set reorder levels on your items and the Low Stock report will show you what needs restocking before you run out.",
  },
];

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col gap-4 px-8 py-6">
      <h2 className="text-2xl font-semibold">Announcements</h2>
      <div className="grid max-w-3xl grid-cols-1 gap-4">
        {ANNOUNCEMENTS.map((a) => (
          <Card key={a.title}>
            <CardHeader>
              <CardTitle className="text-base">{a.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{a.date}</p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {a.body}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
