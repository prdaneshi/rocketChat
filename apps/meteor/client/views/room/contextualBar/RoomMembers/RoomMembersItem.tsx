import type { IRoom, IUser } from '@rocket.chat/core-typings';
import {
	Option,
	OptionAvatar,
	OptionColumn,
	OptionDescription,
	OptionMenu,
	OptionContent,
	Icon,
	IconButton,
	OptionSkeleton,
} from '@rocket.chat/fuselage';
import { usePrefersReducedMotion } from '@rocket.chat/fuselage-hooks';
import { UserAvatar } from '@rocket.chat/ui-avatar';
import type { ReactElement, MouseEvent } from 'react';
import React, { useState } from 'react';

import { getUserDisplayNames } from '../../../../../lib/getUserDisplayNames';
import { ReactiveUserStatus } from '../../../../components/UserStatus';
import { usePreventPropagation } from '../../../../hooks/usePreventPropagation';
import UserActions from './RoomMembersActions';

type RoomMembersItemProps = {
	onClickView: (e: MouseEvent<HTMLElement>) => void;
	rid: IRoom['_id'];
	reload: () => void;
	useRealName: boolean;
} & Pick<IUser, 'federated' | 'nickname' | 'name' | '_id'>;

const RoomMembersItem = ({ _id, name, nickname, federated, onClickView, rid, reload, useRealName }: RoomMembersItemProps): ReactElement => {
	const [showButton, setShowButton] = useState();

	const isReduceMotionEnabled = usePrefersReducedMotion();
	const handleMenuEvent = {
		[isReduceMotionEnabled ? 'onMouseEnter' : 'onTransitionEnd']: setShowButton,
	};

	const preventPropagation = usePreventPropagation();

	const [nameOrUsername, displayUsername] = getUserDisplayNames(name, nickname, useRealName);

	return (
		<Option data-username={nickname} data-userid={_id} onClick={onClickView} {...handleMenuEvent}>
			<OptionAvatar>
				<UserAvatar nickname={"U"} size='x28' />
			</OptionAvatar>
			<OptionColumn>{federated ? <Icon name='globe' size='x16' /> : <ReactiveUserStatus uid={_id} />}</OptionColumn>
			<OptionContent data-qa={`MemberItem-${nickname}`}>
				{nameOrUsername} {displayUsername && <OptionDescription>({displayUsername})</OptionDescription>}
			</OptionContent>
			<OptionMenu onClick={preventPropagation}>
				{showButton ? (
					<UserActions username={nickname} name={name} rid={rid} _id={_id} reload={reload} />
				) : (
					<IconButton tiny icon='kebab' />
				)}
			</OptionMenu>
		</Option>
	);
};

export default Object.assign(RoomMembersItem, {
	Skeleton: OptionSkeleton,
});
