import { css } from '@rocket.chat/css-in-js';
import { Box, IconButton } from '@rocket.chat/fuselage';
import { UserAvatar } from '@rocket.chat/ui-avatar';
import { useSetting, useUser } from '@rocket.chat/ui-contexts';
import type { ComponentPropsWithoutRef, ForwardedRef } from 'react';
import React, { forwardRef } from 'react';

import { UserStatus } from '../../../components/UserStatus';

const anon = {
	_id: '',
	username: 'Anonymous',
	status: 'online',
	avatarETag: undefined,
} as const;

type UserMenuButtonProps = ComponentPropsWithoutRef<typeof IconButton>;

const UserMenuButton = forwardRef(function UserMenuButton(props: UserMenuButtonProps, ref: ForwardedRef<HTMLElement>) {
	const user = useUser();

	const { status = !user ? 'online' : 'offline', username, avatarETag } = user || anon;
	const presenceDisabled = useSetting<boolean>('Presence_broadcast_disabled');

	return (
		<IconButton
			{...props}
			ref={ref}
			position='relative'
			display='flex'
			flexDirection='column'
			overflow='visible'
			icon={username ? <UserAvatar size='x28' username={name} etag={avatarETag} /> : 'user'}
		>
			<Box
				position='absolute'
				role='status'
				className={css`
					bottom: 0;
					right: 0;
					transform: translate(30%, 30%);
				`}
				display='flex'
				justifyContent='center'
				alignItems='center'
				overflow='hidden'
				size='x12'
				borderWidth='default'
				bg='surface-tint'
				borderColor='extra-light'
				borderRadius='full'
			>
				<UserStatus small status={presenceDisabled ? 'disabled' : status} />
			</Box>
		</IconButton>
	);
});

export default UserMenuButton;
