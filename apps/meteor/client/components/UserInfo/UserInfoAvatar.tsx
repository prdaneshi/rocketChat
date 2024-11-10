import { UserAvatar } from '@rocket.chat/ui-avatar';
import type { ComponentProps, ReactElement } from 'react';
import React from 'react';

const UserInfoAvatar = ({ nickname, ...props }: ComponentProps<typeof UserAvatar>): ReactElement => (
	<UserAvatar title={nickname} nickname={nickname} size='x332' {...props} />
);

export default UserInfoAvatar;
