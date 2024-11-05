import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { escapeHTML } from '@rocket.chat/string-helpers';
import {
	useAllPermissions,
	usePermission,
	useSetModal,
	useToastMessageDispatch,
	useTranslation,
	useUserRoom,
	useUserSubscription,
	useEndpoint,
} from '@rocket.chat/ui-contexts';
import React, { useMemo } from 'react';

import GenericModal from '../../../../../components/GenericModal';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';
import { getRoomDirectives } from '../../../lib/getRoomDirectives';
import type { UserInfoAction, UserInfoActionType } from '../useUserInfoActions';

const getUserIsMuted = (
	user: Pick<IUser, '_id' | 'nickname'>,
	room: IRoom | undefined,
	userCanPostReadonly: boolean,
): boolean | undefined => {
	if (room?.ro) {
		if (Array.isArray(room.unmuted) && room.unmuted.indexOf(user.nickname ?? '') !== -1) {
			return false;
		}

		if (userCanPostReadonly) {
			return Array.isArray(room.muted) && room.muted.indexOf(user.nickname ?? '') !== -1;
		}

		return true;
	}

	return room && Array.isArray(room.muted) && room.muted.indexOf(user.nickname ?? '') > -1;
};

export const useMuteUserAction = (user: Pick<IUser, '_id' | 'nickname'>, rid: IRoom['_id']): UserInfoAction | undefined => {
	const t = useTranslation();
	const room = useUserRoom(rid);
	const userCanMute = usePermission('mute-user', rid);
	const dispatchToastMessage = useToastMessageDispatch();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal(null));
	const otherUserCanPostReadonly = useAllPermissions(
		useMemo(() => ['post-readonly'], []),
		rid,
	);
	const userSubscription = useUserSubscription(rid);

	const isMuted = getUserIsMuted(user, room, otherUserCanPostReadonly);
	const roomName = room?.t && escapeHTML(roomCoordinator.getRoomName(room.t, room));

	if (!room) {
		throw Error('Room not provided');
	}

	const { roomCanMute } = getRoomDirectives({ room, showingUserId: user._id, userSubscription });

	const mutedMessage = isMuted ? 'User__username__unmuted_in_room__roomName__' : 'User__username__muted_in_room__roomName__';

	const muteUser = useEndpoint('POST', isMuted ? '/v1/rooms.unmuteUser' : '/v1/rooms.muteUser');

	const muteUserOption = useMemo(() => {
		const action = (): Promise<void> | void => {
			const onConfirm = async (): Promise<void> => {
				try {
					if (!user.nickname) {
						throw new Error('User without nickname');
					}

					await muteUser({ roomId: rid, username: user.nickname });

					return dispatchToastMessage({
						type: 'success',
						message: t(mutedMessage, {
							username: user.nickname,
							roomName,
						}),
					});
				} catch (error: unknown) {
					dispatchToastMessage({ type: 'error', message: error });
				} finally {
					closeModal();
				}
			};

			if (isMuted) {
				return onConfirm();
			}

			return setModal(
				<GenericModal variant='danger' confirmText={t('Yes_mute_user')} onClose={closeModal} onCancel={closeModal} onConfirm={onConfirm}>
					{t('The_user_wont_be_able_to_type_in_s', roomName)}
				</GenericModal>,
			);
		};

		return roomCanMute && userCanMute
			? {
					content: t(isMuted ? 'Unmute_user' : 'Mute_user'),
					icon: isMuted ? ('mic' as const) : ('mic-off' as const),
					onClick: action,
					type: 'management' as UserInfoActionType,
			  }
			: undefined;
	}, [
		closeModal,
		mutedMessage,
		dispatchToastMessage,
		isMuted,
		muteUser,
		rid,
		roomCanMute,
		roomName,
		setModal,
		t,
		user.nickname,
		userCanMute,
	]);

	return muteUserOption;
};
