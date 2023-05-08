import { generateLabels } from "@/lib/handle-images";

export async function GET(request: Request) {

  const newUrl = new URL(request.url);

  const shouldDelete = newUrl.searchParams.get('delete') === "1" ;
  const pdfBuff = await generateLabels(shouldDelete);

  return new Response(pdfBuff)
}