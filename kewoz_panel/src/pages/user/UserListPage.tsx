import { DataTable, type DataTableColumn, Input, Button, Toggle } from '@/components/ui';
import { useEffect, useState, useRef } from 'react';
import { userService, type UsersListItem } from '@/services/global/userService';
import { Breadcrumb } from '@/layouts';
import { Search, Plus, Check, X, Loader, Trash2 } from 'lucide-react';
import { useDemoGuard } from '@/utils/demoGuard';
import { Modal } from '@/components/ui/Modal';
import Select from 'react-select';
import countryList from 'react-select-country-list';

type Platform = 'App' | 'Web';
type Status = 'Online' | 'Offline';

type UserRow = {
  id: number;
  profile_pic: string;
  fullName: string;
  emailMasked: string;
  username: string;
  mobileNum: string;
  countryCode: string;
  countryShortName: string;
  country: string;
  joinedAt: string;
  platform: Platform;
  reportCounts: number;
  status: Status;
  is_blocked: boolean;
  is_admin_otp_user: boolean;
};

const PROTECTED_USER_IDS = [26];

function CountryFlag({ code }: { code: string }) {
  const cc = code.toUpperCase();
  if (!cc || cc.length !== 2) return null;
  return (
    <img
      src={`https://flagcdn.com/w20/${cc.toLowerCase()}.png`}
      alt={cc}
      className="inline-block w-5 h-[13px] rounded-sm object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

const mockRows: UserRow[] = [];

const ISO_TO_PHONE: Record<string, string> = {
  '+93': 'AF', '+355': 'AL', '+213': 'DZ', '+376': 'AD', '+244': 'AO', '+54': 'AR',
  '+374': 'AM', '+61': 'AU', '+43': 'AT', '+994': 'AZ', '+973': 'BH', '+880': 'BD',
  '+375': 'BY', '+32': 'BE', '+591': 'BO', '+387': 'BA', '+55': 'BR', '+359': 'BG',
  '+855': 'KH', '+237': 'CM', '+1': 'CA', '+56': 'CL', '+86': 'CN', '+57': 'CO',
  '+506': 'CR', '+385': 'HR', '+53': 'CU', '+357': 'CY', '+420': 'CZ', '+45': 'DK',
  '+1-809': 'DO', '+593': 'EC', '+20': 'EG', '+503': 'SV', '+372': 'EE', '+251': 'ET',
  '+358': 'FI', '+33': 'FR', '+995': 'GE', '+49': 'DE', '+233': 'GH', '+30': 'GR',
  '+502': 'GT', '+509': 'HT', '+504': 'HN', '+36': 'HU', '+354': 'IS', '+91': 'IN',
  '+62': 'ID', '+98': 'IR', '+964': 'IQ', '+353': 'IE', '+972': 'IL', '+39': 'IT',
  '+81': 'JP', '+962': 'JO', '+7': 'KZ', '+254': 'KE', '+965': 'KW', '+856': 'LA',
  '+371': 'LV', '+961': 'LB', '+218': 'LY', '+423': 'LI', '+370': 'LT', '+352': 'LU',
  '+389': 'MK', '+60': 'MY', '+960': 'MV', '+356': 'MT', '+52': 'MX', '+373': 'MD',
  '+377': 'MC', '+976': 'MN', '+382': 'ME', '+212': 'MA', '+95': 'MM', '+264': 'NA',
  '+977': 'NP', '+31': 'NL', '+64': 'NZ', '+505': 'NI', '+234': 'NG', '+47': 'NO',
  '+968': 'OM', '+92': 'PK', '+507': 'PA', '+595': 'PY', '+51': 'PE', '+63': 'PH',
  '+48': 'PL', '+351': 'PT', '+974': 'QA', '+40': 'RO', '+7': 'RU', '+966': 'SA',
  '+221': 'SN', '+381': 'RS', '+65': 'SG', '+421': 'SK', '+386': 'SI', '+27': 'ZA',
  '+82': 'KR', '+34': 'ES', '+94': 'LK', '+249': 'SD', '+46': 'SE', '+41': 'CH',
  '+963': 'SY', '+886': 'TW', '+992': 'TJ', '+255': 'TZ', '+66': 'TH', '+228': 'TG',
  '+216': 'TN', '+90': 'TR', '+993': 'TM', '+256': 'UG', '+380': 'UA', '+971': 'AE',
  '+44': 'GB', '+1': 'US', '+598': 'UY', '+998': 'UZ', '+58': 'VE', '+84': 'VN',
  '+967': 'YE', '+260': 'ZM', '+263': 'ZW',
};

const ISO_TO_PHONE_MAP: Record<string, string> = {};
for (const [phone, iso] of Object.entries(ISO_TO_PHONE)) {
  if (iso.length === 2) {
    ISO_TO_PHONE_MAP[iso] = phone;
  }
}

const countryOptions = countryList().getData().map(c => ({
  value: c.value,
  label: c.label,
  code: c.value,
  phone_code: ISO_TO_PHONE_MAP[c.value] || '',
}));

countryOptions.sort((a, b) => a.label.localeCompare(b.label));
countryOptions.unshift({ value: '', label: 'Selecciona un país...', code: '', phone_code: '' });

const PHONE_PREFIX = '01';

const BACKEND_ORIGIN = (import.meta.env["VITE_API_URL"] === "/api"
  ? "http://localhost:3047"
  : "").replace(/\/api\/?$/, "");

const buildMediaUrl = (path?: string | null): string => {
  if (!path) return '/assets/Avatar.png';
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${clean}`;
};

export default function DashboardUserListPage() {
  const [rows, setRows] = useState<UserRow[]>(mockRows);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(4);
  const { checkDemo } = useDemoGuard();

  // Add user modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', user_name: '', phoneDigits: '' });
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [avatars, setAvatars] = useState<any[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'male' | 'female'>('all');
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string>('');
  const customImageRef = useRef<HTMLInputElement>(null);

  // Delete user modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const columnFieldMap: Record<number, string> = {
    2: 'user_name',
    4: 'createdAt',
  };

  const columns: Array<DataTableColumn<UserRow>> = [
  {
    header: 'ID',
    cell: (r) => (
      <span className="text-primary-600">#{r.id}</span>
    ),
    className: 'w-24',
  },
  {
    header: 'Nombre Completo',
    cell: (r) => (
      <div className="flex items-center gap-3">
        <img src={buildMediaUrl(r.profile_pic)} className="h-8 w-8 rounded-full" alt="avatar" />
        <div>
          <div className="text-table-text text-sm font-medium flex items-center gap-1.5">
            {r.fullName}
            {r.is_admin_otp_user && (
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-700 border border-blue-200" title="Usuario creado por admin - OTP 123456">
                Test
              </span>
            )}
          </div>
          <div className="text-xs text-text-muted">{r.emailMasked}</div>
        </div>
      </div>
    ),
  },
  {
    header: 'Usuario',
    accessor: 'username',
    sortable: true,
  },
  {
    header: 'Teléfono',
    cell: (r) => {
      if (!r.mobileNum) return <span className="text-sm text-text-muted">-</span>;
      const code = r.countryCode || '';
      const num = r.mobileNum || '';
      return (
        <span className="text-sm text-table-text">
          {code ? `${code} ` : ''}{num.slice(0, 2)} {num.slice(2)}
        </span>
      );
    },
  },
  {
    header: 'País',
    cell: (r) => (
      <div className="inline-flex items-center gap-2">
        <CountryFlag code={r.countryShortName} />
        <span className="text-sm text-table-text">{r.country}</span>
      </div>
    ),
  },
  {
    header: 'Fecha de Registro',
    cell: (r) => new Date(r.joinedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
    sortable: true,
  },
  {
    header: 'Plataforma',
    cell: (r) => (
      <span className={r.platform === 'Web' ? 'text-green-500 border font-medium border-green-300 px-2 py-1 rounded-full text-xs' : 'text-yellow-700 border font-medium font-bold border-yellow-500 px-2 py-1 rounded-full text-xs'}>
        {r.platform}
      </span>
    ),
  },
  {
    header: 'Reportes',
    accessor: 'reportCounts',
  },
  {
    header: 'Estado',
    cell: (r) => (
      <span className={r.status === 'Online' ? 'text-green-600 border border-emerald-100 px-2 py-1 rounded-full text-xs' : 'text-red-500 border border-red-400 px-2 py-1 rounded-full text-xs'}>{r.status === 'Online' ? 'En línea' : 'Desconectado'}</span>
    ),
  },
  {
      header: 'Bloquear',
      cell: (r) => (
        
        <Toggle
          checked={r.is_blocked}
          onChange={async (checked) => {
            if (checkDemo()) return;
            setRows((prev) =>
              prev.map((row) =>
                row.id === r.id ? { ...row, is_blocked: checked } : row
              )
            );
  
            try {
              await userService.blockUserByAdmin({
                id: r.id,
                is_blocked: checked,
              });
            } catch (err) {
              console.error('Block toggle failed', err);
              setRows((prev) =>
                prev.map((row) =>
                  row.id === r.id ? { ...row, is_blocked: !checked } : row
                )
              );
            }
          }}
          className="p-2"
        />
      ),
      className: 'w-28',
    },
    {
      header: 'Eliminar',
      cell: (r) => {
        const isProtected = PROTECTED_USER_IDS.includes(r.id);
        return (
          <button
            onClick={() => {
              if (isProtected || checkDemo()) return;
              setUserToDelete(r);
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            disabled={isProtected}
            className={`p-2 rounded-lg transition ${
              isProtected
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
            }`}
            title={isProtected ? 'Usuario protegido' : `Eliminar a ${r.username || '#' + r.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        );
      },
      className: 'w-20',
    },
  ];

  const fetchPage = async (page: number, pageSize: number, searchTerm: string, sortBy: string = 'createdAt', sortDir: 'ASC' | 'DESC' = 'DESC') => {
    setLoading(true);
    try {
      const response = await userService.getUsersList({ page, pageSize, search: searchTerm, orderBy: sortBy, orderDirection: sortDir });
      const users: UsersListItem[] = response?.data?.users || [];
      const total: number = response?.data?.pagination?.total ?? 0;
      
      const mapped: UserRow[] = users.map((u: UsersListItem, idx: number) => ({
        id: Number(u.user_id ?? idx + 1),
        profile_pic: buildMediaUrl((u as any).profile_pic),
        fullName: (u as any).full_name || (u as any).user_name || '-',
        emailMasked: (u as any).email ? (u as any).email.replace(/(.{4}).+(@.*)/, '$1xxxxxxxx$2') : 'xxxxxxxxxxxxxx@demo',
        username: (u as any).user_name || '-',
        mobileNum: (u as any).mobile_num || '',
        countryCode: (u as any).country_code || '',
        countryShortName: ((u as any).country_short_name || 'IN').toUpperCase(),
        country: (u as any).country || 'India',
        joinedAt: (u as any).createdAt || new Date().toISOString(),
        platform: ((u as any).platforms || ['android']).includes('web') ? 'Web' : 'App',
        reportCounts: 0,
        is_admin_otp_user: !!(u as any).is_admin_otp_user,
        status: Array.isArray((u as any).socket_ids) && ((u as any).socket_ids.length > 0) ? 'Online' : 'Offline',
        is_blocked: (u as any)?.blocked_by_admin
      }));

      setRows(mapped);
      setTotalItems(total);
    } catch (e) {
      console.error('Failed to load users list:', e);
      setRows([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchPage(currentPage, pageSize, search, orderBy, orderDirection);
  }, [currentPage, pageSize, search, orderBy, orderDirection]);

  const handleSortChange = (columnIndex: number | null, direction: 'ASC' | 'DESC') => {
    if (columnIndex === null) {
      setSortColumnIndex(4);
      setOrderBy('createdAt');
      setOrderDirection('DESC');
    } else {
      const fieldName = columnFieldMap[columnIndex];
      if (fieldName) {
        if (sortColumnIndex === columnIndex) {
          setOrderDirection(direction);
        } else {
          setOrderDirection(direction);
        }
        setSortColumnIndex(columnIndex);
        setOrderBy(fieldName);
        setCurrentPage(1);
      }
    }
  };

  // ─── Delete user handlers ─────────────────────────────────────────────────
  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (checkDemo() || deleting || !userToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await userService.deleteSingleUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      // Reload current page
      await fetchPage(currentPage, pageSize, search, orderBy, orderDirection);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al eliminar usuario';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Add user modal ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await userService.getAvatars();
        const list = res?.data?.Records || res?.data || res || [];
        setAvatars(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load avatars:', e);
      }
    };
    fetchAvatars();
  }, []);

  const resetForm = () => {
    setForm({ first_name: '', last_name: '', user_name: '', phoneDigits: '' });
    setSelectedCountry(null);
    setSelectedAvatar(null);
    setCustomImage(null);
    setCustomImagePreview('');
    setAvatarFilter('all');
    setFormErrors({});
    setUsernameStatus('idle');
    setPhoneStatus('idle');
    setSubmitError('');
    setSaving(false);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  useEffect(() => {
    if (!form.user_name || form.user_name.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const res = await userService.checkUsername(form.user_name);
        const available = res?.data?.available;
        setUsernameStatus(available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.user_name]);

  useEffect(() => {
    const fullPhone = `${PHONE_PREFIX}${form.phoneDigits}`;
    if (!selectedCountry?.code || form.phoneDigits.length < 8) {
      setPhoneStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setPhoneStatus('checking');
      try {
        const res = await userService.checkPhone(fullPhone, selectedCountry.code);
        const available = res?.data?.available;
        setPhoneStatus(available ? 'available' : 'taken');
      } catch {
        setPhoneStatus('idle');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.phoneDigits, selectedCountry]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.first_name.trim()) errors.first_name = 'El nombre es obligatorio';
    else if (/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(form.first_name)) errors.first_name = 'Solo se permiten letras';
    if (!form.last_name.trim()) { /* opcional */ }
    else if (/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/.test(form.last_name)) errors.last_name = 'Solo se permiten letras';
    if (!form.user_name.trim()) errors.user_name = 'El usuario es obligatorio';
    else if (form.user_name.length < 3) errors.user_name = 'Mínimo 3 caracteres';
    else if (usernameStatus === 'taken') errors.user_name = 'El usuario ya existe';
    if (!selectedCountry?.code) errors.country = 'Selecciona un prefijo de país';
    if (!form.phoneDigits || form.phoneDigits.length !== 8) errors.phone = 'Ingresa 8 dígitos';
    else if (!/^\d{8}$/.test(form.phoneDigits)) errors.phone = 'Solo se permiten números';
    else if (phoneStatus === 'taken') errors.phone = 'Este número ya está registrado';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (checkDemo() || saving) return;
    if (!validate()) return;
    setSaving(true);
    setSubmitError('');

    try {
      if (customImage) {
        const formData = new FormData();
        formData.append('first_name', form.first_name.trim());
        formData.append('last_name', form.last_name.trim());
        formData.append('user_name', form.user_name.trim());
        formData.append('mobile_num', `${PHONE_PREFIX}${form.phoneDigits}`);
        formData.append('country_code', selectedCountry.phone_code);
        formData.append('country_short_name', selectedCountry.code);
        formData.append('profile_pic', customImage);
        formData.append('pictureType', 'profile_pic');
        await userService.createUserByAdmin(formData as any);
      } else {
        await userService.createUserByAdmin({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          user_name: form.user_name.trim(),
          mobile_num: `${PHONE_PREFIX}${form.phoneDigits}`,
          country_code: selectedCountry.phone_code,
          country_short_name: selectedCountry.code,
          profile_pic: selectedAvatar?.avatar_media
            ? selectedAvatar.avatar_media.replace(/^https?:\/\/[^/]+\/?/, '')
            : '',
        });
      }
      closeModal();
      fetchPage(currentPage, pageSize, search, orderBy, orderDirection);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al crear usuario';
      setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  const phoneFull = selectedCountry?.phone_code ? `${selectedCountry.phone_code} ${PHONE_PREFIX}${form.phoneDigits.padEnd(8, '_')}` : '';

  const statusIcon = (status: string) => {
    if (status === 'checking') return <Loader className="h-4 w-4 animate-spin text-gray-400" />;
    if (status === 'available') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'taken') return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  const statusText = (status: string) => {
    if (status === 'checking') return 'Verificando...';
    if (status === 'available') return 'Disponible';
    if (status === 'taken') return 'Ya está en uso';
    return '';
  };

  return (
    <div className="space-y-4">
        <h1 className="text-xl font-semibold text-table-header-text">Lista de Usuarios</h1>
       
      <div className="flex items-center justify-between ">
        <div className="mt-2">
          <Breadcrumb />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={openModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-button-text font-semibold rounded-md hover:opacity-90 transition whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Añadir Usuario
          </Button>
          <div className="flex items-center gap-2 relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 font-extrabold text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o número"
              className="pl-9 bg-secondary/80 text-text-muted sm:w-full  min-w-[200px]"
            />
          </div>
        </div>

      </div>
      <DataTable 
        data={rows} 
        columns={columns} 
        defaultPageSize={10}
        serverPagination={true}
        currentPage={currentPage}
        itemsPerPage={pageSize}
        totalItems={totalItems}
        sortColumnIndex={sortColumnIndex}
        sortDirection={orderDirection}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => setPageSize(size)}
        onSortChange={handleSortChange}
      />

      {/* Add User Modal */}
      <Modal isOpen={showModal} onClose={closeModal} size="md" title="">
        <div className="w-[480px] max-w-full px-4 flex flex-col" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <h2 className="text-xl font-bold text-table-header-text mb-6">Añadir Usuario</h2>

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.first_name}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '');
                  updateForm('first_name', v);
                }}
                placeholder="Ingresa el nombre"
                className={`w-full border ${formErrors.first_name ? 'border-red-400' : 'border-table-divider'}`}
              />
              {formErrors.first_name && <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Apellido
              </label>
              <Input
                value={form.last_name}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '');
                  updateForm('last_name', v);
                }}
                placeholder="Ingresa el apellido"
                className="w-full border border-table-divider"
              />
              {formErrors.last_name && <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={form.user_name}
                  onChange={(e) => updateForm('user_name', e.target.value.replace(/\s/g, ''))}
                  placeholder="Ingresa el usuario"
                  className={`w-full border pr-8 ${formErrors.user_name ? 'border-red-400' : 'border-table-divider'}`}
                />
                {form.user_name.length >= 3 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {statusIcon(usernameStatus)}
                  </div>
                )}
              </div>
              {form.user_name.length >= 3 && statusText(usernameStatus) && (
                <p className={`text-xs mt-1 ${
                  usernameStatus === 'available' ? 'text-green-500' : 
                  usernameStatus === 'taken' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {statusText(usernameStatus)}
                </p>
              )}
              {formErrors.user_name && <p className="text-xs text-red-500 mt-1">{formErrors.user_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Número de teléfono <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-[180px] flex-shrink-0">
                  <Select
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={(opt) => {
                      setSelectedCountry(opt);
                      setFormErrors(prev => ({ ...prev, country: '' }));
                    }}
                    placeholder="Código"
                    className="text-sm"
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: formErrors.country ? '#f87171' : '#e2e8f0',
                        borderRadius: '0.5rem',
                        minHeight: '38px',
                        boxShadow: state.isFocused ? '0 0 0 1px #4361ee' : 'none',
                        '&:hover': { borderColor: '#4361ee' },
                      }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
                {selectedCountry?.code && (
                  <div className="flex items-center bg-gray-100 rounded-lg px-3 text-sm font-mono text-gray-600">
                    {selectedCountry.code}
                  </div>
                )}
                <div className="flex items-center bg-gray-100 rounded-lg px-3 text-sm font-mono text-gray-800 font-bold">
                  {PHONE_PREFIX}
                </div>
                <Input
                  value={form.phoneDigits}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                    updateForm('phoneDigits', v);
                  }}
                  placeholder="00000000"
                  maxLength={8}
                  className={`w-full border ${formErrors.phone ? 'border-red-400' : 'border-table-divider'}`}
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                {form.phoneDigits.length === 8 && phoneStatus !== 'idle' && (
                  <>
                    {statusIcon(phoneStatus)}
                    <span className={`text-xs ${
                      phoneStatus === 'available' ? 'text-green-500' : 
                      phoneStatus === 'taken' ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {statusText(phoneStatus)}
                    </span>
                  </>
                )}
                {formErrors.country && <p className="text-xs text-red-500">{formErrors.country}</p>}
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
              {selectedCountry?.code && !formErrors.phone && !formErrors.country && (
                <p className="text-xs text-gray-400 mt-1">
                  Número completo: {phoneFull}
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              Los usuarios creados por el admin tienen el código OTP <strong>123456</strong>.
              Se identifican por el prefijo <strong>{PHONE_PREFIX}</strong> + 8 dígitos.
              En la app, al iniciar sesión verán: "Ingrese OTP de usuario creado por admin".
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Foto de perfil (opcional)
              </label>

              {(selectedAvatar || customImagePreview) && (
                <div className="mb-3 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
                    <img
                      src={customImagePreview || selectedAvatar?.avatar_media}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">
                      {customImagePreview ? 'Imagen personalizada' : selectedAvatar?.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(null);
                        setCustomImage(null);
                        setCustomImagePreview('');
                        if (customImageRef.current) customImageRef.current.value = '';
                      }}
                      className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Quitar seleccion
                    </button>
                  </div>
                </div>
              )}

              {!selectedAvatar && !customImagePreview && (
                <>
                  <div className="mb-3">
                    <input
                      ref={customImageRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCustomImage(file);
                          setSelectedAvatar(null);
                          const reader = new FileReader();
                          reader.onload = (ev) => setCustomImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => customImageRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary transition"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Subir imagen personalizada
                    </button>
                  </div>

                  <div className="flex gap-2 mb-2">
                    {(['all', 'male', 'female'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setAvatarFilter(f)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                          avatarFilter === f
                            ? 'bg-primary text-button-text'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f === 'all' ? 'Todos' : f === 'male' ? 'Masculinos' : 'Femeninos'}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {avatars
                      .filter((a) => avatarFilter === 'all' || a.avatar_gender === avatarFilter)
                      .map((avatar) => (
                        <button
                          key={avatar.avatar_id}
                          type="button"
                          onClick={() => {
                            setSelectedAvatar(avatar);
                            setCustomImage(null);
                            setCustomImagePreview('');
                          }}
                          className={`relative p-1 rounded-lg border-2 transition ${
                            selectedAvatar?.avatar_id === avatar.avatar_id
                              ? 'border-primary shadow-md'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={avatar.avatar_media}
                            alt={avatar.name}
                            className="w-full h-auto rounded"
                          />
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-table-divider">
            <Button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-button-text bg-primary rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader className="h-4 w-4 animate-spin" />}
              {saving ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={closeDeleteModal} size="md" title="">
        <div className="w-[420px] max-w-full px-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-table-header-text">Eliminar usuario</h2>
            </div>
          </div>

          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {deleteError}
            </div>
          )}

          {userToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-3">
                  ¿Estás seguro de que quieres eliminar a este usuario? Esta acción no se puede deshacer.
                </p>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100">
                  <img
                    src={buildMediaUrl(userToDelete.profile_pic)}
                    className="h-10 w-10 rounded-full"
                    alt="avatar"
                  />
                  <div>
                    <p className="text-sm font-semibold text-table-header-text">{userToDelete.fullName}</p>
                    <p className="text-xs text-text-muted">@{userToDelete.username} — #{userToDelete.id}</p>
                    {userToDelete.mobileNum && (
                      <p className="text-xs text-text-muted">{userToDelete.countryCode} {userToDelete.mobileNum}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-table-divider">
                <Button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting && <Loader className="h-4 w-4 animate-spin" />}
                  {deleting ? 'Eliminando...' : 'Eliminar usuario'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
