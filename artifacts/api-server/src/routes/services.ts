import { Router } from "express";
import { db } from "@workspace/db";
import { servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateServiceBody,
  GetServiceParams,
  UpdateServiceParams,
  UpdateServiceBody,
  DeleteServiceParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/services", async (_req, res) => {
  const services = await db.select().from(servicesTable).orderBy(servicesTable.category, servicesTable.name);
  res.json(services.map(s => ({ ...s, price: Number(s.price) })));
});

router.post("/services", async (req, res) => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [service] = await db.insert(servicesTable).values({ ...parsed.data, price: String(parsed.data.price), active: parsed.data.active ?? true }).returning();
  res.status(201).json({ ...service, price: Number(service.price) });
});

router.get("/services/:id", async (req, res) => {
  const parsed = GetServiceParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, parsed.data.id));
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json({ ...service, price: Number(service.price) });
});

router.patch("/services/:id", async (req, res) => {
  const params = UpdateServiceParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateServiceBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updateData: Record<string, unknown> = { ...body.data };
  if (body.data.price !== undefined) {
    updateData.price = String(body.data.price);
  }
  const [service] = await db
    .update(servicesTable)
    .set(updateData)
    .where(eq(servicesTable.id, params.data.id))
    .returning();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json({ ...service, price: Number(service.price) });
});

router.delete("/services/:id", async (req, res) => {
  const parsed = DeleteServiceParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(servicesTable).where(eq(servicesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
