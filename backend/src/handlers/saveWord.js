import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	UpdateCommand,
	DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

import { normalizeHadiyyaText } from '../utils/normalizeHadiyyaText.js';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
	try {
		const body = JSON.parse(event.body || '{}');

		if (!body.word) {
			return response(400, {
				message: 'word is required',
			});
		}

		const word = body.word;
		const normalizedWord = normalizeHadiyyaText(word);
		const now = new Date().toISOString();

		const updateParts = [
			'#word = :word',
			'normalized_word = :normalized_word',
			'created_at = if_not_exists(created_at, :created_at)',
			'updated_at = :updated_at',
		];

		const expressionAttributeNames = {
			'#word': 'word',
		};

		const expressionAttributeValues = {
			':word': word,
			':normalized_word': normalizedWord,
			':created_at': now,
			':updated_at': now,
		};

		if (body.meaning_en !== undefined) {
			updateParts.push('meaning_en = :meaning_en');
			expressionAttributeValues[':meaning_en'] = body.meaning_en;
		}

		if (body.meaning_am !== undefined) {
			updateParts.push('meaning_am = :meaning_am');
			expressionAttributeValues[':meaning_am'] = body.meaning_am;
		}

		if (body.example_sentence_hadiyya !== undefined) {
			updateParts.push('example_sentence_hadiyya = :example_sentence_hadiyya');
			expressionAttributeValues[':example_sentence_hadiyya'] =
				body.example_sentence_hadiyya;
		}

		if (body.example_sentence_en !== undefined) {
			updateParts.push('example_sentence_en = :example_sentence_en');
			expressionAttributeValues[':example_sentence_en'] =
				body.example_sentence_en;
		}

		if (body.example_sentence_am !== undefined) {
			updateParts.push('example_sentence_am = :example_sentence_am');
			expressionAttributeValues[':example_sentence_am'] =
				body.example_sentence_am;
		}

		if (body.tags !== undefined) {
			updateParts.push('tags = :tags');
			expressionAttributeValues[':tags'] = Array.isArray(body.tags)
				? body.tags
				: [];
		}

		const result = await dynamoDb.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: {
					PK: `WORD#${normalizedWord}`,
					SK: 'METADATA',
				},
				UpdateExpression: `SET ${updateParts.join(', ')}`,
				ExpressionAttributeNames: expressionAttributeNames,
				ExpressionAttributeValues: expressionAttributeValues,
				ReturnValues: 'ALL_NEW',
			})
		);

		return response(200, {
			message: 'Word saved successfully',
			data: result.Attributes,
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