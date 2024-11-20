import { AvatarContainer } from '@rocket.chat/fuselage';
import type { ComponentProps, HTMLAttributes, ReactElement, VFC } from 'react';

import UserAvatar from './UserAvatar';

type MessageAvatarProps = {
	emoji?: ReactElement;
	avatarUrl?: string;
	name: string;
	size?: ComponentProps<typeof UserAvatar>['size'];
} & Omit<HTMLAttributes<HTMLElement>, 'is'>;

const MessageAvatar: VFC<MessageAvatarProps> = ({ emoji, avatarUrl, name, size = 'x36', ...props }) => {
	if (emoji) {
		return (
			<AvatarContainer size={size} {...props}>
				{emoji}
			</AvatarContainer>
		);
	}

	return <UserAvatar url={avatarUrl} username={name} size={size} {...props} />;   // MAD name is deprecated and can't be used instead of username
};

export default MessageAvatar;
