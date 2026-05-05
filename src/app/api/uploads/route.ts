import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {badRequest, json, requireApiUser, unauthorized} from '@/lib/api';

const maxFileSize = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const extensionFor = (type: string) => {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/gif') return 'gif';
  return 'jpg';
};

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorized();
  }

  const formData = await request.formData();
  const files = formData
    .getAll('files')
    .filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return badRequest('请选择要上传的图片');
  }

  if (files.length > 6) {
    return badRequest('一次最多上传 6 张图片');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, {recursive: true});

  const urls: string[] = [];

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return badRequest('仅支持 JPG、PNG、WEBP 或 GIF 图片');
    }

    if (file.size > maxFileSize) {
      return badRequest('单张图片不能超过 5MB');
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${user.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extensionFor(file.type)}`;
    await writeFile(path.join(uploadDir, filename), bytes);
    urls.push(`/uploads/${filename}`);
  }

  return json({ok: true, urls});
}
