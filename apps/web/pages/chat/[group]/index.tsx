import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../_app";
import { BookmarkIcon, SettingsIcon } from "lucide-react";
import { ChannelSendbar } from "@/components/chat/ChannelSendbar";
import { MessageList } from "@/components/chat/MessageList";
import { trpc } from "@/utils/trpc";
import { BreadcrumbItem } from "@/components/layout/GroupBreadcrumb";
import { ChatViewProvider } from "@/components/chat/ChatView";
import { Navbar } from "@/components/layout/Navbar";
import { AppLayout, Content } from "@/components/layout/app";
import { useViewScrollController } from "ui/hooks/use-bottom-scroll";
import Link from "next/link";
import { button } from "ui/components/button";

const GroupChat: NextPageWithLayout = () => {
  const channel_id = useChannelId();

  if (channel_id == null) return <></>;

  return (
    <MessageList
      key={channel_id}
      channelId={channel_id}
      welcome={<Welcome />}
    />
  );
};

function Welcome() {
  return (
    <div className="flex flex-col mb-8 bg-gradient-to-b from-brand-500/10 -mx-4 p-4">
      <BookmarkIcon className="size-10 bg-brand p-2 mb-2 md:size-14 md:p-3 rounded-full text-accent-50" />
      <h1 className="text-lg md:text-xl font-bold">
        The beginning of this story
      </h1>
      <p className="text-accent-800 dark:text-accent-600 text-sm">
        Let&apos;s send your messages here!
      </p>
    </div>
  );
}

GroupChat.useLayout = (children) => {
  const router = useRouter();
  const controller = useViewScrollController();

  return (
    <AppLayout>
      <Navbar
        breadcrumb={[
          {
            id: "group",
            text: <BreadcrumbItem />,
          },
        ]}
      >
        <Link
          href={`/chat/${router.query.group}/settings`}
          className={button({
            size: "icon",
            color: "ghost",
          })}
        >
          <SettingsIcon className="w-5 h-5" />
        </Link>
      </Navbar>

      <Content>
        <ChatViewProvider value={controller}>{children}</ChatViewProvider>
      </Content>
      <Sendbar />
    </AppLayout>
  );
};

function Sendbar() {
  const id = useChannelId();

  if (id == null) return <></>;
  return <ChannelSendbar channelId={id} />;
}

function useChannelId() {
  const group_id = useRouter().query.group;
  const query = trpc.group.all.useQuery(undefined, { enabled: false });
  const group = query.data?.find((group) => group.id === Number(group_id));

  return group?.channel_id ?? null;
}

export default GroupChat;
