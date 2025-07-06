import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PricingRule from "@/models/PricingRule";

// GET single pricing rule
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const rule = await PricingRule.findById(params.id);
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rule);
}

// PUT update pricing rule
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await req.json();
  try {
    const updated = await PricingRule.findByIdAndUpdate(params.id, data, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE pricing rule
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const deleted = await PricingRule.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
