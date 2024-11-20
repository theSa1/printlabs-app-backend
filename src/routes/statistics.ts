import { Request, Response } from "express";
import { db } from "../lib/db";
import { asyncHandler } from "../lib/async-handler";

export const getStatisticsHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new Error("User not found");
  }

  // show order statistics of last 30 days
  const totalOrders = await db.order.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
  const completedOrders = await db.order.count({
    where: {
      completed: true,
      createdAt: {
        gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
  const canceledOrders = await db.order.count({
    where: {
      canceled: true,
      createdAt: {
        gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
  const totals = await db.order.aggregate({
    _sum: {
      totalCost: true,
      colorPageCount: true,
      bwPageCount: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const last30Days = {
    totalOrders,
    ordersCompleted: completedOrders,
    ordersCanceled: canceledOrders,
    totalCost: (totals._sum.totalCost || 0) / 100,
    totalPagesPrinted:
      (totals._sum.colorPageCount || 0) + (totals._sum.bwPageCount || 0),
  };

  // get graph data for last 7 days
  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
    return date.toISOString().split("T")[0];
  });

  const graphData = days.map((day) => {
    const dayOrders = orders.filter((order) =>
      order.createdAt.toISOString().includes(day)
    );
    const totalCost = dayOrders.reduce(
      (acc, order) => acc + order.totalCost,
      0
    );
    const totalPagesPrinted = dayOrders.reduce(
      (acc, order) => acc + order.colorPageCount + order.bwPageCount,
      0
    );
    const totalOrders = dayOrders.length;

    return {
      day,
      totalOrders,
      totalCost: totalCost / 100,
      totalPagesPrinted,
    };
  });

  res.send({
    error: false,
    data: {
      last30Days,
      graphData,
    },
  });
});
