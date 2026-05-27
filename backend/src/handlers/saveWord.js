import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { normalizeHadiyyaText } from '../utils/normalizeHadiyyaText.js';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
	try {
		const body = JSON.parse(event.body || '{}');

		const word = body.word;
		const meaningEn = body.meaning_en || '';
		const meaningAm = body.meaning_am || '';
		const exampleSentence = body.example_sentence || '';
		const tags = body.tags || [];

		if (!word) {
			return response(400, {
				message: 'word is required',
			});
		}

		const normalizedWord = normalizeHadiyyaText(word);

		const item = {
			PK: `WORD#${normalizedWord}`,
			SK: 'METADATA',
			word,
			normalized_word: normalizedWord,
			meaning_en: meaningEn,
			meaning_am: meaningAm,
			example_sentence: exampleSentence,
			tags,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		await dynamoDb.send(
			new PutCommand({
				TableName: TABLE_NAME,
				Item: item,
			})
		);

		return response(201, {
			message: 'Word saved successfully',
			data: item,
		});
	} catch (error) {
		console.error('SaveWordError', error);

		return response(500, {
			message: 'Failed to save word',
			error: error.message,
		});
	}
};

function response(statusCode, body) {
	return {
		statusCode,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
		body: JSON.stringify(body),
	};
}