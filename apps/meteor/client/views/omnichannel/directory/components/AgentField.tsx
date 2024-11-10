import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { UserAvatar } from '@rocket.chat/ui-avatar';
import { useEndpoint, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { UserStatus } from '../../../../components/UserStatus';
import AgentInfoDetails from '../../components/AgentInfoDetails';
import Field from '../../components/Field';
import Info from '../../components/Info';
import Label from '../../components/Label';
import { FormSkeleton } from './FormSkeleton';

type AgentFieldProps = {
	agent: IOmnichannelRoom['servedBy'];
	isSmall?: boolean;
};

const AgentField = ({ agent, isSmall = false }: AgentFieldProps) => {
	const t = useTranslation();
	const { nickname = '' } = agent ?? {};
	const getUserInfo = useEndpoint('GET', '/v1/users.info');
	const { data, isLoading } = useQuery(['/v1/users.info', nickname], () => getUserInfo({ nickname }));

	if (isLoading) {
		return <FormSkeleton />;
	}

	const {
		user: { name, status },
	} = data ?? { user: {} };

	const displayName = name || nickname;

	return (
		<Field>
			<Label>{t('Agent')}</Label>
			<Info style={{ display: 'flex' }}>
				<UserAvatar size={isSmall ? 'x28' : 'x40'} title={nickname} nickname={nickname || ''} />
				<AgentInfoDetails mis={isSmall ? 'x8' : 'x10'} name={displayName} shortName={nickname} status={<UserStatus status={status} />} />
			</Info>
		</Field>
	);
};

export default AgentField;
