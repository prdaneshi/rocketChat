import type { IWebdavAccountIntegration } from '@rocket.chat/core-typings';

export const getWebdavServerName = ({ name, serverURL, username }: Omit<IWebdavAccountIntegration, '_id'>): string =>
	name || `${name}@${serverURL?.replace(/^https?\:\/\//i, '')}`;
