import { useUserAvatarPath } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import { memo } from 'react';

import type { BaseAvatarProps } from './BaseAvatar';
import BaseAvatar from './BaseAvatar';

type UserAvatarProps = Omit<BaseAvatarProps, 'url' | 'title'> & {
	nickname: string;
	etag?: string;
	url?: string;
	title?: string;
};

const UserAvatar: FC<UserAvatarProps> = ({ nickname, etag, ...rest }) => {
	const getUserAvatarPath = useUserAvatarPath();
	const { url = getUserAvatarPath(nickname, etag), ...props } = rest;

	return <BaseAvatar url={url} data-username={nickname} title={nickname} {...props} />;
};

export default memo(UserAvatar);
