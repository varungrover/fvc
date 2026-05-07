import { NextResponse } from "next/server";
import { deleteBatch } from "@/lib/db/batches";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  const { id } = await params;

  if (!session || !['franchisor_admin', 'franchisee_admin'].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteBatch(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
