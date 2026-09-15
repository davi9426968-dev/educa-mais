import path from "node:path";
import { env } from "../config/env";

export const uploadsDir = path.join(process.cwd(), env.UPLOADS_DIR);

/**
 * Único ponto de resolução de URL para arquivos enviados. Em desenvolvimento, os arquivos ficam
 * em disco e são servidos por /uploads. Para trocar por S3/Supabase Storage em produção, basta
 * fazer esta função retornar a URL absoluta do provedor — o restante da aplicação não muda.
 */
export function resolveUploadUrl(filename: string): string {
  return `/uploads/${filename}`;
}
