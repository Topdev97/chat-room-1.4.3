import { usePageStore } from "@/utils/stores/page";
import { useProfile } from "@/utils/hooks/use-profile";
import { ChevronRightIcon, XIcon, HomeIcon } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar } from "ui/components/avatar";
import { trpc } from "@/utils/trpc";
import { cn } from "ui/utils/cn";
import { groupIcon } from "shared/media/format";
import { DirectMessageContextMenu } from "../menu/DirectMessageMenu";
import { ReactNode } from "react";
import { Spinner } from "ui/components/spinner";

export default function Sidebar() {
  const [isOpen, setOpen] = usePageStore((v) => [
    v.isSidebarOpen,
    v.setSidebarOpen,
  ]);
  const onClose = () => setOpen(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed w-full h-full bg-black/30 md:hidden animate-fade-in z-50"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          "sticky top-0 flex flex-col p-4 pb-0 gap-1 bg-card border-r overflow-x-hidden overflow-y-auto md:h-screen",
          "max-md:fixed max-md:bottom-0 max-md:left-0 max-md:top-0 max-md:w-full max-md:max-w-[20rem] max-md:z-50",
          "max-md:transition-transform max-md:duration-300",
          !isOpen && "max-md:-translate-x-full"
        )}
      >
        <button
          className="bg-background absolute p-1 top-4 right-4 md:hidden"
          onClick={onClose}
        >
          <XIcon className="w-4 h-4" />
        </button>
        <Link href="/info" prefetch={false} className="font-bold mb-2">
          Shark Chat
        </Link>
        <LinkItem
          name="Home"
          route="/home"
          icon={<HomeIcon className="w-4 h-4" />}
        />
        <Nav />
        <BottomCard />
      </aside>
    </>
  );
}

function Nav() {
  const router = useRouter();
  const query = trpc.group.all.useQuery(undefined, { enabled: false });
  const dm = trpc.dm.channels.useQuery(undefined, { enabled: false });

  if (!query.data || !dm.data)
    return (
      <div className="flex items-center justify-center p-2 h-20 bg-accent rounded-xl mt-4">
        <Spinner />
      </div>
    );

  return (
    <div className="mt-4">
      <p className="text-sm mb-2 font-medium px-1">Groups</p>
      {query.data.length === 0 ? (
        <div className="p-2 text-center bg-accent rounded-xl text-sm text-muted-foreground">
          no messages
        </div>
      ) : (
        query.data.map((group) => (
          <SidebarItem
            key={group.id}
            href={`/chat/${group.id}`}
            description={group.last_message?.content}
            active={router.query.group === group.id.toString()}
            image={groupIcon.url([group.id], group.icon_hash)}
            notifications={group.unread_messages}
          >
            {group.name}
          </SidebarItem>
        ))
      )}

      <p className="text-sm mt-4 mb-2 font-medium px-1">Users</p>
      {dm.data.length === 0 ? (
        <div className="p-2 text-center bg-accent rounded-xl text-sm text-muted-foreground">
          no direct messages
        </div>
      ) : (
        dm.data.map((item) => (
          <DirectMessageContextMenu key={item.id} channelId={item.id}>
            <div className="select-none">
              <SidebarItem
                href={`/dm/${item.id}`}
                description={item.last_message?.content}
                active={router.query.channel === item.id}
                image={item.user.image}
                notifications={item.unread_messages}
              >
                {item.user.name}
              </SidebarItem>
            </div>
          </DirectMessageContextMenu>
        ))
      )}
    </div>
  );
}

function LinkItem({
  icon,
  name,
  route,
}: {
  name: string;
  route: string;
  icon: ReactNode;
}) {
  const active = route === useRouter().route;

  return (
    <Link
      href={route}
      className={cn(
        "flex flex-row gap-2 items-center p-1 rounded-lg",
        active ? "bg-accent" : "hover:bg-accent/50 transition-colors"
      )}
    >
      <div className="p-2 border border-border dark:border-dark-700 bg-accent text-brand rounded-lg">
        {icon}
      </div>
      <p
        className={cn(
          "text-sm text-foreground font-medium",
          !active && "text-muted-foreground"
        )}
      >
        {name}
      </p>
    </Link>
  );
}

function SidebarItem({
  active,
  href,
  image,
  description,
  children: name,
  notifications,
}: {
  active: boolean;
  description?: string;
  href: string;
  image: string | null;
  children: string;
  notifications: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "flex flex-row items-center gap-2 p-1 rounded-lg text-sm transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50"
      )}
    >
      <Avatar src={image} fallback={name} size="2sm" rounded="sm" />
      <div className="w-0 flex-1">
        <p className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </p>
        <p className="text-muted-foreground text-xs overflow-hidden text-ellipsis whitespace-nowrap">
          {description}
        </p>
      </div>
      {notifications > 0 && (
        <div className="text-primary-foreground bg-primary text-xs rounded-full px-1.5 py-0.5 ml-auto">
          {notifications}
        </div>
      )}
    </Link>
  );
}

function BottomCard() {
  const { status, profile } = useProfile();
  if (status !== "authenticated") return <></>;

  return (
    <div className="sticky bottom-0 bg-card mt-auto -mx-2 py-2">
      <Link
        href="/settings"
        className={clsx(
          "p-2 rounded-xl flex flex-row items-center group cursor-pointer transition-colors",
          "hover:bg-accent"
        )}
      >
        <div className="flex flex-col flex-shrink-0 max-h-fit mr-3">
          <Avatar
            src={profile.image ?? undefined}
            fallback={profile.name ?? undefined}
            size="2sm"
          />
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="font-medium text-sm">{profile.name}</p>
          <p className="text-muted-foreground text-xs">View Profile</p>
        </div>
        <ChevronRightIcon className="size-4 my-auto text-muted-foreground" />
      </Link>
    </div>
  );
}
