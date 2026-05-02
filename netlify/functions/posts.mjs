import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore({ name: "posts", consistency: "strong" });

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const posts = await Promise.all(
      blobs.map(async ({ key }) => await store.get(key, { type: "json" }))
    );
    const sorted = posts.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
    return Response.json(sorted);
  }

  if (req.method === "POST") {
    const post = await req.json();
    await store.setJSON(post.id, post);
    return Response.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = await req.json();
    await store.delete(id);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/posts" };
