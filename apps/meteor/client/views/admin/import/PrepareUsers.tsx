import { CheckBox, Table, Tag, Pagination, TableHead, TableRow, TableCell, TableBody } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import React, { useState, useCallback } from 'react';

import type { UserDescriptor } from './UserDescriptor';

type PrepareUsersProps = {
	usersCount: number;
	users: UserDescriptor[];
	setUsers: Dispatch<SetStateAction<UserDescriptor[]>>;
};

// TODO: review inner logic
const PrepareUsers = ({ usersCount, users, setUsers }: PrepareUsersProps) => {
	const t = useTranslation();
	const [current, setCurrent] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState<25 | 50 | 100>(25);
	const showingResultsLabel = useCallback(
		({ count, current, itemsPerPage }) => t('Showing_results_of', current + 1, Math.min(current + itemsPerPage, count), count),
		[t],
	);
	const itemsPerPageLabel = useCallback(() => t('Items_per_page:'), [t]);

	return (
		<>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell width='x36'>
							<CheckBox
								checked={usersCount > 0}
								indeterminate={usersCount > 0 && usersCount !== users.length}
								onChange={(): void => {
									setUsers((users) => {
										const hasCheckedDeletedUsers = users.some(({ is_deleted, do_import }) => is_deleted && do_import);
										const isChecking = usersCount === 0;

										if (isChecking) {
											return users.map((user) => ({ ...user, do_import: true }));
										}

										if (hasCheckedDeletedUsers) {
											return users.map((user) => (user.is_deleted ? { ...user, do_import: false } : user));
										}

										return users.map((user) => ({ ...user, do_import: false }));
									});
								}}
							/>
						</TableCell>
						<TableCell is='th'>{t('Username')}</TableCell>
						<TableCell is='th'>{t('Email')}</TableCell>
						<TableCell is='th'></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{users.slice(current, current + itemsPerPage).map((user) => (
						<TableRow key={user.user_id}>
							<TableCell width='x36'>
								<CheckBox
									checked={user.do_import}
									onChange={(event: ChangeEvent<HTMLInputElement>): void => {
										const { checked } = event.currentTarget;
										setUsers((users) => users.map((_user) => (_user === user ? { ..._user, do_import: checked } : _user)));
									}}
								/>
							</TableCell>
							<TableCell>{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell align='end'>{user.is_deleted && <Tag variant='danger'>{t('Deleted')}</Tag>}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Pagination
				current={current}
				itemsPerPage={itemsPerPage}
				count={users.length || 0}
				onSetItemsPerPage={setItemsPerPage}
				onSetCurrent={setCurrent}
				itemsPerPageLabel={itemsPerPageLabel}
				showingResultsLabel={showingResultsLabel}
			/>
		</>
	);
};

export default PrepareUsers;
