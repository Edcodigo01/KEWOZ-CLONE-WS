import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/';
import { userService, type UsersListItem } from '@/services/global/userService';
import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router';

function countryFlag(code: string) {
    const cc = code.toUpperCase();
    return cc.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function RecentUserList() {
    const [users, setUsers] = useState<UsersListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentUsers = async () => {
            try {
                const response = await userService.getUsersList({ page: 1, pageSize: 5, orderBy: 'createdAt', orderDirection: 'DESC' });
                const userData = response.data?.users || [];
                setUsers(userData);
            } catch (error) {
                console.error('Error fetching recent users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentUsers();
    }, []);

    const displayUsers = users.slice(0, 5).map((user: any, index: number) => ({
        sl: index + 1,
        id: Number(user.user_id),
        profile_pic: user.profile_pic || '/assets/Avatar.png',
        fullName: user.full_name || user.user_name || 'Unknown User',
        email: user.email || '',
        countryCode: (user.country_short_name || 'US').toUpperCase(),
        country: user.country || 'United States',
        platform: user.platform || 'Web',
        joinedAt: user.joined_at || new Date().toISOString(),
    }));

    return (
        <Card className="bg-secondary shadow-default h-full rounded-lg border-none  max-w-full mx-auto overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-semibold text-table-header-text">Usuarios Recientes</CardTitle>
                <button
                    onClick={() => {
                        navigate('/users/user-list');
                    }}
                    className="text-sm font-medium  text-table-header-text hover:underline"
                >
                    Ver Todo
                </button>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="p-4 text-center">Cargando...</div>
                ) : displayUsers.length > 0 ? (
                    <div className="overflow-x-auto p-5 border rounded-lg border-table-divider">
                        {/* Header */}
                        <div className="grid grid-cols-5  bg-table-header-bg text-table-header-text text-xs font-medium uppercase rounded-md min-w-[800px]">
                            <div className="px-3  pl-10 py-3 rounded-l-2xl text-sm font-medium text-table-header-text uppercase tracking-wide w-full">N°</div>
                            <div className="px-3 py-3 text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Perfil</div>
                            <div className="px-3 py-3 text-sm font-medium text-table-header-text uppercase tracking-wide w-full">País</div>
                            <div className="px-3 py-3 text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Plataforma</div>
                            <div className="px-3 py-3 rounded-r-2xl text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Registro</div>
                        </div>

                        {/* Body */}
                        <div className="divide-y divide-table-divider min-w-[800px]">
                            {displayUsers.map((user, index) => (
                                <div
                                    key={user.id}
                                    className={`grid grid-cols-5 items-center text-sm bg-table-row over:bg-table-row-hover ${index % 2 === 0 ? "bg-table-row " : "bg-table-row/20 "
                                        }`}
                                >
                                    {/* SL */}
                                    <div className="pl-10 py-3 text-text-muted"># {user.id}</div>

                                    {/* Profile */}
                                    <div className="px- py-3 flex items-center gap-3 text-text-muted">
                                        <img
                                            src={user.profile_pic}
                                            alt={user.fullName}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-text-muted">{user.fullName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="px-3 py-3 flex items-center gap-2 text-text-muted">
                                        <span className="text-lg">{countryFlag(user.countryCode)}</span>
                                        <span>{user.country}</span>
                                    </div>

                                    {/* Platform */}
                                    <div className="px-3 py-3">
                                        {user.platform === "Web" ? (
                                            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium">
                                                Web
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-600 font-medium">
                                                App
                                            </span>
                                        )}
                                    </div>

                                    {/* Joined At */}
                                    <div className="px-3 py-3 text-sm text-text-muted">
                                        {new Date(user.joinedAt).toLocaleDateString("es-ES", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                        <div className="text-xs text-text-muted">
                                            {new Date(user.joinedAt).toLocaleTimeString("es-ES", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : (
                    <div className="p-4 text-center text-text-muted">No hay usuarios recientes</div>
                )}
            </CardContent>

        </Card>
    );
}