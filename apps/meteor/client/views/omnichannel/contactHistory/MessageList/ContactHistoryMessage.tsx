import { isQuoteAttachment, type IMessage, type MessageAttachment } from '@rocket.chat/core-typings';
import {
	Message as MessageTemplate,
	MessageLeftContainer,
	MessageContainer,
	MessageBody,
	MessageDivider,
	MessageName,
	MessageUsername,
	MessageTimestamp,
	MessageHeader as MessageHeaderTemplate,
	MessageSystem,
	MessageSystemLeftContainer,
	MessageSystemContainer,
	MessageSystemBlock,
	MessageSystemName,
	MessageSystemBody,
	MessageSystemTimestamp,
} from '@rocket.chat/fuselage';
import { UserAvatar } from '@rocket.chat/ui-avatar';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { memo } from 'react';

import { getUserDisplayName } from '../../../../../lib/getUserDisplayName';
import MessageContentBody from '../../../../components/message/MessageContentBody';
import StatusIndicators from '../../../../components/message/StatusIndicators';
import Attachments from '../../../../components/message/content/Attachments';
import UiKitMessageBlock from '../../../../components/message/uikit/UiKitMessageBlock';
import { useFormatDate } from '../../../../hooks/useFormatDate';
import { useFormatTime } from '../../../../hooks/useFormatTime';
import { useUserCard } from '../../../room/contexts/UserCardContext';

type ContactHistoryMessageProps = {
	message: IMessage;
	sequential: boolean;
	isNewDay: boolean;
	showUserAvatar: boolean;
};

const ContactHistoryMessage = ({ message, sequential, isNewDay, showUserAvatar }: ContactHistoryMessageProps) => {
	const t = useTranslation();
	const { triggerProps, openUserCard } = useUserCard();

	const format = useFormatDate();
	const formatTime = useFormatTime();

	const quotes = message?.attachments?.filter(isQuoteAttachment) || [];

	const attachments = message?.attachments?.filter((attachment: MessageAttachment) => !isQuoteAttachment(attachment)) || [];

	if (message.t === 'livechat-close') {
		return (
			<MessageSystem>
				<MessageSystemLeftContainer>
					{showUserAvatar && (
						<UserAvatar
							url={message.avatar}
							nickname={message.u.nickname}
							size='x18'
							onClick={(e) => openUserCard(e, message.u.nickname)}
							style={{ cursor: 'pointer' }}
							role='button'
							{...triggerProps}
						/>
					)}
				</MessageSystemLeftContainer>
				<MessageSystemContainer>
					<MessageSystemBlock>
						<MessageSystemName data-username={message.u.nickname} data-qa-type='nickname'>
							@{message.u.nickname}
						</MessageSystemName>
						<MessageSystemBody title={message.msg}>{t('Conversation_closed', { comment: message.msg })}</MessageSystemBody>
						<MessageSystemTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageSystemTimestamp>
					</MessageSystemBlock>
				</MessageSystemContainer>
			</MessageSystem>
		);
	}

	return (
		<>
			{isNewDay && <MessageDivider>{format(message.ts)}</MessageDivider>}
			<MessageTemplate isPending={message.temp} sequential={sequential} role='listitem' data-qa='chat-history-message'>
				<MessageLeftContainer>
					{!sequential && message.u.nickname && showUserAvatar && (
						<UserAvatar
							url={message.avatar}
							nickname={message.u.nickname}
							size='x36'
							onClick={(e) => openUserCard(e, message.u.nickname)}
							style={{ cursor: 'pointer' }}
							role='button'
							{...triggerProps}
						/>
					)}
					{sequential && <StatusIndicators message={message} />}
				</MessageLeftContainer>

				<MessageContainer>
					{!sequential && (
						<MessageHeaderTemplate>
							<MessageName title={`@${message.u.nickname}`} data-username={message.u.nickname}>
								{message.alias || getUserDisplayName(message.u.name, message.u.nickname, false)}
							</MessageName>
							<MessageUsername data-username={message.u.nickname} data-qa-type='nickname'>
								@{message.u.nickname}
							</MessageUsername>
							<MessageTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
							<StatusIndicators message={message} />
						</MessageHeaderTemplate>
					)}
					{!!quotes?.length && <Attachments attachments={quotes} />}
					{!message.blocks && message.md && (
						<MessageBody data-qa-type='message-body' dir='auto'>
							<MessageContentBody md={message.md} mentions={message.mentions} channels={message.channels} />
						</MessageBody>
					)}
					{message.blocks && <UiKitMessageBlock rid={message.rid} mid={message._id} blocks={message.blocks} />}
					{!!attachments && <Attachments attachments={attachments} />}
				</MessageContainer>
			</MessageTemplate>
		</>
	);
};

export default memo(ContactHistoryMessage);
