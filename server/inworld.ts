import {
    InworldClient,
    InworldPacket,
    ServiceError,
    SessionToken,
    status,
} from "@inworld/nodejs-sdk";
import prisma from "./prisma";
import { channels } from "@/utils/ably";
import { User } from "@prisma/client";

const scene = process.env.INWORLD_SCENE!;

type Message = {
    group_id: number;
    content: string;
    user_name: string;
};

export async function createInteraction(message: Message) {
    const { group_id, content, user_name } = message;
    const lines: string[] = [];
    const bot = await createBotAccount();
    channels.chat.typing.publish([group_id], { user: bot });

    const client = new InworldClient()
        .setGenerateSessionToken(() => generateSessionToken(group_id))
        .setConfiguration({
            capabilities: {
                audio: false,
                emotions: false,
                interruptions: false,
            },
            connection: { disconnectTimeout: 5 * 1000 },
        })
        .setScene(scene)
        .setUser({ fullName: user_name })
        .setOnError(handleError(message))
        .setOnMessage(async (packet: InworldPacket) => {
            if (packet.isInteractionEnd()) {
                sendMessage(bot, group_id, lines.join("\n"));
                connection.close();
                return;
            }

            if (packet.isText() && packet.text.final) {
                lines.push(packet.text.text);
                return;
            }
        });

    const connection = client.build();

    await connection.sendText(content);
}

function handleError(message: Message) {
    return async (err: ServiceError) => {
        switch (err.code) {
            case status.ABORTED:
            case status.CANCELLED:
                break;
            case status.FAILED_PRECONDITION:
                await prisma.aISession.delete({
                    where: {
                        group_id: message.group_id,
                    },
                });

                await createInteraction(message);
                break;
            default:
                console.error(`Error: ${err.message}`);
                break;
        }
    };
}

async function sendMessage(bot: User, group_id: number, content: string) {
    const message = await prisma.message.create({
        data: {
            author_id: bot.id,
            content,
            group_id,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    await channels.chat.message_sent.publish([group_id], message);
}

function createBotAccount() {
    return prisma.user.upsert({
        create: {
            id: "shark",
            name: "Shark AI",
            is_ai: true,
        },
        where: {
            id: "shark",
        },
        update: {},
    });
}

async function generateSessionToken(group_id: number) {
    const client = new InworldClient().setApiKey({
        key: process.env.INWORLD_KEY!,
        secret: process.env.INWORLD_SECRET!,
    });
    const token = await client.generateSessionToken();

    const { session_id } = await prisma.aISession.upsert({
        where: {
            group_id,
        },
        create: {
            group_id,
            session_id: token.getSessionId(),
        },
        update: {},
    });

    return new SessionToken({
        expirationTime: token.getExpirationTime(),
        token: token.getToken(),
        type: token.getType(),
        sessionId: session_id,
    });
}