import wiki, { languageResult, wikiSummary } from 'wikipedia';
import { User } from '../../models/user.model';
import { sendSms } from '../../tools/sendSms';
import { bolderize } from '../../tools/tools';
import ServicesClass from '../service';
import { WikipediaModel } from './wikipediaData.model';

class wikipedia extends ServicesClass {
	constructor() {
		super();
		this.name = 'wikipedia';
		this.description = 'reshearch an article on wikipedia';
		this.version = '1.0';
		this.type = 'command';
		this.commands = ['event', 'selectlanguage', 'search'];
	}

	async newMessage(user: InstanceType<typeof User>, message: string) {
		const language = (await WikipediaModel.findOne({ senderID: user._id }, ['language']))?.language ?? 'en';
		if (message.startsWith('event')) {
			message = message.replace('event', '');
			this.event(user, message, language);
		} else if (message.startsWith('selectlanguage') || message.startsWith('sl')) {
			message = message.replace('sl', '');
			message = message.replace('selectlanguage', '');
			this.changeLanguage(user, message);
		} else if (message.startsWith('search')) {
			message = message.replace('search', '');
			this.search(user, message, language);
		} else {
			sendSms(
				user,
				`You have selected the ${bolderize('Wikipedia')} service. List of command:
${bolderize('search')} <element>: Search something on Wikipedia
${bolderize('selectLanguage | sl')} <language>: Change the Wikipedia language
${bolderize('event')} <number>: See all events that happened on this date
			
${bolderize('home')}: Go back to the main menu`
			);
		}
	}

	private async search(user: InstanceType<typeof User>, message: string, language: string) {
		if (message.trim() == '') {
			sendSms(user, 'Usage: search <terms>\nfor exemple:\nsearch batman');
			return;
		}
		wiki.setLang(language);
		const page = await wiki.page(message);
		const categories = await page.summary();
		if (categories.type == 'disambiguation') {
			console.log();
			sendSms(
				user,
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
					sendSms(user, 'This page is too large to send');
					return;
				}

				splitPage.forEach((el, i) => {
					const pageNumber = '[' + (i + 1) + '/' + splitPage.length + ']';
					sendSms(user, pageNumber.concat('\n').concat(el).concat('\n').concat(pageNumber));
				});
				return;
			}
			sendSms(user, intro);
			sendSms(user, 'Attached link:\n' + page.fullurl);
		}
	}

	private async changeLanguage(user: InstanceType<typeof User>, message: string) {
		message = message.trim();
		if (message != '') {
			const language = await wiki.languages();
			const selectLanguage = existInLanguage(language, message);
			if (selectLanguage != false) {
				sendSms(
					user,
					'You have selected ' + selectLanguage[Object.keys(selectLanguage)[0]] + ' language for Wikipedia.'
				);
				await WikipediaModel.updateOne(
					{ senderID: user._id },
					{ language: Object.keys(selectLanguage)[0] },
					{ upsert: true, setDefaultsOnInsert: true }
				);
			} else {
				sendSms(user, 'Language is unknown. Select another one. eg: fr, de, en');
			}
		} else {
			sendSms(user, 'no language specified, enter selectLanguage <language>,\n for exemple:\n selectLanguage en');
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

	private async event(user: InstanceType<typeof User>, message: string, language: string) {
		try {
			wiki.setLang(language);
			const events = await wiki.onThisDay({ type: 'selected' });
			if (events.selected == undefined) {
				sendSms(user, 'Error in Wikipedia');
				return;
			}
			if (message.trim() != '') {
				const target = parseInt(message.trim());
				if (isNaN(target) || target >= events.selected?.length - 1) {
					sendSms(user, 'Invalid number');
					return;
				} else {
					sendSms(
						user,
						`${bolderize(events.selected[target].year?.toString() ?? 'xxxx')}\n${
							events.selected[target].text
						}\nAttached links:${crearteLinkList(events.selected[target].pages)}\nPage [${target}/${
							events.selected.length - 1
						}]`
					);
				}
			} else {
				sendSms(
					user,
					`${bolderize(events.selected[0].year?.toString() ?? 'xxxx')}\n${
						events.selected[0].text
					}\nAttached links:${crearteLinkList(events.selected[0].pages)}\nPage [${0}/${
						events.selected.length - 1
					}]`
				);
			}
		} catch (error) {
			sendSms(user, 'Error in Wikipedia');
		}

		function crearteLinkList(page: wikiSummary[]) {
			return page.map(el => {
				return '\n' + el.normalizedtitle + ': ' + el.content_urls.mobile.page;
			});
		}
	}
}
export default wikipedia;
