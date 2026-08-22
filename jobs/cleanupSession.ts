import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

cron.schedule("0 3 * * *", async () => {
  try {
    console.log("開始清除 Session");

    //此為原本做法，但因當前Prisma版本有TimeStamp轉換問題，故捨去。
    // const result = await prisma.session.deleteMany({
    //   where: {
    //     expires_at: {
    //       lt: new Date(),
    //     },
    //   },
    // });

    const deletedCount = await prisma.$executeRaw`
    DELETE
    FROM Session
    WHERE expires_at < NOW()
    `;

    const currentTime = new Date().toLocaleString();

    console.log(`當前時間: ${currentTime} | 清除了 ${deletedCount} 個session`);
  } catch (error) {
    console.error("清除 Session 失敗:", error);
  }
});
