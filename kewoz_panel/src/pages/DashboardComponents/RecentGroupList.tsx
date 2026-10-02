import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/';
import { groupService } from '@/services/global/groupService';
import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router';

export function RecentGroupList() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentGroups = async () => {
            try {
                const response = await groupService.getGroupList({
                    page: 1,
                    pageSize: 5,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });
                const groupData = response.data?.chats || [];
                setGroups(groupData);
            } catch (error) {
                console.error('Error fetching recent groups:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentGroups();
    }, []);

    const displayGroups = groups.map((group, index) => ({
        id: group.chat_id,
        sl: index + 1,
        name: group.group_name,
        description: group.group_description || 'Sin descripción',
        members: group.participants?.length || 0,
        icon: group.group_icon || '/assets/Avatar.png',
        createdAt: group.createdAt ? new Date(group.createdAt).toLocaleString() : 'N/A',
        isBlocked: group.is_group_blocked
    }));

    return (
        <Card className="bg-secondary shadow-default h-full rounded-lg  border-none max-w-full mx-auto overflow-auto">
            <CardHeader className="flex flex-row justify-between items-center pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-semibold text-table-header-text">Grupos Recientes</CardTitle>
                <button
                    onClick={() => {
                        navigate('/groups/group-list');
                    }}
                    className="text-sm font-medium text-table-header-text hover:underline">
                    Ver Todo
                </button>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="p-4 text-center">Cargando grupos...</div>
                ) : displayGroups.length > 0 ? (
                    <div className="overflow-x-auto p-5 border rounded-2xl border-table-divider">
                        {/* Header */}
                        <div className="grid grid-cols-4 bg-table-header-bg text-table-header-text text-xs font-medium uppercase rounded-md min-w-[600px]">
                            {/* <div className="px-3 py-3 rounded-l-2xl">S.L</div> */}
                            <div className="px-3 pl-10 py-3 text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Imagen</div>
                            <div className="px-3 py-3 text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Nombre</div>
                            <div className="px-3 py-3 text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Creación</div>
                            <div className="px-4 py-3 rounded-r-2xl text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Miembros</div>
                        </div>

                        {/* Body */}
                        <div className="divide-y divide-table-divider min-w-[600px]">
                            {displayGroups.map((group, index) => (
                                <div
                                    key={group.id}
                                    className={`grid grid-cols-4 items-center text-sm ${index % 2 === 0 ? 'bg-table-row' : 'bg-table-row/20'}`}
                                >
                                    {/* SL */}
                                    {/* <div className="px-3 py-3 text-text-muted"># {group.sl}</div> */}

                                    {/* Group */}
                                    <div className="px-3 pl-10 py-3 flex items-center gap-3">
                                        <img
                                            src={group.icon}
                                            alt={group.name}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />

                                    </div>

                                    {/* Name */}
                                    <div className="px-3 py-3 text-sm text-text-muted line-clamp-1">
                                        {group.name}
                                    </div>



                                    {/* Created At */}
                                    <div className="px-3 py-3 text-sm text-text-muted">
                                        {group.createdAt}
                                    </div>
                                    {/* Members */}
                                    <div className="px-3 py-3">
                                        <span className="px-2 py-1 text-xs text-text-muted rounded-full ">
                                            {group.members}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-text-muted">No hay grupos</div>
                )}
            </CardContent>
        </Card>
    );
}