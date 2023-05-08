import { generateLabels } from "@/lib/handle-images";

export async function GET(request: Request) {
  const pdfBuff = await generateLabels();

  return new Response(pdfBuff)
}
