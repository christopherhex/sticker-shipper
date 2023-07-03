import { generateLabels } from "@/lib/handle-images";

export async function GET(request: Request) {

  const newUrl = new URL(request.url);

  const shouldDelete = newUrl.searchParams.get('delete') === "1" ;
  const skipLabels = newUrl.searchParams.get('skipLabels') || '';

  const skipArray = skipLabels.split(",").map(it => Number.parseInt(it.trim()));
  const pdfBuff = await generateLabels(shouldDelete, skipArray);

  return new Response(pdfBuff)
}