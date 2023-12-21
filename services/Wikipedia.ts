import wiki, { content, wikiSummary } from 'wikipedia';
import Service from './Service';
import User from '../user/User';
import { bolderize } from '../tools/tools';

class Wikipedia extends Service {
	constructor() {
		super();
		this.name = 'wikipedia';
	}

	newAction(user: User, message: string) {
		if (message.startsWith('event')) {
			message = message.replace('event', '');
			this.event(user, message);
		} else {
			user.sendMessage(
				`You have selected the ${bolderize('wikipedia')} service. List of command: %0a
				${bolderize('event')}: reply by all event which happened on this date%0a%0a
				${bolderize('home')}: Go back to the main menu`
			);
		}
	}

	async event(user: User, message: string) {
		try {
			wiki.setLang('fr');
			const events = await wiki.onThisDay({ type: 'selected' });
			console.log(events);
			if (events.selected == undefined) {
				user.sendMessage('Error in wikipedia');
				return;
			}
			if (message.trim() != '') {
				const target = parseInt(message.trim());
				if (isNaN(target) || target >= (events.selected?.length - 1 ?? 0)) {
					user.sendMessage('Invalid number');
					return;
				} else {
					user.sendMessage(
						bolderize(events.selected[target].year?.toString() ?? 'xxxx') +
							'%0a' +
							events.selected[target].text +
							'%0aAttached links:' +
							crearteLinkList(events.selected[target].pages) +
							`%0aPage [${target}/${events.selected.length - 1}]`
					);
				}
			} else {
				user.sendMessage(
					bolderize(events.selected[0].year?.toString() ?? 'xxxx') +
						'%0a' +
						events.selected[0].text +
						'%0a%0aAttached links:' +
						crearteLinkList(events.selected[0].pages) +
						`%0aPage [0/${events.selected.length - 1}]`
				);
			}
		} catch (error) {
			user.sendMessage('Error in wikipedia');
			console.log(error);
		}
		function crearteLinkList(page: wikiSummary[]) {
			return page.map(el => {
				return '%0a' + el.normalizedtitle + ': ' + el.content_urls.mobile.page;
			});
		}
	}
}
export default Wikipedia;
