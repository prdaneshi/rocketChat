import type { IDiscussionMessage } from '@rocket.chat/core-typings';
import { Box, Message } from '@rocket.chat/fuselage';
import { MessageAvatar } from '@rocket.chat/ui-avatar';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React, { memo } from 'react';

import Emoji from '../../../../../components/Emoji';
import { clickableItem } from '../../../../../lib/clickableItem';

type DiscussionListItemProps = {
	_id: IDiscussionMessage['_id'];
	msg: ReactNode;
	dcount: number;
	dlm: Date;
	formatDate: (date: Date) => string;
	username: IDiscussionMessage['u']['username'];
	name?: IDiscussionMessage['u']['name'];
	ts: IDiscussionMessage['ts'];
	emoji: IDiscussionMessage['emoji'];
} & Omit<ComponentProps<typeof Box>, 'is'>;

const DiscussionListItem = ({
	_id,
	msg,
	username,
	name = username,
	ts,
	dcount,
	formatDate = (date: any) => date,
	dlm,
	className = [],
	emoji,
	...props
}: DiscussionListItemProps): ReactElement => {
	const t = useTranslation();
	return (
		<Box is={Message} {...props} className={className} pbs={16} pbe={8}>
			<Message.LeftContainer>
				<MessageAvatar emoji={emoji ? <Emoji emojiHandle={emoji} fillContainer /> : undefined} username={username} size='x36' />
			</Message.LeftContainer>
			<Message.Container>
				<Message.Header>
					<Message.Name title={name}>{name}</Message.Name>
					<Message.Timestamp>{formatDate(ts)}</Message.Timestamp>
				</Message.Header>
				<Message.Body clamp={2}>{msg}</Message.Body>
				<Message.Block>
					<Message.Metrics>
						{!dcount && (
							<Message.Metrics.Item>
								<Message.Metrics.Item.Label>{t('No_messages_yet')}</Message.Metrics.Item.Label>
							</Message.Metrics.Item>
						)}
						{!!dcount && (
							<Message.Metrics.Item>
								<Message.Metrics.Item.Icon name='discussion' />
								<Message.Metrics.Item.Label>{dcount}</Message.Metrics.Item.Label>
							</Message.Metrics.Item>
						)}
						{!!dcount && (
							<Message.Metrics.Item>
								<Message.Metrics.Item.Icon name='clock' />
								<Message.Metrics.Item.Label>{formatDate(dlm)}</Message.Metrics.Item.Label>
							</Message.Metrics.Item>
						)}
					</Message.Metrics>
				</Message.Block>
			</Message.Container>
		</Box>
	);
};

export default memo(clickableItem(DiscussionListItem));
