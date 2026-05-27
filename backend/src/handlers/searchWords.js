import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocumentClient,
	ScanCommand,
} from '@aws-sdk/lib-dynamodb';

import { normalizeHadiyyaText } from '../utils/normalizeHadiyyaText.js';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
	try {
		const query = event.queryStringParameters?.q || '';

		if (!query.trim()) {
			return response(400, {
				message: 'Search query is required',
			});
		}

		const normalizedQuery = normalizeHadiyyaText(query);

		const result = await dynamoDb.send(
			new ScanCommand({
				TableName: TABLE_NAME,
			})
		);

		const items = result.Items || [];

		const filtered = items.filter((item) => {
			const searchableText = [
				item.word,
				item.normalized_word,
				item.meaning_en,
				item.meaning_am,
				item.example_sentence_hadiyya,
				item.example_sentence_en,
				item.example_sentence_am,
				...(Array.isArray(item.tags) ? item.tags : []),
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return searchableText.includes(normalizedQuery);
		});

		return response(200, {
			query,
			count: filtered.length,
			results: filtered,
		});
	} catch (error) {
		console.error('SearchWordsError', error);

		return response(500, {
			message: 'Failed to search words',
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