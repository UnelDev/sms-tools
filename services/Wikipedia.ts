import wiki, { infobox, languageResult, wikiSummary } from 'wikipedia';

import { bolderize } from '../tools/tools';
import User from '../user/User';
import Service from './Service';

class Wikipedia extends Service {
	constructor() {
		super();
		this.name = 'Wikipedia';
	}

	newAction(user: User, message: string) {
		if (message.startsWith('event')) {
			message = message.replace('event', '');
			this.event(user, message);
		} else if (message.startsWith('selectlanguage') || message.startsWith('sl')) {
			message = message.replace('sl', '');
			message = message.replace('selectlanguage', '');
			this.changeLanguage(user, message);
		} else if (message.startsWith('search')) {
			message = message.replace('search', '');
			this.search(user, message);
		} else {
			user.sendMessage(`You have selected the ${bolderize('Wikipedia')} service. List of command:
${bolderize('search')} <element>: Search something on Wikipedia
${bolderize('selectLanguage | sl')}: Change the Wikipedia language
${bolderize('event <number>')}: See all events that happened on this date

${bolderize('home')}: Go back to the main menu`);
		}
	}

	async search(user: User, message: string) {
		if (message.trim() == '') {
			user.sendMessage('Usage: search <terms>');
			return;
		}
		wiki.setLang(user.otherInfo.get('Wikipedia_language') ?? 'en');
		const page = await wiki.page(message);
		const categories = await page.summary();
		if (categories.type == 'disambiguation') {
			console.log();
			user.sendMessage(
				`This page is a disambiguation page.\ninformation on this search:\n${categories.extract} \npage link: ` +
					page.fullurl
			);
		} else {
			const intro = await page.intro();
			if (intro.length > 1600) {
				const splitPage = intro.split('\n');
				// Adding the paging sections
				const maxSmsLength = 1600 - 16;
				if (Math.max(...splitPage.map(str => str.length)) > maxSmsLength) {
					user.sendMessage('This page is too large to send');
					return;
				}

				splitPage.forEach((el, i) => {
					const pageNumber = '[' + (i + 1) + '/' + splitPage.length + ']';
					user.sendMessage(pageNumber.concat('\n').concat(el).concat('\n').concat(pageNumber));
				});
				return;
			}
			user.sendMessage(intro);
			user.sendMessage('Attached link:\n' + page.fullurl);
		}
	}

	async changeLanguage(user: User, message: string) {
		message = message.trim();
		if (message != '') {
			const language = await wiki.languages();
			const selectLanguage = existInLanguage(language, message);
			if (selectLanguage != false) {
				user.sendMessage(
					'You have selected ' + selectLanguage[Object.keys(selectLanguage)[0]] + ' language for Wikipedia.'
				);
				user.otherInfo.set('Wikipedia_language', Object.keys(selectLanguage)[0]);
				user.save();
			} else {
				user.sendMessage('Language is unknown. Select another one. eg: fr, de, en');
			}
		}
		function existInLanguage(language: languageResult[], search: string) {
			for (const object of language) {
				if (Object.keys(object)[0] == search) {
					return object;
				}
			}
			return false;
		}
	}

	async event(user: User, message: string) {
		try {
			wiki.setLang(user.otherInfo.get('Wikipedia_language') ?? 'en');
			const events = await wiki.onThisDay({ type: 'selected' });
			if (events.selected == undefined) {
				user.sendMessage('Error in Wikipedia');
				return;
			}
			if (message.trim() != '') {
				const target = parseInt(message.trim());
				if (isNaN(target) || target >= events.selected?.length - 1) {
					user.sendMessage('Invalid number');
					return;
				} else {
					user.sendMessage(
						`${bolderize(events.selected[target].year?.toString() ?? 'xxxx')}\n${
							events.selected[target].text
						}\nAttached links:${crearteLinkList(events.selected[target].pages)}\nPage [${target}/${
							events.selected.length - 1
						}]`
					);
				}
			} else {
				user.sendMessage(
					`${bolderize(events.selected[0].year?.toString() ?? 'xxxx')}\n${
						events.selected[0].text
					}\nAttached links:${crearteLinkList(events.selected[0].pages)}\nPage [${0}/${
						events.selected.length - 1
					}]`
				);
			}
		} catch (error) {
			user.sendMessage('Error in Wikipedia');
		}

		function crearteLinkList(page: wikiSummary[]) {
			return page.map(el => {
				return '\n' + el.normalizedtitle + ': ' + el.content_urls.mobile.page;
			});
		}
	}
}
export default Wikipedia;
