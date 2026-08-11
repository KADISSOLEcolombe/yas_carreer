import { handler, ok } from "@/server/http";
import { currentUser } from "@/server/auth";
import { readJson } from "@/server/body";
import { chatbotValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { AiService } from "@/server/services/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const { message } = chatbotValidator.parse(await readJson(req));
  const user = await currentUser(req);

  await prisma.chatbotMessage.create({
    data: { userId: user?.id || null, role: "user", content: message },
  });

  const context = user
    ? `role=${user.role}; name=${user.fullName || user.email}`
    : "visiteur non connecté";
  const reply = await AiService.chatbotReply(message, context);

  const assistant = await prisma.chatbotMessage.create({
    data: { userId: user?.id || null, role: "assistant", content: reply },
  });

  return ok({ reply, messageId: assistant.id });
});
