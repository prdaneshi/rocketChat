import type { IUser } from '@rocket.chat/core-typings';
import { useSetting } from '@rocket.chat/ui-contexts';

import { getUserDisplayName } from '../../lib/getUserDisplayName';

export const useUserDisplayName = ({ name, nickname }: Pick<IUser, 'name' | 'nickname'>): string | undefined => {
	const useRealName = useSetting('UI_Use_Real_Name');

	return getUserDisplayName(name, nickname, !!useRealName);
};
