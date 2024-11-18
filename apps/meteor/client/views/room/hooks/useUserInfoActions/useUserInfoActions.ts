import type { IRoom, IUser } from '@rocket.chat/core-typings';
import type { Icon } from '@rocket.chat/fuselage';
import type { GenericMenuItemProps } from '@rocket.chat/ui-client';
import { useLayoutHiddenActions } from '@rocket.chat/ui-contexts';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';

import { useEmbeddedLayout } from '../../../../hooks/useEmbeddedLayout';
import { useAddUserAction } from './actions/useAddUserAction';
import { useBlockUserAction } from './actions/useBlockUserAction';
import { useCallAction } from './actions/useCallAction';
import { useChangeLeaderAction } from './actions/useChangeLeaderAction';
import { useChangeModeratorAction } from './actions/useChangeModeratorAction';
import { useChangeOwnerAction } from './actions/useChangeOwnerAction';
import { useDirectMessageAction } from './actions/useDirectMessageAction';
import { useIgnoreUserAction } from './actions/useIgnoreUserAction';
import { useMuteUserAction } from './actions/useMuteUserAction';
import { useRedirectModerationConsole } from './actions/useRedirectModerationConsole';
import { useRemoveUserAction } from './actions/useRemoveUserAction';
import { useReportUser } from './actions/useReportUser';

export type UserInfoActionType = 'communication' | 'privileges' | 'management' | 'moderation';

export type UserInfoAction = {
	content: string;
	icon?: ComponentProps<typeof Icon>['name'];
	onClick: () => void;
	type?: UserInfoActionType;
	variant?: 'danger';
};

type UserMenuAction = {
	id: string;
	title: string;
	items: GenericMenuItemProps[];
}[];

export const useUserInfoActions = (
	user: Pick<IUser, '_id' | 'username' | 'name'>,
	rid: IRoom['_id'],
	reload?: () => void,
	size = 2,
	isMember?: boolean,
): { actions: [string, UserInfoAction][]; menuActions: any | undefined } => {
	const addUser = useAddUserAction(user, rid, reload);
	const blockUser = useBlockUserAction(user, rid);
	const changeLeader = useChangeLeaderAction(user, rid);
	const changeModerator = useChangeModeratorAction(user, rid);
	const openModerationConsole = useRedirectModerationConsole(user._id);
	const changeOwner = useChangeOwnerAction(user, rid);
	const openDirectMessage = useDirectMessageAction(user, rid);
	const ignoreUser = useIgnoreUserAction(user, rid);
	const muteUser = useMuteUserAction(user, rid);
	const removeUser = useRemoveUserAction(user, rid, reload);
	const call = useCallAction(user);
	const reportUserOption = useReportUser(user);
	const isLayoutEmbedded = useEmbeddedLayout();
	const { userToolbox: hiddenActions } = useLayoutHiddenActions();

	const userinfoActions = useMemo(
		() => ({
			...(openDirectMessage && !isLayoutEmbedded && { openDirectMessage }),
			...(call && { call }),
			...(!isMember && addUser && { addUser }),
			...(isMember && changeOwner && { changeOwner }),
			...(isMember && changeLeader && { changeLeader }),
			...(isMember && changeModerator && { changeModerator }),
			...(isMember && openModerationConsole && { openModerationConsole }),
			...(isMember && ignoreUser && { ignoreUser }),
			...(isMember && muteUser && { muteUser }),
			...(blockUser && { toggleBlock: blockUser }),
			...(reportUserOption && { reportUser: reportUserOption }),
			...(isMember && removeUser && { removeUser }),
		}),
		[
			openDirectMessage,
			isLayoutEmbedded,
			call,
			changeOwner,
			changeLeader,
			changeModerator,
			ignoreUser,
			muteUser,
			blockUser,
			removeUser,
			reportUserOption,
			openModerationConsole,
			addUser,
			isMember,
		],
	);

	const actionSpread = useMemo(() => {
		const entries = Object.entries(userinfoActions).filter(([key]) => !hiddenActions.includes(key));

		const options = entries.slice(0, size);
		const slicedOptions = entries.slice(size, entries.length);

		const menuActions = slicedOptions.reduce((acc, [_key, item]) => {
			const group = item.type ? item.type : '';
			const section = acc.find((section: { id: string }) => section.id === group);

			const newItem = { ...item, id: item.content };
			if (section) {
				section.items.push(newItem);
				return acc;
			}

			const newSection = { id: group, title: '', items: [newItem] };
			acc.push(newSection);

			return acc;
		}, [] as UserMenuAction);

		return { actions: options, menuActions };
	}, [size, userinfoActions, hiddenActions]);

	return actionSpread;
};
