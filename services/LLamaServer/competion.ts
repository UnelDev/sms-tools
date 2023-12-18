import { readFileSync } from 'node:fs';
import { SchemaConverter } from './json-schema-to-grammar';

const args = process.argv.slice(2);
const grammarJsonSchemaFile = args.find((_, index) => args[index - 1] === '--grammar-json-schema');

const no_cached_prompt = args.find((_, index) => args[index - 1] === '--no-cache-prompt') ?? 'false';

const grammarFile = args.find((_, index) => args[index - 1] === '--grammar');

// Example usage: function,arguments
const grammarJsonSchemaPropOrder = args.find((_, index) => args[index - 1] === '--grammar-json-schema-prop-order');
const propOrder = grammarJsonSchemaPropOrder
	? grammarJsonSchemaPropOrder.split(',').reduce((acc, cur, index) => ({ ...acc, [cur]: index }), {})
	: {};

let grammar: string | null = null;
if (grammarJsonSchemaFile) {
	const schema = JSON.parse(readFileSync(grammarJsonSchemaFile, 'utf-8'));
	const converter = new SchemaConverter(propOrder);
	converter.visit(schema, '');
	grammar = converter.formatGrammar();
}
if (grammarFile) {
	grammar = readFileSync(grammarFile, 'utf-8');
}

// for cached prompt
let slot_id = -1;

const chat = [
	{
		human: 'Hello, Assistant.',
		assistant: 'Hello. How may I help you today?'
	},
	{
		human: 'Please tell me the largest city in Europe.',
		assistant: 'Sure. The largest city in Europe is Moscow, the capital of Russia.'
	}
];

const instruction = `A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful, detailed, and polite answers to the human's questions.`;

function format_prompt(question: string) {
	return `${instruction}\n${chat
		.map(m => `### Human: ${m.human}\n### Assistant: ${m.assistant}`)
		.join('\n')}\n### Human: ${question}\n### Assistant:`;
}

async function chat_completion(question: string, apiUrl: string) {
	const result = await fetch(`${apiUrl}/completion`, {
		method: 'POST',
		body: JSON.stringify({
			prompt: format_prompt(question),
			temperature: 0.2,
			top_k: 40,
			top_p: 0.9,
			n_keep: 48,
			n_predict: 256,
			cache_prompt: no_cached_prompt === 'false',
			slot_id: slot_id,
			stop: ['\n### Human:'], // stop completion after generating this
			grammar,
			stream: true
		})
	});

	if (!result.ok) {
		return;
	}

	let answer = '';

	for await (var chunk of (result as any).body) {
		const t = Buffer.from(chunk).toString('utf8');
		if (t.startsWith('data: ')) {
			const message = JSON.parse(t.substring(6));
			slot_id = message.slot_id;
			answer += message.content;
			if (message.stop) {
				if (message.truncated) {
					chat.shift();
				}
				break;
			}
		}
	}

	chat.push({ human: question, assistant: answer.trimStart() });
	return answer;
}

export default chat_completion;
