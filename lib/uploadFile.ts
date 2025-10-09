// import { supabase } from "./supabaseClient";

// export async function uploadFile(file: File, userId: string) {
//   const ext = file.name.split(".").pop();
//   const filePath = `direct-messages/${userId}/${Date.now()}.${ext}`;

//   const { error } = await supabase.storage
//     .from("chat-uploads")
//     .upload(filePath, file);

//   if (error) throw error;

//   return supabase.storage.from("chat-uploads").getPublicUrl(filePath).data
//     .publicUrl;
// }

import { supabase } from "@/lib/supabaseClient";
import logger from "@/app/lib/logger";

export async function uploadFile(folder: string, file: File, userId: string) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("chat-uploads")
    .upload(path, file);

  // if (error) throw error;
  if (error) {
    logger.error({ error }, "Upload error:");
    throw error;
  } else {
  }
  const { data: publicUrl } = supabase.storage
    .from("chat-uploads")
    .getPublicUrl(path);

  return {
    url: publicUrl.publicUrl,
    type: file.type.startsWith("image/")
      ? "IMAGE"
      : file.type.startsWith("video/")
      ? "VIDEO"
      : "FILE",
    fileName: file.name,
  } as const;
}
