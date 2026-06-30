// England local authorities (upper-tier / education authorities) responsible for
// elective home education and the Children Not in School duties (brief §7, §13).
//
// Source: ONS County and Unitary Authority (December 2024) Names and Codes
// register, filtered to England, cross-checked against the Local Education
// Authorities list - 153 authorities reflecting all post-2023 reorganisations
// (Cumberland + Westmorland and Furness, not Cumbria; North Yorkshire and
// Somerset as unitaries; North/West Northamptonshire). Display names use common
// short forms. Re-verify against the ONS register before England goes live.

export const ENGLAND_LOCAL_AUTHORITIES: readonly string[] = [
  'Barking and Dagenham', 'Barnet', 'Barnsley', 'Bath and North East Somerset', 'Bedford',
  'Bexley', 'Birmingham', 'Blackburn with Darwen', 'Blackpool', 'Bolton',
  'Bournemouth, Christchurch and Poole', 'Bracknell Forest', 'Bradford', 'Brent', 'Brighton and Hove',
  'Bristol', 'Bromley', 'Buckinghamshire', 'Bury', 'Calderdale',
  'Cambridgeshire', 'Camden', 'Central Bedfordshire', 'Cheshire East', 'Cheshire West and Chester',
  'City of London', 'Cornwall', 'County Durham', 'Coventry', 'Croydon',
  'Cumberland', 'Darlington', 'Derby', 'Derbyshire', 'Devon',
  'Doncaster', 'Dorset', 'Dudley', 'Ealing', 'East Riding of Yorkshire',
  'East Sussex', 'Enfield', 'Essex', 'Gateshead', 'Gloucestershire',
  'Greenwich', 'Hackney', 'Halton', 'Hammersmith and Fulham', 'Hampshire',
  'Haringey', 'Harrow', 'Hartlepool', 'Havering', 'Herefordshire',
  'Hertfordshire', 'Hillingdon', 'Hounslow', 'Isle of Wight', 'Isles of Scilly',
  'Islington', 'Kensington and Chelsea', 'Kent', 'Kingston upon Hull', 'Kingston upon Thames',
  'Kirklees', 'Knowsley', 'Lambeth', 'Lancashire', 'Leeds',
  'Leicester', 'Leicestershire', 'Lewisham', 'Lincolnshire', 'Liverpool',
  'Luton', 'Manchester', 'Medway', 'Merton', 'Middlesbrough',
  'Milton Keynes', 'Newcastle upon Tyne', 'Newham', 'Norfolk', 'North East Lincolnshire',
  'North Lincolnshire', 'North Northamptonshire', 'North Somerset', 'North Tyneside', 'North Yorkshire',
  'Northumberland', 'Nottingham', 'Nottinghamshire', 'Oldham', 'Oxfordshire',
  'Peterborough', 'Plymouth', 'Portsmouth', 'Reading', 'Redbridge',
  'Redcar and Cleveland', 'Richmond upon Thames', 'Rochdale', 'Rotherham', 'Rutland',
  'Salford', 'Sandwell', 'Sefton', 'Sheffield', 'Shropshire',
  'Slough', 'Solihull', 'Somerset', 'South Gloucestershire', 'South Tyneside',
  'Southampton', 'Southend-on-Sea', 'Southwark', 'St Helens', 'Staffordshire',
  'Stockport', 'Stockton-on-Tees', 'Stoke-on-Trent', 'Suffolk', 'Sunderland',
  'Surrey', 'Sutton', 'Swindon', 'Tameside', 'Telford and Wrekin',
  'Thurrock', 'Torbay', 'Tower Hamlets', 'Trafford', 'Wakefield',
  'Walsall', 'Waltham Forest', 'Wandsworth', 'Warrington', 'Warwickshire',
  'West Berkshire', 'West Northamptonshire', 'West Sussex', 'Westminster', 'Westmorland and Furness',
  'Wigan', 'Wiltshire', 'Windsor and Maidenhead', 'Wirral', 'Wokingham',
  'Wolverhampton', 'Worcestershire', 'York',
];

// Case-insensitive prefix/substring search for a searchable selector.
export function searchEnglandLocalAuthorities(query: string, limit = 12): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...ENGLAND_LOCAL_AUTHORITIES].slice(0, limit);
  const starts: string[] = [];
  const contains: string[] = [];
  for (const la of ENGLAND_LOCAL_AUTHORITIES) {
    const l = la.toLowerCase();
    if (l.startsWith(q)) starts.push(la);
    else if (l.includes(q)) contains.push(la);
  }
  return [...starts, ...contains].slice(0, limit);
}

export function isEnglandLocalAuthority(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  return ENGLAND_LOCAL_AUTHORITIES.some((la) => la.toLowerCase() === n);
}
