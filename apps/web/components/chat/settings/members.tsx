import { Avatar } from "ui/components/avatar";
import { Button } from "ui/components/button";
import { UserInfo } from "shared/schema/chat";
import { trpc } from "@/utils/trpc";
import { Serialize } from "shared/types";
import { Member } from "db/schema";
import { useSession } from "next-auth/react";
import { UserProfileModal } from "@/components/modal/UserProfileModal";

export default function Members({
    group,
    isAdmin,
}: {
    group: number;
    isAdmin: boolean;
}) {
    const { status, data } = useSession();
    const query = trpc.group.member.get.useQuery(
        { groupId: group },
        { enabled: status === "authenticated" }
    );

    return (
        <div className="flex flex-col gap-3">
            {query.isLoading ? (
                <Skeleton />
            ) : (
                query.data?.map((member) => (
                    <MemberItem
                        key={member.user_id}
                        member={member}
                        canKick={isAdmin && member.user_id !== data?.user.id}
                    />
                ))
            )}
        </div>
    );
}

function Skeleton() {
    return (
        <>
            <div className="h-[44px] rounded-md bg-light-200 dark:bg-dark-800" />
            <div className="h-[44px] rounded-md bg-light-200 dark:bg-dark-800" />
            <div className="h-[44px] rounded-md bg-light-200 dark:bg-dark-800" />
        </>
    );
}

function MemberItem({
    member,
    canKick,
}: {
    member: Serialize<Member & { user: UserInfo }>;
    canKick: boolean;
}) {
    const utils = trpc.useContext();
    const kick = trpc.group.member.kick.useMutation({
        onSuccess(_, { groupId, userId }) {
            utils.group.member.get.setData({ groupId }, (prev) =>
                prev?.filter((member) => member.user_id !== userId)
            );
        },
    });

    return (
        <div className="flex flex-row items-center gap-3">
            <Avatar
                alt="avatar"
                size="medium"
                src={member.user.image}
                fallback={member.user.name}
            />
            <UserProfileModal userId={member.user_id}>
                <p>{member.user.name}</p>
            </UserProfileModal>
            {canKick && (
                <Button
                    color="danger"
                    className="ml-auto"
                    isLoading={kick.isLoading}
                    onClick={() =>
                        kick.mutate({
                            groupId: member.group_id,
                            userId: member.user_id,
                        })
                    }
                >
                    Kick
                </Button>
            )}
        </div>
    );
}