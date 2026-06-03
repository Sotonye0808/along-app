export async function sendPushNotification(
  userId: string,
  title: string,
  body?: string,
  url?: string,
): Promise<{ sent: number; failed: number }> {
  try {
    const res = await fetch(
      `${process.env.QSTASH_URL ?? "https://qstash.upstash.io"}/api/push/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        },
        body: JSON.stringify({ userId, title, body, url }),
      },
    );
    if (!res.ok) return { sent: 0, failed: 1 };
    const data = await res.json();
    return { sent: data.sent ?? 0, failed: data.failed ?? 0 };
  } catch {
    return { sent: 0, failed: 1 };
  }
}
