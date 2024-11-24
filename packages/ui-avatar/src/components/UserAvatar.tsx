import { useUserAvatarPath } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import { memo } from 'react';

import type { BaseAvatarProps } from './BaseAvatar';
import BaseAvatar from './BaseAvatar';

type UserAvatarProps = Omit<BaseAvatarProps, 'url' | 'title'> & {
	username: string;
	etag?: string;
	url?: string;
	title?: string;
};

const UserAvatar: FC<UserAvatarProps> = ({ username , name, etag, ...rest }) => {
	const getUserAvatarPath = useUserAvatarPath();
	const { url = getUserAvatarPath(username, etag), ...props } = rest;

	return <BaseAvatar url={url} data-username={username} title={name} {...props} />; // MAD name  is deprecated
};

export default memo(UserAvatar);
