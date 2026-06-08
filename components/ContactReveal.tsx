export default function ContactReveal({
  label,
  email,
  phone,
}: {
  label: string;
  email?: string | null;
  phone?: string | null;
}) {
  return (
    <details>
      <summary className="cursor-pointer text-blue-600 hover:underline">{label}</summary>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <div>Email: {email || "—"}</div>
        <div>Phone: {phone || "—"}</div>
      </div>
    </details>
  );
}
