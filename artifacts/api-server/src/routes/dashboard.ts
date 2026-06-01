import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable, clientsTable, servicesTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [{ totalClients }] = await db.select({ totalClients: count() }).from(clientsTable);

  const [{ totalAppointments }] = await db.select({ totalAppointments: count() }).from(appointmentsTable);

  const today = new Date().toISOString().split("T")[0];
  const [{ appointmentsToday }] = await db
    .select({ appointmentsToday: count() })
    .from(appointmentsTable)
    .where(sql`DATE(${appointmentsTable.scheduledAt}) = ${today}`);

  const [{ pendingAppointments }] = await db
    .select({ pendingAppointments: count() })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "pendente"));

  const [{ confirmedAppointments }] = await db
    .select({ confirmedAppointments: count() })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "confirmado"));

  const [{ cancelledAppointments }] = await db
    .select({ cancelledAppointments: count() })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "cancelado"));

  const revenueRows = await db
    .select({ price: servicesTable.price })
    .from(appointmentsTable)
    .innerJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
    .where(eq(appointmentsTable.status, "confirmado"));

  const totalRevenue = revenueRows.reduce((sum, r) => sum + Number(r.price), 0);

  const recentAppointments = await db
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
    .orderBy(sql`${appointmentsTable.scheduledAt} DESC`)
    .limit(5);

  res.json({
    totalClients: Number(totalClients),
    totalAppointments: Number(totalAppointments),
    appointmentsToday: Number(appointmentsToday),
    pendingAppointments: Number(pendingAppointments),
    confirmedAppointments: Number(confirmedAppointments),
    cancelledAppointments: Number(cancelledAppointments),
    totalRevenue,
    recentAppointments: recentAppointments.map(a => ({
      ...a,
      scheduledAt: a.scheduledAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
      servicePrice: Number(a.servicePrice),
    })),
  });
});

export default router;
