import { Router } from "express";
import { db } from "@workspace/db";
import { clientsTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import {
  ListClientsQueryParams,
  CreateClientBody,
  GetClientParams,
  UpdateClientParams,
  UpdateClientBody,
  DeleteClientParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/clients", async (req, res) => {
  const parsed = ListClientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { search } = parsed.data;
  let clients;
  if (search) {
    clients = await db
      .select()
      .from(clientsTable)
      .where(or(ilike(clientsTable.name, `%${search}%`), ilike(clientsTable.cpf, `%${search}%`), ilike(clientsTable.email, `%${search}%`)));
  } else {
    clients = await db.select().from(clientsTable).orderBy(clientsTable.name);
  }
  res.json(clients.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/clients", async (req, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [client] = await db.insert(clientsTable).values(parsed.data).returning();
  res.status(201).json({ ...client, createdAt: client.createdAt.toISOString() });
});

router.get("/clients/:id", async (req, res) => {
  const parsed = GetClientParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, parsed.data.id));
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json({ ...client, createdAt: client.createdAt.toISOString() });
});

router.patch("/clients/:id", async (req, res) => {
  const params = UpdateClientParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateClientBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [client] = await db
    .update(clientsTable)
    .set(body.data)
    .where(eq(clientsTable.id, params.data.id))
    .returning();
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json({ ...client, createdAt: client.createdAt.toISOString() });
});

router.delete("/clients/:id", async (req, res) => {
  const parsed = DeleteClientParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(clientsTable).where(eq(clientsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
