import Link from 'next/link';
import {AppShell} from '@/components/AppShell';
import {requireUser} from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export default async function RejectedPage() {
  const user = await requireUser();
  const record = await prisma.reviewRecord.findFirst({
    where: {userId: user.id, result: 'REJECTED'},
    orderBy: {createdAt: 'desc'},
  });

  return (
    <AppShell>
      <div className="panel grid">
        <h1>资料审核未通过</h1>
        <p className="subtle">原因：{record?.reason ?? '资料不完整，请修改后重新提交。'}</p>
        <Link className="button" href="/profile/setup">
          修改资料
        </Link>
      </div>
    </AppShell>
  );
}
