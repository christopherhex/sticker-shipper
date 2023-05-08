import { saveInbox } from "@/lib/handle-images";

export async function POST(request: Request) {

  const formData = await request.formData();

  const fileItem: File = (formData.get("file") as File)


  await saveInbox(fileItem);

  return new Response('Hello, Next.js!')
}
