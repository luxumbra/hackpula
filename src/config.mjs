import { DateTime } from "luxon";


export const paycekProfileCode = import.meta.env.PUBLIC_PAYCEK_PROFILE_CODE;
export const paycekSecret = import.meta.env.PUBLIC_PAYCEK_SECRET_KEY;

export const isDev = import.meta.env.PUBLIC_HOSTNAME === 'http://localhost:1145';
export const isProd = import.meta.env.PUBLIC_HOSTNAME === 'https://metafest.wtf';
export const isTest = !(isDev || isProd) ?? false;

export const HOSTNAME = import.meta.env.PUBLIC_HOSTNAME ?? 'https://metafest.wtf';

export const uri = isDev ? 'https://0017-146-70-48-3.eu.ngrok.io' : 'https://test.metafest.wtf';
export const currencySymbol = '€';
export const currencyTicker = 'EUR';

export const earlyBirdEnds = '2023-05-01';
export const eventStartDate = '2023-08-11';
export const earlyBirdEndsFormatted = DateTime.fromISO(earlyBirdEnds).toLocaleString(DateTime.DATE_SHORT);

export const SITE = {
	name: 'MetaFest: Croatia',
	origin: HOSTNAME ?? 'https://metafest.wtf',
	basePathname: '/',
	trailingSlash: false,

	title: 'MetaFest Croatia',
	description:
		`A bit of a conference, a bit of a festival + a shitload of fun; Talks, workshops, games & music; a festival for DAOists & Regens. Earlybird discounts available until ${earlyBirdEndsFormatted}.`,

	googleAnalyticsId: 'G-4436889R1F',
	googleSiteVerificationId: 'orcPxI47GSa-cRvY11tUe6iGg2IO_RPvnA1q95iEM3M',
};

export const BLOG = {
	disabled: false,
	postsPerPage: 4,

	blog: {
		disabled: false,
		pathname: 'blog', // blog main path, you can change this to "articles" (/articles)
	},

	post: {
		disabled: false,
		pathname: '', // empty for /some-post, value for /pathname/some-post
	},

	category: {
		disabled: false,
		pathname: 'category', // set empty to change from /category/some-category to /some-category
	},

	tag: {
		disabled: false,
		pathname: 'tag', // set empty to change from /tag/some-tag to /some-tag
	},
};
