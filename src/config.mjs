import { DateTime } from "luxon";

export const prodSite = 'https://hackpula.metafest.wtf';

// export const isDev = import.meta.env.PUBLIC_HOSTNAME === 'http://localhost:1188';
// export const isProd = import.meta.env.PUBLIC_HOSTNAME === prodSite;
// export const isTest = !(isDev || isProd) ?? false;

export const HOSTNAME = prodSite;

// export const uri = isDev ? 'https://0017-146-70-48-3.eu.ngrok.io' : 'https://test.hackpula.metafest.wtf';
export const currencySymbol = '€';
export const currencyTicker = 'EUR';

export const earlyBirdEnds = '2023-05-01';
export const eventStartDate = '2023-08-11';
export const earlyBirdEndsFormatted = DateTime.fromISO(earlyBirdEnds).toLocaleString(DateTime.DATE_SHORT);

export const SITE = {
	name: 'MetaFest: Hack Pula',
	origin: prodSite,
	basePathname: '/',
	trailingSlash: false,
	eventDates: 'August 13-15th, 2023',
	title: 'MetaFest: Hack Pula',
	description: `MetaFest: Hack Pula is a 3-day hackathon event in Pula, Croatia. Happening on August 13-15th, 2023 - The even is sponsored by MetaCartel, Gnosis, Celo to name a few. Bounties aplenty and a chance to win up to $10,000 in prizes.`,
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
