import type { ServerMethods } from '@rocket.chat/ddp-client';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Meteor } from 'meteor/meteor';

import { Spotlight } from '../lib/spotlight';

declare module '@rocket.chat/ddp-client' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		spotlight(
			text: string,
			
			usernames?: string[],
			type?: {
				users?: boolean;
				rooms?: boolean;
				mentions?: boolean;
				includeFederatedRooms?: boolean;
			},
			rid?: string,
			name?: string[],
		): {
			rooms: { _id: string; name: string; t: string; uids?: string[] }[];
			users: {
				_id: string;
				status: 'offline' | 'online' | 'busy' | 'away';
				name: string;
				//username: string;
				outside: boolean;
				avatarETag?: string;
				nickname?: string;
			}[];
		};
	}
}

Meteor.methods<ServerMethods>({
	async spotlight(text, usernames = [], type = { users: true, rooms: true, mentions: false, includeFederatedRooms: false }, rid, name = []) {
		const spotlight = new Spotlight();
		const { mentions, includeFederatedRooms } = type;

		console.debug(type);

		if (text.startsWith('#')) {
			type.users = false;
			text = text.slice(1);
		}

		if (text.startsWith('@')) {
			type.rooms = false;
			console.debug("============== started with @ ========");
			text = text.slice(1);
		}

		const { userId } = this;

		console.debug("==========---- Meteor.methods ----- ==========");
		console.debug(type.users);

		return {
			users: type.users ? await spotlight.searchUsers({ userId, rid, text, usernames, mentions ,name}) : [],
			rooms: type.rooms ? await spotlight.searchRooms({ userId, text, includeFederatedRooms }) : [],
		};
	},
});

DDPRateLimiter.addRule(
	{
		type: 'method',
		name: 'spotlight',
		userId(/* userId*/) {
			return true;
		},
	},
	100,
	100000,
);
