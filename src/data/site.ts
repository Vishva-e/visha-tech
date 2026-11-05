export const brand = {
  name: 'Visha Shop',
  youtube: 'https://youtube.com/@lifeandlaughsofficial',
  copyrightOwner: 'Visha Shop',
};
export const categories = [
  {slug:'laptops', name:'Laptops', icon:'💻', summary:'Pick a machine that stays fast beyond the spec sheet.'},
  {slug:'developer-gear', name:'Developer Gear', icon:'⌨️', summary:'Keyboards, hubs, desks and everyday coding tools.'},
  {slug:'smartphones', name:'Smartphones', icon:'📱', summary:'Understand the trade-offs before upgrading.'},
  {slug:'audio', name:'Audio', icon:'🎧', summary:'Clear calls, comfortable listening and useful features.'},
  {slug:'storage', name:'Storage', icon:'💾', summary:'SSDs, backups and practical storage advice.'},
  {slug:'work-from-home', name:'Work From Home', icon:'🖥️', summary:'Make your setup more comfortable and productive.'},
] as const;
export type CategorySlug = (typeof categories)[number]['slug'];
export function categoryBySlug(slug: string) { return categories.find((item) => item.slug === slug); }
export const navigation = [
  {label:'Shop', href:'/shop/'},
  {label:'Guides', href:'/guides/'},
  {label:'Laptops', href:'/categories/laptops/'},
  {label:'Developer Gear', href:'/categories/developer-gear/'},
  {label:'Comparisons', href:'/comparisons/'},
  {label:'Product Finder', href:'/product-finder/'},
  {label:'About', href:'/about/'},
];
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'}).format(date);
}
