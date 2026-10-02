import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/global/userService';
import type { CountryUsersCountResponse, CountryUsersCount } from '@/services/global/userService';
import { Chart } from 'react-google-charts';
import ReactCountryFlag from 'react-country-flag';
import { CardTitle } from './Card';

// Map long/official country names → short display names
const countryNameNormalize: Record<string, string> = {
    "Venezuela, Bolivarian Republic of Venezuela": "Venezuela",
    "Venezuela, Bolivarian Republic of": "Venezuela",
    "Bolivarian Republic of Venezuela": "Venezuela",
    "Argentina, Argentine Republic": "Argentina",
    "Republic of Korea": "South Korea",
    "Korea, Republic of": "South Korea",
    "United States of America": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "Russian Federation": "Russia",
    "Plurinational State of Bolivia": "Bolivia",
    "Bolivia, Plurinational State of": "Bolivia",
    "Bolivia, State of": "Bolivia",
    "Iran, Islamic Republic of": "Iran",
    "Islamic Republic of Iran": "Iran",
    "Viet Nam": "Vietnam",
    "Lao People's Democratic Republic": "Laos",
    "Lao PDR": "Laos",
    "Dem. People's Republic of Korea": "North Korea",
    "Korea, Dem. People's Rep. of": "North Korea",
    "Czech Republic": "Czechia",
    "Macedonia, The Former Yugoslav Republic of": "North Macedonia",
    "North Macedonia": "North Macedonia",
    "Moldova, Republic of": "Moldova",
    "Republic of Moldova": "Moldova",
    "Palestine, State of": "Palestine",
    "State of Palestine": "Palestine",
    "Tanzania, United Republic of": "Tanzania",
    "United Republic of Tanzania": "Tanzania",
    "Cote D'Ivoire": "Ivory Coast",
    "Côte d'Ivoire": "Ivory Coast",
    "Congo, The Democratic Republic of the": "DR Congo",
    "Dem. Rep. Congo": "DR Congo",
    "Congo": "Congo",
    "Czechia": "Czechia",
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

// Map normalized country names → ISO 3166-1 alpha-2 codes
const countryNameToCode: Record<string, string> = {
    "India": "IN",
    "United States": "US",
    "Canada": "CA",
    "Australia": "AU",
    "Germany": "DE",
    "France": "FR",
    "United Kingdom": "GB",
    "Japan": "JP",
    "Venezuela": "VE",
    "Colombia": "CO",
    "Mexico": "MX",
    "Brazil": "BR",
    "Argentina": "AR",
    "Chile": "CL",
    "Peru": "PE",
    "Ecuador": "EC",
    "Spain": "ES",
    "Portugal": "PT",
    "Italy": "IT",
    "China": "CN",
    "South Korea": "KR",
    "North Korea": "KP",
    "Russia": "RU",
    "Turkey": "TR",
    "Egypt": "EG",
    "Nigeria": "NG",
    "South Africa": "ZA",
    "Bolivia": "BO",
    "Paraguay": "PY",
    "Uruguay": "UY",
    "Panama": "PA",
    "Costa Rica": "CR",
    "Dominican Republic": "DO",
    "Cuba": "CU",
    "Guatemala": "GT",
    "Honduras": "HN",
    "El Salvador": "SV",
    "Nicaragua": "NI",
    "Iran": "IR",
    "Vietnam": "VN",
    "Thailand": "TH",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Pakistan": "PK",
    "Bangladesh": "BD",
    "Sri Lanka": "LK",
    "Nepal": "NP",
    "China": "CN",
    "Taiwan": "TW",
    "Hong Kong": "HK",
    "Morocco": "MA",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "Kenya": "KE",
    "Ethiopia": "ET",
    "Ghana": "GH",
    "Tanzania": "TZ",
    "Uganda": "UG",
    "DR Congo": "CD",
    "Congo": "CG",
    "Senegal": "SN",
    "Cameroon": "CM",
    "Ivory Coast": "CI",
    "Israel": "IL",
    "Saudi Arabia": "SA",
    "UAE": "AE",
    "United Arab Emirates": "AE",
    "Qatar": "QA",
    "Kuwait": "KW",
    "Iraq": "IQ",
    "Jordan": "JO",
    "Lebanon": "LB",
    "New Zealand": "NZ",
    "Ireland": "IE",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Poland": "PL",
    "Czechia": "CZ",
    "Hungary": "HU",
    "Romania": "RO",
    "Bulgaria": "BG",
    "Greece": "GR",
    "Ukraine": "UA",
    "Croatia": "HR",
    "Serbia": "RS",
    "Slovakia": "SK",
    "Slovenia": "SI",
    "Lithuania": "LT",
    "Latvia": "LV",
    "Estonia": "EE",
    "Iceland": "IS",
    "Luxembourg": "LU",
    "Cyprus": "CY",
    "Malta": "MT",
    "Moldova": "MD",
    "Belarus": "BY",
    "Georgia": "GE",
    "Armenia": "AM",
    "Azerbaijan": "AZ",
    "Kazakhstan": "KZ",
    "Uzbekistan": "UZ",
    "Myanmar": "MM",
    "Cambodia": "KH",
    "Laos": "LA",
    "Mongolia": "MN",
    "Laos": "LA",
    "Palestine": "PS",
    "North Macedonia": "MK",
    "Albania": "AL",
    "Bosnia and Herzegovina": "BA",
    "Montenegro": "ME",
    "Jamaica": "JM",
    "Trinidad and Tobago": "TT",
    "Haiti": "HT",
    "Guyana": "GY",
    "Suriname": "SR",
    "Belize": "BZ",
    "Barbados": "BB",
    "Bahamas": "BS",
    "Puerto Rico": "PR",
    "Guam": "GU",
    "Iceland": "IS",
    "Laos": "LA",
    "Brunei": "BN",
    "Papua New Guinea": "PG",
    "Fiji": "FJ",
};

interface CountryUserActiveCardProps {
    title?: string;
    colors?: [string, string]; // gradient colors for the map
}

const CountryUserCard: React.FC<CountryUserActiveCardProps> = ({
    title = 'Usuarios Activos',
    colors = ['#e0f7ff', '#0891b2'],
}) => {
    const { data: countryData, isLoading } = useQuery<CountryUsersCountResponse>({
        queryKey: ['usersByCountryOverAll'],
        queryFn: () => userService.getUsersByCountry(),
    });

    const allCountries = mergeCountries(countryData?.data || []);

    // ✅ sort all countries by count (high → low)
    const sortedCountries = [...allCountries].sort((a, b) => {
        const countA = typeof a.count === 'string' ? parseInt(a.count, 10) : a.count || 0;
        const countB = typeof b.count === 'string' ? parseInt(b.count, 10) : b.count || 0;
        return countB - countA;
    });

    // ✅ take only top 5 after sorting
    const topCountries = sortedCountries.slice(0, 5);

    const totalActiveUsers = allCountries.reduce((sum: number, country: CountryUsersCount) => {
        const count = typeof country.count === 'string' ? parseInt(country.count, 10) : country.count || 0;
        return sum + count;
    }, 0);

    // ✅ prepare map data (skip empty country names)
    const mapData = [
        ['Country', 'Usuarios'],
        ...sortedCountries
            .filter((c: CountryUsersCount) => c.country && c.country.trim() !== "")
            .map((country: CountryUsersCount) => [
                country.country,
                typeof country.count === 'string' ? parseInt(country.count, 10) : country.count
            ])
    ];

    const maxUsers = sortedCountries.reduce((max: number, country: CountryUsersCount) => {
        const count = typeof country.count === 'string' ? parseInt(country.count, 10) : country.count || 0;
        return Math.max(max, count);
    }, 0);

    const chartContainerStyle = { width: '100%', height: '100%' };

    const mapOptions = {
        colorAxis: { colors: colors, minValue: 0, maxValue: maxUsers },
        backgroundColor: 'transparent',
        datalessRegionColor: '#f1f5f9',
        defaultColor: '#f1f5f9',
        legend: 'none',
        tooltip: { textStyle: { fontSize: 12 } },
    };

    return (
        <div className="bg-secondary shadow-default p-6 h-full my-auto rounded-lg  border-none max-w-full mx-auto">
            <CardTitle className="text-lg font-semibold text-table-header-text">Usuarios por País</CardTitle>

            <div className="grid grid-cols-1 h-full lg:grid-cols-5  items-center">
                {/* Left side - Map */}
                <div className="relative col-span-3">
                    <div className="bg-secondary rounded-lg py-4 px-1 h-full">
                        <div className="h-full w-full">
                            <div style={chartContainerStyle}>
                                <Chart
                                    chartType="GeoChart"
                                    width="100%"
                                    height="100%"
                                    data={mapData}
                                    options={mapOptions}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Table */}
                <div className="col-span-2 pl-4">
                    {/* <div className="mb-6">
                        <h2 className="text-lg font-medium text-table-header-text mb-2">{title}</h2>
                        <div className="text-7xl font-bold text-table-header-text mb-8">
                            {isLoading ? '...' : totalActiveUsers.toLocaleString()}
                        </div>
                    </div> */}

                    <div className="bg-secondary rounded-lg overflow-hidden ">
                        {/* Table Header */}
                        {/* <div className="px-2 py-3">
                            <div className="grid grid-cols-2 gap-4 px-4 py-3 bg-table-header-bg rounded-lg">
                                <div className="text-sm font-medium text-table-header-text uppercase tracking-wide w-full">Country</div>
                                <div className="text-sm font-medium text-table-header-text uppercase tracking-wide">Active User</div>
                            </div>
                        </div> */}

                        {/* ✅ Table Rows - Top 5 sorted countries */}
                        {topCountries.map((country: CountryUsersCount, index: number) => {
                            const count = typeof country.count === 'string'
                                ? parseInt(country.count, 10)
                                : country.count;

                            const hasName = country.country && country.country.trim() !== "";
                            const countryName = hasName ? country.country : "Unknown";
                            const countryCode = hasName ? (countryNameToCode[country.country] || (country.country_short_name?.toUpperCase()) || '') : ''; // fallback

                            return (
                                <div
                                    key={index}
                                    className="grid grid-cols-2 gap-3 px-3 pl-6 py-4  text-sm border-b border-table-divider last:border-b-0"
                                >
                                    <div className="flex items-center gap-2">
                                        {hasName && countryCode ? (
                                            <>
                                            <ReactCountryFlag
                                                countryCode={countryCode}
                                                svg
                                                style={{ width: '20px', height: '20px'}}
                                                title={countryName}
                                                />
                                                <span className='text-text-muted font-bold'>
                                                    {countryName}
                                                </span>
                                                </>
                                        ) : (
                                            <>
                                            <span className="text-lg leading-none">🌐</span>
                                            <span className='text-text-muted font-bold'>
                                                {countryName}
                                            </span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-text-muted text-end font-bold">{count} Usuarios</span>

                                    {/* <div className="text-text-muted font-semibold"></div> */}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountryUserCard;
