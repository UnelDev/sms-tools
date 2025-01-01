import { bgRed, blue, gray, red, yellow } from 'chalk';
import mongoose from 'mongoose';
import { Log } from '../models/logs.model';
import { getFileName } from './tools';

type WarningLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// Information:
// (2023-04-28T11:27:47.509Z) [ERROR]> bad password for test@exemple.com
// (2023-04-28T11:27:47.509Z) [INFO]> test@exemple.com connected
/**
 * @param impact The impact level of the log
 * Impact Levels:
 * - INFO: No impact on the system or user.
 * - WARNING: Minor impact that can be easily corrected.
 * - ERROR: Moderate impact that requires attention.
 * - CRITICAL: Significant impact that can cause damage or data loss.
 * @param location The file name where the log is called (use **__filename**)
 * @param text The text to log
 */
export async function log(
	text: string,
	impact: WarningLevel = 'DEBUG',
	location: string,
	data?: Object | null,
	initiator: 'root' | String = 'root'
) {
	if (process.env.JEST_WORKER_ID != undefined) return;
	let bddSaving: Promise<InstanceType<typeof Log>> | undefined = undefined;
	if (mongoose.connection.readyState === 2) {
		const log = new Log({
			impact,
			location: getFileName(location ?? 'no location'),
			text,
			initiator,
			data
		});
		bddSaving = log.save();
	}
	location = getFileName(location ?? 'no location');
	const date = new Date().toLocaleDateString('en-GB', {
		timeZone: 'Europe/Paris',
		year: '2-digit',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
	let coloredImpact = '';
	switch (impact) {
		case 'INFO':
			coloredImpact = blue(impact);
			break;
		case 'WARNING':
			coloredImpact = yellow(impact);
			break;
		case 'ERROR':
			coloredImpact = red(impact);
			break;
		case 'CRITICAL':
			coloredImpact = bgRed.white(impact);
			break;
		case 'DEBUG':
			coloredImpact = gray(impact);
			break;
	}

	console.log(
		`(${date}) ${location ? '[' + location + ']' : ''}${
			initiator != 'root' ? ' [' + initiator + ']' : ''
		}> ${coloredImpact} ${text}\n`
	);
	// append log
	if (bddSaving) {
		await bddSaving;
	}
}
