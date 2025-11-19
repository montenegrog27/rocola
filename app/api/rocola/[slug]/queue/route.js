export const dynamic = "force-dynamic";
export const revalidate = 0;

import { dbAdmin } from "@/lib/firebaseAdmin";

export async function GET(req, { params }) {
  const { slug } = params;

  const ref = dbAdmin.collection("settings").doc("rocola");
  const snap = await ref.get();

  if (!snap.exists) {
    return Response.json({ queue: [] });
  }

  const data = snap.data();

  // Ordenar la cola por orden de llegada
  const queue = (data.queue || []).sort((a, b) => a.timestamp - b.timestamp);

  return Response.json({ queue });
}