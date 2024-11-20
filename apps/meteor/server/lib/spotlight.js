import { Team } from '@rocket.chat/core-services';
import { Users, Subscriptions as SubscriptionsRaw, Rooms } from '@rocket.chat/models';
import { escapeRegExp } from '@rocket.chat/string-helpers';

import { canAccessRoomAsync, roomAccessAttributes } from '../../app/authorization/server';
import { hasPermissionAsync, hasAllPermissionAsync } from '../../app/authorization/server/functions/hasPermission';
import { settings } from '../../app/settings/server';
import { trim } from '../../lib/utils/stringUtils';
import { readSecondaryPreferred } from '../database/readSecondaryPreferred';
import { roomCoordinator } from './rooms/roomCoordinator';

export class Spotlight {
	async fetchRooms(userId, rooms) {
		if (!settings.get('Store_Last_Message') || (await hasPermissionAsync(userId, 'preview-c-room'))) {
			return rooms;
		}

		return rooms.map((room) => {
			delete room.lastMessage;
			return room;
		});
	}

	async searchRooms({ userId, text, includeFederatedRooms = false }) {
		const regex = new RegExp(trim(escapeRegExp(text)), 'i');

		console.debug("========searchRooms==============");

		const roomOptions = {
			limit: 5,
			projection: {
				t: 1,
				name: 1,
				fname: 1,
				teamMain: 1,
				joinCodeRequired: 1,
				lastMessage: 1,
				federated: true,
				prid: 1,
			},
			sort: {
				name: 1,
			},
		};

		if (userId == null) {
			if (!settings.get('Accounts_AllowAnonymousRead')) {
				return [];
			}

			return this.fetchRooms(userId, await Rooms.findByNameAndTypeNotDefault(regex, 'c', roomOptions, includeFederatedRooms).toArray());
		}

		if (!(await hasAllPermissionAsync(userId, ['view-outside-room', 'view-c-room']))) {
			return [];
		}

		const searchableRoomTypeIds = roomCoordinator.searchableRoomTypes();

		const roomIds = (
			await SubscriptionsRaw.findByUserIdAndTypes(userId, searchableRoomTypeIds, {
				projection: { rid: 1 },
			}).toArray()
		).map((s) => s.rid);
		const exactRoom = await Rooms.findOneByNameAndType(text, searchableRoomTypeIds, roomOptions, includeFederatedRooms);
		if (exactRoom) {
			roomIds.push(exactRoom.rid);
		}

		return this.fetchRooms(
			userId,
			await Rooms.findByNameOrFNameAndTypesNotInIds(regex, searchableRoomTypeIds, roomIds, roomOptions, includeFederatedRooms).toArray(),
		);
	}

	mapOutsiders(u) {
		u.outside = true;
		return u;
	}

	processLimitAndUsernames(options, name, users) {
		// Reduce the results from the limit for the next query
		options.limit -= users.length;

		// If the limit was reached, return
		if (options.limit <= 0) {
			return users;
		}

		// Prevent the next query to get the same users
		name.push(...users.map((u) => u.name).filter((u) => !name.includes(u)));
	}


	// MAD changed username to name
	async _searchInsiderUsers({ rid, text, name, options, users, insiderExtraQuery, match = { startsWith: false, endsWith: false } }) {
		// Get insiders first

		console.debug("name=================== " + name );
		console.debug("================== options ============");
		console.debug(options);

		if (rid) {
			const searchFields = settings.get('Accounts_SearchFields').trim().split(',');

			users.push(...(await Users.findByActiveUsersExcept(text, name, options, searchFields, insiderExtraQuery, match).toArray()));

			// If the limit was reached, return
			if (this.processLimitAndUsernames(options, name, users)) {
				return users;
			}
		}
	}


	// MAD username changed to name
	async _searchConnectedUsers(userId, { text, name, options, users, match = { startsWith: false, endsWith: false } }, roomType) {
		const searchFields = settings.get('Accounts_SearchFields').trim().split(',');

		users.push(
			...(
				await SubscriptionsRaw.findConnectedUsersExcept(userId, text, name, searchFields, {}, options.limit || 5, roomType, match, {
					readPreference: options.readPreference,
				})
			).map(this.mapOutsiders),
		);

		// If the limit was reached, return
		if (this.processLimitAndUsernames(options, name, users)) {
			return users;
		}
	}

	async _searchOutsiderUsers({ text, name, options, users, canListOutsiders, match = { startsWith: false, endsWith: false } }) {
		// Then get the outsiders if allowed
		if (canListOutsiders) {
			const searchFields = settings.get('Accounts_SearchFields').trim().split(',');
			users.push(
				...(await Users.findByActiveUsersExcept(text, name, options, searchFields, undefined, match).toArray()).map(this.mapOutsiders),
			);

			// If the limit was reached, return
			if (this.processLimitAndUsernames(options, name, users)) {
				return users;
			}
		}
	}

	mapTeams(teams) {
		return teams.map((t) => {
			t.isTeam = true;
			t.name = t.name;
			t.status = 'online';
			return t;
		});
	}

	async _searchTeams(userId, { text, options, users, mentions }) {
		if (!mentions || settings.get('Troubleshoot_Disable_Teams_Mention')) {
			return users;
		}

		options.limit -= users.length;

		if (options.limit <= 0) {
			return users;
		}

		const teamOptions = { ...options, projection: { name: 1, type: 1 } };
		const teams = await Team.search(userId, text, teamOptions);
		users.push(...this.mapTeams(teams));

		return users;
	}

	async searchUsers({ userId, rid, text, usernames,  mentions ,name}) {  // MAD removing username here lead to username not defined
		const users = [];

		console.debug("=============searchUsers start point - printing usernames ===================");
		console.debug(usernames);


		const options = {
			limit: settings.get('Number_of_users_autocomplete_suggestions'),
			projection: {
				//username: 1,
				nickname: 1,
				name: 1,
				status: 1,
				statusText: 1,
				avatarETag: 1,
			},
			sort: {
				[settings.get('UI_Use_Real_Name') ? 'name' : 'name']: 1,
			},
			readPreference: readSecondaryPreferred(Users.col.s.db),
		};

		console.debug("testing Spotlight ==================1===================== ");

		const room = await Rooms.findOneById(rid, { projection: { ...roomAccessAttributes, _id: 1, t: 1, uids: 1 } });

		if (rid && !room) {
			return users;
		}

		console.debug("testing Spotlight ==================2===================== ");

		const canListOutsiders = await hasAllPermissionAsync(userId, ['view-outside-room', 'view-d-room']);
		const canListInsiders = canListOutsiders || (rid && (await canAccessRoomAsync(room, { _id: userId })));

		const insiderExtraQuery = [];

		if (rid) {
			switch (room.t) {
				case 'd':
					insiderExtraQuery.push({
						_id: { $in: room.uids.filter((id) => id !== userId) },
					});
					break;
				case 'l':
					insiderExtraQuery.push({
						_id: {
							$in: (await SubscriptionsRaw.findByRoomId(room._id).toArray()).map((s) => s.u?._id).filter((id) => id && id !== userId),
						},
					});
					break;
				default:
					insiderExtraQuery.push({
						__rooms: rid,
					});
					break;
			}
		}

		const searchParams = {
			rid,
			text,
			//usernames,
			name,
			options,
			users,
			canListOutsiders,
			insiderExtraQuery,
			mentions,
		};

		console.debug("=================searchParams=================");
		console.debug(searchParams);

		// Exact match for username only
		if (rid && canListInsiders) {
			const exactMatch = await Users.findOneByUsernameAndRoomIgnoringCase(text, rid, {
				projection: options.projection,
				readPreference: options.readPreference,
			});
			if (exactMatch) {
				users.push(exactMatch);
				this.processLimitAndUsernames(options, name, users);
			}
		}

		console.debug("testing Spotlight ==================3===================== ");

		if (users.length === 0 && canListOutsiders && text) {
			const exactMatch = await Users.findOneByUsernameIgnoringCase(text, {
				projection: options.projection,
				readPreference: options.readPreference,
			});
			if (exactMatch) {
				users.push(this.mapOutsiders(exactMatch));
				this.processLimitAndUsernames(options, name, users);
			}
		}

		console.debug("testing Spotlight ==================3.1===================== ");

		if (canListInsiders && rid) {
			// Search for insiders
			console.debug("searchPArams ===================================== ");
			console.debug(searchParams);
			if (await this._searchInsiderUsers(searchParams)) {
				return users;
			}

			console.debug("testing Spotlight ==================3.2===================== ");

			// Search for users that the requester has DMs with
			// if (await this._searchConnectedUsers(userId, searchParams, 'd')) {
			// 	return users;
			// }
			return users;
		}

		console.debug("testing Spotlight ==================4===================== ");

		// If the user can search outsiders, search for any user in the server
		// Otherwise, search for users that are subscribed to the same rooms as the requester
		// if (canListOutsiders) {
		// 	if (await this._searchOutsiderUsers(searchParams)) {
		// 		return users;
		// 	}
		// } else if (await this._searchConnectedUsers(userId, searchParams, 'd')) {
		// 	return users;
		// }
		return users;

		console.debug("testing Spotlight ==================5===================== ");

		if (await this._searchTeams(userId, searchParams)) {
			return users;
		}

		console.debug("testing Spotlight ==================6===================== ");

		return users;
	}
}
