import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PricingRule from "@/models/PricingRule";

// GET all pricing rules, with optional filtering by courtId
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const courtId = searchParams.get("courtId");
  const filter = courtId ? { courtId } : {};
  const rules = await PricingRule.find(filter).sort({ startDayOfWeek: 1, endDayOfWeek: 1, startHour: 1 });
  return NextResponse.json(rules);
}

// POST create new pricing rule
export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  try {
    const rule = await PricingRule.create(data);
    return NextResponse.json(rule, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
