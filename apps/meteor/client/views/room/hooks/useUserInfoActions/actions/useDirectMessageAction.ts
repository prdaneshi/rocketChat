import type { IRoom, IUser, ISubscription } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation, usePermission, useRoute, useUserSubscription, useUserSubscriptionByName } from '@rocket.chat/ui-contexts';
import { useMemo } from 'react';

import type { UserInfoAction, UserInfoActionType } from '../useUserInfoActions';

const getShouldOpenDirectMessage = (
	currentSubscription?: ISubscription,
	usernameSubscription?: ISubscription,
	canOpenDirectMessage?: boolean,
	nickname?: IUser['nickname'],
): boolean => {
	const canOpenDm = canOpenDirectMessage || usernameSubscription;
	const directMessageIsNotAlreadyOpen = currentSubscription && currentSubscription.name !== nickname;
	return (canOpenDm && directMessageIsNotAlreadyOpen) ?? false;
};

export const useDirectMessageAction = (user: Pick<IUser, '_id' | 'nickname'>, rid: IRoom['_id']): UserInfoAction | undefined => {
	const t = useTranslation();
	const usernameSubscription = useUserSubscriptionByName(user.nickname ?? '');
	const currentSubscription = useUserSubscription(rid);
	const canOpenDirectMessage = usePermission('create-d');
	const directRoute = useRoute('direct');

	const shouldOpenDirectMessage = getShouldOpenDirectMessage(
		currentSubscription,
		usernameSubscription,
		canOpenDirectMessage,
		user.nickname,
	);

	const openDirectMessage = useMutableCallback(
		() =>
			user.nickname &&
			directRoute.push({
				rid: user.nickname,
			}),
	);

	const openDirectMessageOption = useMemo(
		() =>
			shouldOpenDirectMessage
				? {
						content: t('Direct_Message'),
						icon: 'balloon' as const,
						onClick: openDirectMessage,
						type: 'communication' as UserInfoActionType,
				  }
				: undefined,
		[openDirectMessage, shouldOpenDirectMessage, t],
	);

	return openDirectMessageOption;
};
