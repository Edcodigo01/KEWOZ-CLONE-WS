import { useEffect, useState } from 'react';
import { userService, type CountryUsersCount } from '@/services/global/userService';

type Platform = 'App' | 'Web';
type Status = 'Online' | 'Offline';

type UserRow = {
  id: number;
  profile_pic: string;
  fullName: string;
  emailMasked: string;
  username: string;
  countryCode: string;
  country: string;
  joinedAt: string;
  platform: Platform;
  reportCounts: number;
  status: Status;
};

const countryNameNormalize: Record<string, string> = {
  "Venezuela, Bolivarian Republic of Venezuela": "Venezuela",
  "Venezuela, Bolivarian Republic of": "Venezuela",
  "Bolivarian Republic of Venezuela": "Venezuela",
  "Argentina, Argentine Republic": "Argentina",
  "United States of America": "United States",
  "Russian Federation": "Russia",
  "Plurinational State of Bolivia": "Bolivia",
  "Bolivia, Plurinational State of": "Bolivia",
  "Iran, Islamic Republic of": "Iran",
  "Viet Nam": "Vietnam",
  "Korea, Republic of": "South Korea",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  "Congo, The Democratic Republic of the": "DR Congo",
};

function normalizeCountryName(name: string): string {
  return countryNameNormalize[name] || name;
}

function mergeCountries(countries: CountryUsersCount[]): CountryUsersCount[] {
  const map = new Map<string, CountryUsersCount>();
  for (const c of countries) {
    const normalizedName = normalizeCountryName(c.country || "");
    const count = typeof c.count === 'string' ? parseInt(c.count, 10) : c.count || 0;
    if (map.has(normalizedName)) {
      const existing = map.get(normalizedName)!;
      const existingCount = typeof existing.count === 'string' ? parseInt(existing.count, 10) : existing.count || 0;
      existing.count = existingCount + count;
    } else {
      map.set(normalizedName, { ...c, country: normalizedName, count });
    }
  }
  return Array.from(map.values());
}

function countryFlag(code: string) {
  const cc = (code || '').toUpperCase();
  return cc.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function countryNameToISO(name: string): string {
  const n = (name || '').trim().toLowerCase();
  const map: Record<string, string> = {
    'united kingdom': 'GB',
    'uk': 'GB',
    'great britain': 'GB',
    'gb': 'GB',
    'england': 'GB',
    'scotland': 'GB',
    'wales': 'GB',
    'northern ireland': 'GB',
    'united states': 'US',
    'united states of america': 'US',
    'usa': 'US',
    'us': 'US',
    'india': 'IN',
    'venezuela': 'VE',
    'colombia': 'CO',
    'mexico': 'MX',
    'brazil': 'BR',
    'argentina': 'AR',
    'chile': 'CL',
    'peru': 'PE',
    'ecuador': 'EC',
    'spain': 'ES',
    'portugal': 'PT',
    'italy': 'IT',
    'germany': 'DE',
    'france': 'FR',
    'canada': 'CA',
    'australia': 'AU',
    'japan': 'JP',
    'china': 'CN',
    'russia': 'RU',
    'turkey': 'TR',
    'egypt': 'EG',
    'nigeria': 'NG',
    'south africa': 'ZA',
    'bolivia': 'BO',
    'paraguay': 'PY',
    'uruguay': 'UY',
    'panama': 'PA',
    'costa rica': 'CR',
    'dominican republic': 'DO',
    'cuba': 'CU',
    'guatemala': 'GT',
    'honduras': 'HN',
    'el salvador': 'SV',
    'nicaragua': 'NI',
    'unknown': '',
  };
  if (map[n]) return map[n];
  const letters = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  return letters.slice(0, 2) || '';
}

// 🎨 Tailwind colors palette
const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-yellow-500',
];

// 🔑 Stable color assignment by hashing country name
function getColorForCountry(name: string) {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

// 🌍 Render flag with fallback for unknown
function renderCountryFlag(code: string, name: string) {
  if (!code || name.toLowerCase() === 'unknown') {
    return (
      <span className="text-xl px- py-1 rounded ">
        🏳
      </span>
    );
  }
  return <span className="text-base leading-none">{countryFlag(code)}</span>;
}

export default function DashboardUsersByCountryPage() {
  const [rows, setRows] = useState<UserRow[]>([]);

  const fetchAll = async () => {
    try {
      const res = await userService.getUsersByCountry();
      const list: CountryUsersCount[] = mergeCountries(res.data || []);
      const expanded: UserRow[] = list.map((c, idx) => ({
        id: idx + 1,
        profile_pic: '/assets/Avatar.png',
        fullName: c.country || 'Unknown',
        emailMasked: '',
        username: '',
        countryCode: countryNameToISO(c.country || ''),
        country: c.country || 'Unknown',
        joinedAt: new Date().toISOString(),
        platform: 'App',
        reportCounts: Number(c.count) || 0,
        status: 'Offline',
      }));
      setRows(expanded);
    } catch (e) {
      console.error('Failed to load users list by country:', e);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-muted">Usuarios por País</h1>
      </div>

      {(() => {
        const list = rows
          .map((r) => ({
            name: r.country,
            code: r.countryCode,
            count: r.reportCounts,
          }))
          .sort((a, b) => b.count - a.count);

        const maxCount = Math.max(1, ...list.map((l) => l.count));
        const pageItems = list;

        return (
          <div className="p-4">
            <div className="space-y-4">
              {pageItems.map((c) => {
                const pct = Math.round((c.count / maxCount) * 100);
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="text-sm text-text-secondary flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderCountryFlag(countryNameToISO(c.name), c.name)}
                        <span>{c.name || 'Unknown'}</span>
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap">
                        {c.count} Usuarios
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-table-header-bg rounded-full">
                      <div
                        className={`h-2.5 rounded-full ${getColorForCountry(c.name)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-sm text-text-muted">
              Mostrando {pageItems.length} resultados
            </div>
          </div>
        );
      })()}
    </div>
  );
}
