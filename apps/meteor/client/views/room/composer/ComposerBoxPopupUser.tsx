import { OptionAvatar, OptionColumn, OptionContent, OptionInput } from '@rocket.chat/fuselage';
import { UserAvatar } from '@rocket.chat/ui-avatar';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import ReactiveUserStatus from '../../../components/UserStatus/ReactiveUserStatus';

export type ComposerBoxPopupUserProps = {
	_id: string;
	system?: boolean;
	outside?: boolean;
	suggestion?: boolean;
	// username: string;
	name?: string;
	nickname?: string;
	status?: string;
	sort?: number;
	variant?: 'small' | 'large';
};

function ComposerBoxPopupUser({ _id, system, name, nickname, outside, suggestion, variant }: ComposerBoxPopupUserProps) {
	const t = useTranslation();

	return (
		<>
			{!system && (
				<>
					<OptionAvatar>
						<UserAvatar size='x28' nickname={"U"} />
					</OptionAvatar>
					<OptionColumn>
						<ReactiveUserStatus uid={_id} />
					</OptionColumn>
					<OptionContent>
						<strong>{name ?? nickname}</strong> {name && name !== nickname && nickname}
						
					</OptionContent>
				</>
			)}

			{system && (
				<OptionContent>
					<strong>{nickname}</strong> {name}
				</OptionContent>
			)}

			{outside && variant === 'large' && (
				<OptionColumn>
					<OptionInput>{t('Not_in_channel')}</OptionInput>
				</OptionColumn>
			)}

			{suggestion && variant === 'large' && (
				<OptionColumn>
					<OptionInput>{t('Suggestion_from_recent_messages')}</OptionInput>
				</OptionColumn>
			)}
		</>
	);
}

export default ComposerBoxPopupUser;
