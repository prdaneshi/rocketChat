import { UserAvatar } from '@rocket.chat/ui-avatar';
import type { ComponentProps, ReactElement } from 'react';
import React from 'react';

const UserInfoAvatar = ({ username, name, ...props }: ComponentProps<typeof UserAvatar>): ReactElement => (
	<UserAvatar title={name} username={username} size='x332' {...props} />
);

export default UserInfoAvatar;
