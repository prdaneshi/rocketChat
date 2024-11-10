import { AvatarContainer } from '@rocket.chat/fuselage';
import type { ComponentProps, HTMLAttributes, ReactElement, VFC } from 'react';

import UserAvatar from './UserAvatar';

type MessageAvatarProps = {
	emoji?: ReactElement;
	avatarUrl?: string;
	nickname: string;
	size?: ComponentProps<typeof UserAvatar>['size'];
} & Omit<HTMLAttributes<HTMLElement>, 'is'>;

const MessageAvatar: VFC<MessageAvatarProps> = ({ emoji, avatarUrl, nickname, size = 'x36', ...props }) => {
	if (emoji) {
		return (
			<AvatarContainer size={size} {...props}>
				{emoji}
			</AvatarContainer>
		);
	}

	return <UserAvatar url={avatarUrl} nickname={nickname} size={size} {...props} />;
};

export default MessageAvatar;
