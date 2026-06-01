import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, clientsTable, servicesTable } from "@workspace/db";
import { eq, and, sql, ilike, or } from "drizzle-orm";
import {
  ListAppointmentsQueryParams,
  CreateAppointmentBody,
  GetAppointmentParams,
  UpdateAppointmentParams,
  UpdateAppointmentBody,
  DeleteAppointmentParams,
  LookupAppointmentsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function appointmentWithDetails(a: typeof appointmentsTable.$inferSelect & { clientName: string; clientPhone: string | null; clientCpf: string | null; serviceName: string; servicePrice: string | number }) {
  return {
    ...a,
    scheduledAt: a.scheduledAt instanceof Date ? a.scheduledAt.toISOString() : a.scheduledAt,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
    servicePrice: Number(a.servicePrice),
  };
}

router.get("/appointments/lookup", async (req, res) => {
  const parsed = LookupAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { query } = parsed.data;
  const rows = await db
    .select({
      id: appointmentsTable.id,
      clientId: appointmentsTable.clientId,
      serviceId: appointmentsTable.serviceId,
      scheduledAt: appointmentsTable.scheduledAt,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      clientName: clientsTable.name,
      clientPhone: clientsTable.phone,
      clientCpf: clientsTable.cpf,
      serviceName: servicesTable.name,
      servicePrice: servicesTable.price,
    })
    .from(appointmentsTable)
    .innerJoin(clientsTable, eq(appointmentsTable.clientId, clientsTable.id))
    .innerJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(or(ilike(clientsTable.name, `%${query}%`), ilike(clientsTable.cpf, `%${query}%`)))
    .orderBy(sql`${appointmentsTable.scheduledAt} DESC`);
  res.json(rows.map(appointmentWithDetails));
});

router.get("/appointments", async (req, res) => {
  const parsed = ListAppointmentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { clientId, status, date } = parsed.data;
  const conditions = [];
  if (clientId) conditions.push(eq(appointmentsTable.clientId, Number(clientId)));
  if (status) conditions.push(eq(appointmentsTable.status, status));
  if (date) {
    conditions.push(sql`DATE(${appointmentsTable.scheduledAt}) = ${date}`);
  }

  const rows = await db
    .select({
      id: appointmentsTable.id,
      clientId: appointmentsTable.clientId,
      serviceId: appointmentsTable.serviceId,
      scheduledAt: appointmentsTable.scheduledAt,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      clientName: clientsTable.name,
      clientPhone: clientsTable.phone,
      clientCpf: clientsTable.cpf,
      serviceName: servicesTable.name,
      servicePrice: servicesTable.price,
    })
    .from(appointmentsTable)
    .innerJoin(clientsTable, eq(appointmentsTable.clientId, clientsTable.id))
    .innerJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${appointmentsTable.scheduledAt} DESC`);
  res.json(rows.map(appointmentWithDetails));
});

router.post("/appointments", async (req, res) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { clientId, serviceId, scheduledAt, status, notes } = parsed.data;
  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      clientId,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      status: status ?? "pendente",
      notes,
    })
    .returning();

  const [row] = await db
    .select({
      id: appointmentsTable.id,
      clientId: appointmentsTable.clientId,
      serviceId: appointmentsTable.serviceId,
      scheduledAt: appointmentsTable.scheduledAt,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      clientName: clientsTable.name,
      clientPhone: clientsTable.phone,
      clientCpf: clientsTable.cpf,
      serviceName: servicesTable.name,
      servicePrice: servicesTable.price,
    })
    .from(appointmentsTable)
    .innerJoin(clientsTable, eq(appointmentsTable.clientId, clientsTable.id))
    .innerJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(eq(appointmentsTable.id, appointment.id));

  res.status(201).json(appointmentWithDetails(row));
});

router.get("/appointments/:id", async (req, res) => {
  const parsed = GetAppointmentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select({
      id: appointmentsTable.id,
      clientId: appointmentsTable.clientId,
      serviceId: appointmentsTable.serviceId,
      scheduledAt: appointmentsTable.scheduledAt,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      clientName: clientsTable.name,
      clientPhone: clientsTable.phone,
      clientCpf: clientsTable.cpf,
      serviceName: servicesTable.name,
      servicePrice: servicesTable.price,
    })
    .from(appointmentsTable)
    .innerJoin(clientsTable, eq(appointmentsTable.clientId, clientsTable.id))
    .innerJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(eq(appointmentsTable.id, parsed.data.id));

  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(appointmentWithDetails(row));
});

router.patch("/appointments/:id", async (req, res) => {
  const params = UpdateAppointmentParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateAppointmentBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const updateData: Record<string, unknown> = { ...body.data };
  if (body.data.scheduledAt) {
    updateData.scheduledAt = new Date(body.data.scheduledAt);
  }
  await db.update(appointmentsTable).set(updateData).where(eq(appointmentsTable.id, params.data.id));

  const [row] = await db
    .select({
      id: appointmentsTable.id,
      clientId: appointmentsTable.clientId,
      serviceId: appointmentsTable.serviceId,
      scheduledAt: appointmentsTable.scheduledAt,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      clientName: clientsTable.name,
      clientPhone: clientsTable.phone,
      clientCpf: clientsTable.cpf,
      serviceName: servicesTable.name,
      servicePrice: servicesTable.price,
    })
    .from(appointmentsTable)
    .innerJoin(clientsTable, eq(appointmentsTable.clientId, clientsTable.id))
    .innerJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(eq(appointmentsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  res.json(appointmentWithDetails(row));
});

router.delete("/appointments/:id", async (req, res) => {
  const parsed = DeleteAppointmentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(appointmentsTable).where(eq(appointmentsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
