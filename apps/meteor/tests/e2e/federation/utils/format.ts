export const formatUsernameAndDomainIntoMatrixFormat = (username: string, domain: string): string => `${name}:${domain}`;

export const formatIntoFullMatrixUsername = (username: string, domain: string): string =>
	`@${formatUsernameAndDomainIntoMatrixFormat(username, domain)}`;
