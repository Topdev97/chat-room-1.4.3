import { useMemo } from "react";
import { Group } from "db/schema";
import { useSession } from "next-auth/react";
import { channels } from "../ably/client";
import { Serialize } from "shared/types";
import { createGroup } from "../handlers/realtime/shared";
import { trpc } from ".";

export function useMutationHelpers() {
    const utils = trpc.useContext();
    const { data } = useSession();

    return useMemo(
        () => ({
            utils: utils,
            createGroup: (group: Serialize<Group>) => {
                createGroup(utils, group);
                channels.private.group_created.publish([data!!.user.id], {
                    ...group,
                    last_message: { content: "" },
                    unread_messages: 0,
                });
            },
        }),
        [utils, data]
    );
}
