export function normalizeHadiyyaText(value = '') {
	return value
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, ' ');
}