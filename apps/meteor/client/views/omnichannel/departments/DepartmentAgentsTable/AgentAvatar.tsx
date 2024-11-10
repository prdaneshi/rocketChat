import { Box } from '@rocket.chat/fuselage';
import { useMediaQuery } from '@rocket.chat/fuselage-hooks';
import { UserAvatar } from '@rocket.chat/ui-avatar';
import React, { memo } from 'react';

const AgentAvatar = ({ name, nickname, eTag }: { name: string; nickname: string; eTag?: string }) => {
	const mediaQuery = useMediaQuery('(min-width: 1024px)');

	return (
		<Box display='flex' alignItems='center'>
			<UserAvatar size={mediaQuery ? 'x28' : 'x40'} title={nickname} nickname={nickname} etag={eTag} />
			<Box display='flex' withTruncatedText mi={8}>
				<Box display='flex' flexDirection='column' alignSelf='center' withTruncatedText>
					<Box fontScale='p2m' withTruncatedText color='default'>
						{name || nickname}
					</Box>
					{!mediaQuery && name && (
						<Box fontScale='p2' color='hint' withTruncatedText>
							{' '}
							{`@${nickname}`}{' '}
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default memo(AgentAvatar);
